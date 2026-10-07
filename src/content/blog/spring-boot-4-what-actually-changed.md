---
title: 'Spring Boot 4: What Actually Changed? (3.5 → 4.1)'
youtube: 'Mt0vlYGTacU'
cover: '/covers/spring-boot-4-what-actually-changed.jpg'
description: 'One real Spring Boot 3.5 orders service upgraded to 4.1, step by step, following Spring''s own migration guide. Every change sorted into what breaks loudly, what breaks silently, and what you can now opt into, with the 3.5 and 4.1 code side by side.'
pubDate: 2026-10-07
sheet: '/downloads/spring-boot-4-what-actually-changed.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-boot-4-upgrade'
tags: ['spring-boot', 'java', 'migration']
series: 'Spring Boot 4 for Working Java Developers'
episode: 1
duration: '14:49'
draft: false
---

A Spring Boot orders service, upgraded from 3.5 to 4.1. The build succeeds and
all 29 unit and slice tests pass:

```text
$ ./mvnw clean package
[INFO] Tests run: 29, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

The application starts on Tomcat. Then the first order:

```text
HTTP/1.1 500
{"timestamp":"2026-10-07T16:24:35.681Z","status":500,"error":"Internal Server Error","path":"/orders"}
```

and in the log, `ERROR: relation "orders" does not exist`. Same code, same
Flyway dependency. On 3.5 the database was migrated. On 4.1 it never was, and
nothing in the build said a word.

This article is the written version of the episode. It follows Spring's own
migration guide in its order, and sorts everything we hit into three kinds:

| Kind | Meaning |
| --- | --- |
| **Loud** | the compiler, the tests or startup stop you |
| **Silent** | compile, unit tests and startup all pass, but behaviour the app relied on is gone |
| **Opt-in** | nothing breaks; Boot 4 gives you something new |

Silent does not mean undocumented. Spring documents every silent change below.
It means our compile, unit test and startup gates did not catch it.

Everything here ran for real, and every error, log line, test count and HTTP
response quoted below is copied from the transcripts in the repository's
`evidence/` folder. You can replay every step yourself; the last section shows
how.

## Versions, at the time of writing

At the time of writing, in October 2026: Spring Boot 4.1.1 is the current
release. Spring Boot 4.0.0 shipped on 20 November 2025, and 3.5.16 was the last
open source release of the 3.5 line. Spring Boot 4.2 is planned for November
2026. The build below uses Java 21 (Zulu 21.0.10), PostgreSQL 17 and Maven
3.9.11. Newer versions may behave differently, so check the release notes for
the version you are actually running.

## The application

A small orders service in `com.example.orders`:

- `POST /orders` places an order and asks a payments service to authorise the
  total. `GET /orders/{id}` reads it back.
- Spring MVC, JPA on PostgreSQL, a Flyway migration, Actuator.
- A JSON contract the clients rely on: snake_case field names, dates as
  `dd/MM/yyyy`, and money written as one string, `"36.50 GBP"`, by a custom
  serializer.
- `OrderService` depends on a one method `PaymentGateway` interface;
  `HttpPaymentGateway` implements it over HTTP with a `RestTemplate`.
- On 3.5 it runs on Undertow, and the tests use `@MockBean`, `@WebMvcTest`,
  `@AutoConfigureMockMvc`, `@RestClientTest` and `TestRestTemplate`.
- Unit and slice tests run with `./mvnw package`. Integration tests against a
  real PostgreSQL in Testcontainers run with `./mvnw verify`.

On 3.5.16, `./mvnw clean verify` reports 29 unit and slice tests and 9
integration tests, all green.

## Step 1: the latest 3.5, and clear the deprecations

Spring's guide starts on the latest 3.5, because Boot 4 removes the APIs
deprecated in the 3.x line. Maven Central listed 3.5.16 as the newest 3.5
release. And the compiler had already told us what was coming:

```text
[WARNING] src/main/java/com/example/orders/payments/HttpPaymentGateway.java:[31,17] setConnectTimeout(java.time.Duration) in org.springframework.boot.web.client.RestTemplateBuilder has been deprecated and marked for removal
[WARNING] src/main/java/com/example/orders/payments/HttpPaymentGateway.java:[32,17] setReadTimeout(java.time.Duration) in org.springframework.boot.web.client.RestTemplateBuilder has been deprecated and marked for removal
[WARNING] src/test/java/com/example/orders/order/OrderControllerWebMvcTest.java:[37,6] org.springframework.boot.test.mock.mockito.MockBean in org.springframework.boot.test.mock.mockito has been deprecated and marked for removal
```

`@MockBean` was deprecated in 3.4 and is removed in 4.0. Its replacement,
`@MockitoBean`, comes from Spring Framework and already works on 3.5, so the
fix is made here, where it is easy to verify:

```java
// Spring Boot 3.5, before
import org.springframework.boot.test.mock.mockito.MockBean;

    @MockBean
    private OrderService service;
```

```java
// Spring Boot 3.5, after (and unchanged on 4.1)
import org.springframework.test.context.bean.override.mockito.MockitoBean;

    @MockitoBean
    private OrderService service;
```

The timeouts become `connectTimeout(...)` and `readTimeout(...)`. After step 1
the build reports `Deprecation warnings left (showDeprecation is on in the pom): 0`.

If you skip this step, the 3.5 tests compiled against 4.1 stop with:

```text
[ERROR] src/test/java/com/example/orders/order/OrderControllerWebMvcTest.java:[24,50] package org.springframework.boot.test.mock.mockito does not exist
[ERROR] src/test/java/com/example/orders/order/OrderControllerWebMvcTest.java:[37,6] cannot find symbol
[ERROR]   symbol:   class MockBean
```

## Step 2: the properties migrator, and read its report

Step 1 also adds `spring-boot-properties-migrator` as a runtime dependency. At
startup it analyses your configuration and reports the deprecated or renamed
keys it can identify. On 4.1 its report for this app was one key:

```text
The use of configuration keys that are no longer supported was found in the environment:

Property source 'Config resource 'class path resource [application.properties]' via location 'optional:classpath:/'':
	Key: server.error.include-message
		Line: 16
		Reason: Replacement key 'spring.web.error.include-message' uses an incompatible target type
```

The migrator can keep an old key working while you fix it. This one it only
reported, because the new key takes a different type, and it did not apply it.
So until we renamed the key, error responses quietly lost their message. On 3.5:

```text
{"timestamp":"2026-10-07T16:23:44.698+00:00","status":404,"error":"Not Found","message":"Not Found","path":"/orders/999"}
```

On 4.1, before the rename:

```text
{"timestamp":"2026-10-07T16:25:14.377Z","status":404,"error":"Not Found","path":"/orders/999"}
```

The fix is the rename, done at the end of the upgrade along with removing the
migrator:

```properties
# Spring Boot 3.5
server.error.include-message=always

# Spring Boot 4.1
spring.web.error.include-message=always
```

Afterwards the 404 carries a message again, `"message":"No order with id 999"`.
It is not the same text as on 3.5, which said `"Not Found"`. We recorded that
and did not investigate it. Read the report. Do not assume the migrator patched
it.

## Change the parent, and nothing else

```diff
   <parent>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-parent</artifactId>
-    <version>3.5.16</version>
+    <version>4.1.1</version>
     <relativePath/>
   </parent>
```

Maven cannot even read the project:

```text
[ERROR] 'dependencies.dependency.version' for org.springframework.boot:spring-boot-starter-undertow:jar is missing. @ line 38, column 17
[ERROR] 'dependencies.dependency.version' for org.testcontainers:junit-jupiter:jar is missing. @ line 86, column 17
[ERROR] 'dependencies.dependency.version' for org.testcontainers:postgresql:jar is missing. @ line 91, column 17
```

**Undertow.** Spring Boot 4 moved to Servlet 6.1 and dropped Undertow support,
so the starter no longer exists:

```text
  spring-boot-starter-undertow 3.5.16  HTTP 200
  spring-boot-starter-undertow 4.0.0   HTTP 404
  spring-boot-starter-undertow 4.1.1   HTTP 404
```

We switch to Tomcat, the default, by removing the exclusion and the Undertow
starter.

**Testcontainers.** Boot 4.1.1 manages Testcontainers 2, and Testcontainers 2
renamed these modules, so the old names are no longer managed. That one is
Testcontainers, not Spring:

```diff
     <dependency>
       <groupId>org.testcontainers</groupId>
-      <artifactId>junit-jupiter</artifactId>
+      <artifactId>testcontainers-junit-jupiter</artifactId>
       <scope>test</scope>
     </dependency>
     <dependency>
       <groupId>org.testcontainers</groupId>
-      <artifactId>postgresql</artifactId>
+      <artifactId>testcontainers-postgresql</artifactId>
       <scope>test</scope>
     </dependency>
```

## The main code stops compiling: Jackson 3 and the REST client

Now the project reads, and the main code does not compile:

```text
[ERROR] src/main/java/com/example/orders/config/JacksonConfig.java:[9,38] package com.fasterxml.jackson.databind does not exist
[ERROR] src/main/java/com/example/orders/money/MoneySerializer.java:[9,40] cannot find symbol
[ERROR]   symbol:   class JsonComponent
[ERROR]   location: package org.springframework.boot.jackson
[ERROR] src/main/java/com/example/orders/payments/HttpPaymentGateway.java:[10,43] package org.springframework.boot.web.client does not exist
```

Jackson 3 moved from `com.fasterxml.jackson` to `tools.jackson`, and
`@JsonComponent` became `@JacksonComponent`. The money serializer, before and
after:

```java
// Spring Boot 3.5, Jackson 2
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.springframework.boot.jackson.JsonComponent;

@JsonComponent
public class MoneySerializer extends JsonSerializer<Money> {

    @Override
    public void serialize(
            Money value,
            JsonGenerator gen,
            SerializerProvider serializers) throws IOException {
        gen.writeString(value.display());
    }
}
```

```java
// Spring Boot 4.1, Jackson 3
import tools.jackson.core.JsonGenerator;
import tools.jackson.databind.SerializationContext;
import tools.jackson.databind.ValueSerializer;

import org.springframework.boot.jackson.JacksonComponent;

@JacksonComponent
public class MoneySerializer extends ValueSerializer<Money> {

    @Override
    public void serialize(
            Money value,
            JsonGenerator gen,
            SerializationContext context) {
        gen.writeString(value.display());
    }
}
```

Boot's REST client support is modular now too. `RestTemplateBuilder` lives in
`org.springframework.boot.restclient` and comes from its own starter. While we
are in the POM, `spring-boot-starter-web` becomes `spring-boot-starter-webmvc`:

```diff
     <dependency>
       <groupId>org.springframework.boot</groupId>
-      <artifactId>spring-boot-starter-web</artifactId>
+      <artifactId>spring-boot-starter-webmvc</artifactId>
+    </dependency>
+    <dependency>
+      <groupId>org.springframework.boot</groupId>
+      <artifactId>spring-boot-starter-restclient</artifactId>
     </dependency>
```

On 4.1 the compiler also flags `rootUri(java.lang.String) ... has been
deprecated and marked for removal`; `baseUri` replaces it.

## The tests stop compiling: test support is modular

```text
[ERROR] src/test/java/com/example/orders/order/OrderControllerWebMvcTest.java:[22,63] package org.springframework.boot.test.autoconfigure.web.servlet does not exist
[ERROR] src/test/java/com/example/orders/order/OrdersHttpIT.java:[14,48] package org.springframework.boot.test.web.client does not exist
[ERROR] src/test/java/com/example/orders/payments/HttpPaymentGatewayTest.java:[15,62] package org.springframework.boot.test.autoconfigure.web.client does not exist
```

The test slices moved into their own modules, with their own test starters, and
the packages moved with them:

```diff
     <dependency>
       <groupId>org.springframework.boot</groupId>
-      <artifactId>spring-boot-starter-test</artifactId>
+      <artifactId>spring-boot-starter-webmvc-test</artifactId>
+      <scope>test</scope>
+    </dependency>
+    <dependency>
+      <groupId>org.springframework.boot</groupId>
+      <artifactId>spring-boot-starter-restclient-test</artifactId>
       <scope>test</scope>
     </dependency>
```

| Annotation or class | Spring Boot 3.5 package | Spring Boot 4.1 package |
| --- | --- | --- |
| `@WebMvcTest`, `@AutoConfigureMockMvc` | `org.springframework.boot.test.autoconfigure.web.servlet` | `org.springframework.boot.webmvc.test.autoconfigure` |
| `@RestClientTest` | `org.springframework.boot.test.autoconfigure.web.client` | `org.springframework.boot.restclient.test.autoconfigure` |
| `TestRestTemplate` | `org.springframework.boot.test.web.client` | `org.springframework.boot.resttestclient` |

A full `@SpringBootTest` also no longer hands you `TestRestTemplate` just
because it is on the class path. You ask for it with its own annotation:

```java
@SpringBootTest(webEnvironment = DEFINED_PORT, properties = {
        "server.port=18080",
        "payments.base-url=http://localhost:18080"})
@AutoConfigureTestRestTemplate
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("local-stub")
class OrdersHttpIT {

    @Autowired
    private TestRestTemplate rest;
```

And there is a new option, `RestTestClient`: the same end to end assertion,
written against the running application with one fluent client.

```java
@SpringBootTest(webEnvironment = DEFINED_PORT, properties = {
        "server.port=18081",
        "spring.http.serviceclient.payments.base-url="
                + "http://localhost:18081"})
@AutoConfigureRestTestClient
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("local-stub")
class OrdersRestTestClientIT {

    @Autowired
    private RestTestClient client;

    @Test
    void placesAnOrderEndToEnd() {
        client.post().uri("/orders")
                .contentType(APPLICATION_JSON)
                .body(TestOrders.SARAH)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.payment_status")
                .isEqualTo("AUTHORISED")
                .jsonPath("$.total")
                .isEqualTo("36.50 GBP");
    }
}
```

Every one of these stopped the build, every one has a documented fix, and the
compiler pointed straight at it. These are the easy problems. With them fixed
(and the Jackson mapper declared as a `JsonMapper`, more on that below), we are
back where we started: build green, 29 unit and slice tests green, the
application starts. And the first order fails.

## What breaks silently: Flyway

Here is the dependency, the same line as on 3.5:

```xml
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-core</artifactId>
    </dependency>
```

On 3.5 that was enough. Spring Boot saw Flyway on the class path and configured
it, and startup said so:

```text
o.f.core.internal.command.DbMigrate      : Successfully applied 1 migration to schema "public", now at version v1 (execution time 00:00.012s)
```

On 4.1 the startup log has no Flyway line at all:

```text
 :: Spring Boot ::                (v4.1.1)
INFO 50720 --- [orders] [           main] o.s.boot.tomcat.TomcatWebServer          : Tomcat initialized with port 8080 (http)
INFO 50720 --- [orders] [           main] o.s.boot.tomcat.TomcatWebServer          : Tomcat started on port 8080 (http) with context path '/'
INFO 50720 --- [orders] [           main] com.example.orders.OrdersApplication     : Started OrdersApplication in 2.93 seconds (process running for 3.217)
```

and the first `POST /orders` returns 500:

```text
org.postgresql.util.PSQLException: ERROR: relation "orders" does not exist
```

The fix is one dependency:

```diff
     <dependency>
-      <groupId>org.flywaydb</groupId>
-      <artifactId>flyway-core</artifactId>
+      <groupId>org.springframework.boot</groupId>
+      <artifactId>spring-boot-starter-flyway</artifactId>
     </dependency>
```

Restart, and there it is:

```text
o.f.core.internal.command.DbMigrate      : Successfully applied 1 migration to schema "public", now at version v1 (execution time 00:00.008s)
```

The first order returns `HTTP/1.1 201`, and all 39 tests are green (29 unit and
slice, 10 integration).

So what actually changed? Not Flyway. The contract. Spring Boot 4 is split into
modules, one per technology, and the Flyway integration now lives in its own
module. For technologies like Flyway, that used to switch on from the library
alone, Boot 4 now expects its own module, through the starter.

You can see the split in this app's jar, `BOOT-INF/lib`:

```text
3.5  all jars:  84, 58093331 bytes | spring-boot jars:  7, 5647786 bytes
4.1  all jars:  85, 55821060 bytes | spring-boot jars: 26, 4066222 bytes
```

On 3.5, `spring-boot-autoconfigure` is 2,088,460 bytes. On 4.1 it is 372,740
bytes, beside per technology modules such as `spring-boot-flyway`,
`spring-boot-jackson`, `spring-boot-webmvc` and `spring-boot-restclient`. (The
4.1 listing is the finished upgrade, so it also carries the opt-ins below.)

If you need breathing room, Spring ships classic starters,
`spring-boot-starter-classic` and `spring-boot-starter-test-classic`, that bring
the old broad class path back while you fix things. Use them as a bridge, then
take them out.

### The real lesson: which gate caught it

In this project one gate did catch it: the integration tests, running against a
real PostgreSQL in a container. On the same commit, `./mvnw verify` failed at
once:

```text
[ERROR] com.example.orders.order.OrdersApiIT.placesAnOrder -- Time elapsed: 0.092 s <<< ERROR!
    Request processing failed: org.springframework.dao.InvalidDataAccessResourceUsageException: could not execute statement [ERROR: relation "orders" does not exist
[ERROR]   OrdersRestTestClientIT.placesAnOrderEndToEnd:38 Status expected:<201 CREATED> but was:<500 INTERNAL_SERVER_ERROR>
[ERROR] Tests run: 10, Failures: 3, Errors: 5, Skipped: 0
[INFO] BUILD FAILURE
```

Unit tests with a mocked repository never touch the schema, so they cannot see
a migration that did not run. If your pipeline has no test against a real
database, this reaches production.

## Jackson 3: the second silent change

The API has a contract with its clients: snake_case field names, and dates
written the UK way, day, month, year. On 3.5 our own Jackson `ObjectMapper` bean
set those rules, and Spring's web layer used it:

```java
// Spring Boot 3.5
@Configuration
public class JacksonConfig {

    public static final DateTimeFormatter UK_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Bean
    public ObjectMapper objectMapper(
            Jackson2ObjectMapperBuilder builder) {
        var writer = new LocalDateSerializer(UK_DATE);
        var reader = new LocalDateDeserializer(UK_DATE);
        return builder
                .propertyNamingStrategy(SNAKE_CASE)
                .featuresToDisable(WRITE_DATES_AS_TIMESTAMPS)
                .serializerByType(LocalDate.class, writer)
                .deserializerByType(LocalDate.class, reader)
                .build();
    }
}
```

On 4.1, with the bean ported to Jackson 3 and still declared as an
`ObjectMapper`, the code compiles and the application starts.
Here is `GET /orders/1`, byte for byte, on each side:

```text
boot-3.5:                    {"id":1,"customer_name":"Sarah Thompson","items":[{"sku":"KETTLE-01","quantity":1,"unit_price":"24.50 GBP"},{"sku":"MUG-02","quantity":2,"unit_price":"6.00 GBP"}],"total":"36.50 GBP","placed_on":"07/10/2026","payment_status":"AUTHORISED"}
boot-4.1-objectmapper-bean:  {"id":1,"customerName":"Sarah Thompson","items":[{"sku":"KETTLE-01","quantity":1,"unitPrice":"24.50 GBP"},{"sku":"MUG-02","quantity":2,"unitPrice":"6.00 GBP"}],"total":"36.50 GBP","placedOn":"2026-10-07","paymentStatus":"AUTHORISED"}
```

The field names switched to camelCase. The date switched to the ISO form, year
first. And an old client posting snake_case gets `HTTP/1.1 400`.

Spring Boot 4 builds its JSON with Jackson 3 and auto-configures a `JsonMapper`.
Our own `ObjectMapper` bean no longer replaces it. Spring's migration guide says
so. Our rules were simply not applied.

Declaring the bean as a `JsonMapper` instead, as the migration guide describes,
does bring the rules back; that is how the build went green earlier. For this
application, though, the better migration is not to replace Boot's mapper at
all. We customise the one it already builds:

```java
// Spring Boot 4.1
@Configuration
public class JacksonConfig {

    public static final DateTimeFormatter UK_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Bean
    public JsonMapperBuilderCustomizer ordersJsonContract() {
        return builder -> builder
                .propertyNamingStrategy(SNAKE_CASE)
                .disable(WRITE_DATES_AS_TIMESTAMPS)
                .addModule(ukDates());
    }

    private static SimpleModule ukDates() {
        return new SimpleModule("uk-dates")
                .addSerializer(LocalDate.class,
                        new LocalDateSerializer(UK_DATE))
                .addDeserializer(LocalDate.class,
                        new LocalDateDeserializer(UK_DATE));
    }
}
```

The imports that changed are worth copying exactly:

```java
import static tools.jackson.databind.PropertyNamingStrategies.SNAKE_CASE;
import static tools.jackson.databind.cfg.DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS;

import tools.jackson.databind.ext.javatime.deser.LocalDateDeserializer;
import tools.jackson.databind.ext.javatime.ser.LocalDateSerializer;
import tools.jackson.databind.module.SimpleModule;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
```

Spring Boot keeps building the one `JsonMapper`, with `@JacksonComponent`
serializers and the `spring.jackson.*` properties applied, and adds our rules
to it. Same request, and the response is the same as on 3.5:

```text
3.5 and 4.1 with the customizer: IDENTICAL
3.5 and 4.1 with the ObjectMapper bean: DIFFERENT
```

What caught it here was a test that asserts the JSON itself: the field name,
the date, the exact text the client receives. Two `@WebMvcTest` contract tests
failed:

```text
[ERROR]   OrderControllerWebMvcTest.createsAnOrder:52 Status expected:<201> but was:<400>
[ERROR]   OrderControllerWebMvcTest.writesTheAgreedJsonContract:63 No value at JSON path "$.customer_name"
```

A test that only checks the Java object would have passed, and the contract
would have broken in production.

## What you can now opt into

That is the migration. Now the part that makes the upgrade worth more than
staying supported. Three things, and each one replaces code you would otherwise
write yourself.

### API versioning, built into Spring MVC

The version is an attribute on the mapping:

```java
    @GetMapping(path = "/{id}", version = "1")
    public OrderView find(@PathVariable long id) {
        return service.find(id);
    }

    @GetMapping(path = "/{id}", version = "2")
    public OrderSummaryV2 findV2(@PathVariable long id) {
        return OrderSummaryV2.of(service.find(id));
    }
```

and two properties say where it comes from and what the default is:

```properties
spring.mvc.apiversion.use.header=X-Version
spring.mvc.apiversion.default=1
```

The results, from the running application:

```text
$ curl -i http://localhost:8080/orders/1
HTTP/1.1 200
{"id":1,"customer_name":"Sarah Thompson","items":[{"sku":"KETTLE-01","quantity":1,"unit_price":"24.50 GBP"},{"sku":"MUG-02","quantity":2,"unit_price":"6.00 GBP"}],"total":"36.50 GBP","placed_on":"07/10/2026","payment_status":"AUTHORISED"}

$ curl -i http://localhost:8080/orders/1 -H 'X-Version: 2'
HTTP/1.1 200
{"id":1,"customer_name":"Sarah Thompson","item_count":3,"total":"36.50 GBP","placed_on":"07/10/2026","payment_status":"AUTHORISED"}

$ curl -i http://localhost:8080/orders/1 -H 'X-Version: 3'
HTTP/1.1 400
{"timestamp":"2026-10-07T16:26:46.175Z","status":400,"error":"Bad Request","message":"Invalid API version: '3.0.0'.","path":"/orders/1"}

$ curl -i http://localhost:8080/orders/1 -H 'X-Version: abc'
HTTP/1.1 400
{"timestamp":"2026-10-07T16:26:46.190Z","status":400,"error":"Bad Request","message":"Invalid API version: 'abc'.","path":"/orders/1"}
```

No header gets the default, version 1. Version 2 gets the new shape. Version 3,
which this application does not support, gets a 400, and so does the malformed
value.

You can also mark a version as deprecated, and responses then carry the
standard `Deprecation`, `Sunset` and `Link` headers. Two details. It takes a
small handler bean, not a property:

```java
    @Bean
    public ApiVersionDeprecationHandler deprecationHandler() {
        StandardApiVersionDeprecationHandler handler =
                new StandardApiVersionDeprecationHandler();
        handler.configureVersion("1")
                .setDeprecationDate(DEPRECATED_ON)
                .setSunsetDate(SUNSET_ON)
                .setDeprecationLink(MIGRATION_GUIDE);
        return handler;
    }
```

```text
Deprecation: @1790812800
Link: <https://example.com/orders-api/v2-migration>; rel="deprecation"; type="text/html"
Sunset: Thu, 1 Apr 2027 00:00:00 GMT
```

And requests with no version resolve to the default, so the deprecation headers
land on them too. In our run they appeared on `POST /orders`, which has no
`version` attribute at all, and on the 404 for an unknown order.

### HTTP service clients

The call to the payments service was a `RestTemplate` wrapped by hand:

```java
// Before: a RestTemplate built and called by hand
@Component
public class HttpPaymentGateway implements PaymentGateway {

    private static final String PATH =
            "/payments/authorisations";

    private final RestTemplate restTemplate;

    public HttpPaymentGateway(
            RestTemplateBuilder builder,
            @Value("${payments.base-url}") String baseUrl) {
        this.restTemplate = builder
                .baseUri(baseUrl)
                .connectTimeout(Duration.ofSeconds(2))
                .readTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public PaymentStatus authorise(long orderId, Money amount) {
        AuthoriseRequest request = new AuthoriseRequest(
                orderId, amount.amount(), amount.currency());
        AuthorisationResponse response = restTemplate
                .postForObject(PATH, request,
                        AuthorisationResponse.class);
        if (response == null) {
            String message = "Payments returned an empty body"
                    + " for order " + orderId;
            throw new IllegalStateException(message);
        }
        return PaymentStatus.valueOf(response.status());
    }
}
```

Now it is an interface: one method, the path, the body.

```java
@HttpExchange("/payments")
interface PaymentsApi {

    @PostExchange("/authorisations")
    ResponseEntity<AuthorisationResponse> authorise(
            @RequestBody AuthoriseRequest request);
}
```

```java
@Configuration
@ImportHttpServices(
        group = "payments",
        types = PaymentsApi.class)
public class PaymentsClientConfig {
}
```

```properties
spring.http.serviceclient.payments.base-url=\
    http://localhost:${server.port:8080}
```

Spring creates a client proxy for the interface, and the gateway just calls it.
`POST /orders` still returns 201 with `"payment_status":"AUTHORISED"`, and all
the integration tests stay green. This is not a forced move off `RestTemplate`,
which still works in 4.1. It is less code for the same call.

### Null safety with JSpecify and NullAway

Spring Framework 7 marks which of its methods can return null, using JSpecify
annotations. That is information a tool can enforce. We mark the payments
package as non-null by default:

```java
@NullMarked
package com.example.orders.payments;

import org.jspecify.annotations.NullMarked;
```

and run NullAway through Error Prone in the build:

```xml
    <nullaway.checks>
      -XepDisableAllChecks -Xep:NullAway:ERROR
    </nullaway.checks>
    <nullaway.options>
      -XepOpt:NullAway:OnlyNullMarked=true
      -XepOpt:NullAway:JSpecifyMode=true
    </nullaway.options>
```

(The full compiler plugin configuration is in the repository's `pom.xml`.)
The first version of the `@HttpExchange` gateway used the response body
straight away, and with NullAway in the build that line fails:

```java
        AuthorisationResponse response =
                api.authorise(request).getBody();
        return PaymentStatus.valueOf(response.status());
```

```text
[ERROR] src/main/java/com/example/orders/payments/HttpPaymentGateway.java:[28,46] [NullAway] dereferenced expression 'response' is @Nullable
```

`getBody()` can return null, and the next line uses the response without
checking. We check it, and throw a clear error if the payments service sends
nothing back:

```java
        AuthorisationResponse response =
                api.authorise(request).getBody();
        if (response == null) {
            String message = "Payments returned an empty body"
                    + " for order " + orderId;
            throw new IllegalStateException(message);
        }
        return PaymentStatus.valueOf(response.status());
```

and the build passes. Nothing magic happened to Java. Framework 7 now publishes
that nullness contract in a form tools like NullAway can enforce.

One practical note: NullAway's JSpecify mode needs a JDK 21.0.8 or newer, or
any JDK 22+. On 21.0.5 the compiler stops with "The flag
-XDaddTypeAnnotationsToSymbol=true was passed, but it is not supported by the
running JDK". The recordings used Zulu 21.0.10.

## The migration ledger

Everything we hit, with the gate that caught it:

| Change | Kind | What caught it |
| --- | --- | --- |
| No Undertow starter in Boot 4 | Loud | Maven could not read the POM |
| Testcontainers 2 renamed its modules (Testcontainers, not Spring) | Loud | Maven could not read the POM |
| Jackson 3 packages, `@JsonComponent` to `@JacksonComponent` | Loud | the compiler |
| `RestTemplateBuilder` moved to the REST client module | Loud | the compiler |
| Test slices and `TestRestTemplate` moved to test modules | Loud | the compiler, on the tests |
| `@MockBean` removed | Loud, if step 1 is skipped | the compiler; 3.5 already warned |
| `flyway-core` alone no longer runs migrations | Silent | only the Testcontainers integration tests, against a real database |
| Our `ObjectMapper` bean no longer shapes the HTTP JSON | Silent | only the web tests that assert the JSON on the wire |
| `server.error.include-message` | Reported, not repaired | the properties migrator's report; error bodies lost their message until the key was renamed |
| API versioning | Opt-in | |
| HTTP service clients | Opt-in | |
| JSpecify null safety with NullAway | Opt-in | |

## The checklist, in the order that works

1. Get onto the latest 3.5.
2. Clear the Spring Boot 3 deprecations, while the fix is easy to verify.
3. Run the properties migrator, and read its report.
4. Check every technology starter. A library on the class path is no longer
   enough for technologies like Flyway.
5. Check the test starters, and ask for `TestRestTemplate` and MockMvc
   explicitly.
6. Test your database migrations against a real database.
7. Assert the JSON, not just the objects.
8. Then remove the bridges: the properties migrator, and the classic starters
   if you used them.

## Not covered

This app does not use them, so this upgrade does not exercise them. If yours
does, read the matching release notes:

- Spring Security 7
- Hibernate 7 behaviour changes beyond what this app touches
- gRPC support, new in Spring Boot 4.1
- `@Retryable`, `@ConcurrencyLimit` and `@EnableResilientMethods` (resilience
  now lives in Spring Framework 7)
- Virtual threads
- Liveness and readiness probes now on by default (visible in the transcripts,
  where `/actuator/health/liveness` returns 404 on 3.5 and 200 on 4.1, but not
  discussed)
- Spring Batch, Kafka, AMQP, MongoDB, Redis and Session property moves

## The repository, and replaying the upgrade

All the code is in
[spring-boot-4-upgrade](https://github.com/code-with-sam-dev/spring-boot-4-upgrade).
Every step of the upgrade is its own branch, and the steps inside a step are
tags, so you can check out any point and see exactly what the build, the tests
and the running app do.

| Branch | What changes | What happens |
| --- | --- | --- |
| `step-0-boot-3.5` | The app on 3.5.16 | Green, with deprecation warnings for `setConnectTimeout`, `setReadTimeout` and `@MockBean` |
| `step-1-latest-3.5` | Deprecated calls removed, `@MockitoBean`, properties migrator added | Green, no deprecation warnings |
| `step-2-boot-4.1-parent` | Only the parent version, 3.5.16 to 4.1.1 | Maven cannot read the POM |
| `step-3-loud-fixed` | Tomcat, Testcontainers 2 names, Jackson 3, the webmvc and restclient starters, the test starters (tags `step-3a-tomcat` to `step-3d-jsonmapper`) | `./mvnw package` is green and the app starts; the first `POST /orders` returns 500; `./mvnw verify` catches it |
| `step-4-flyway-starter` | `spring-boot-starter-flyway` | Migrations run, everything green |
| `step-5-jackson` | `JsonMapperBuilderCustomizer` (tag `step-5a-objectmapper-probe` is the `ObjectMapper` bean probe) | Green, and the JSON matches 3.5 |
| `step-6-opt-in`, also `main` | API versioning, the `@HttpExchange` client, NullAway, the renamed property, migrator removed (tags `step-6a` to `step-6e`) | Green, the finished upgrade |

To see the diff a step introduces:

```bash
git diff step-3b-jackson-imports step-3c-test-starters
```

To replay one step by hand:

```bash
git checkout step-3-loud-fixed

./mvnw clean package            # unit and slice tests
./mvnw verify                   # plus the Testcontainers integration tests

docker compose up -d --wait     # PostgreSQL on localhost:5442
java -jar target/orders-0.0.1-SNAPSHOT.jar --spring.profiles.active=local-stub

curl -i -X POST localhost:8080/orders -H 'Content-Type: application/json' \
  -d '{"customer_name":"Sarah Thompson","currency":"GBP","items":[{"sku":"KETTLE-01","quantity":1,"unit_price":24.50}]}'

docker compose down -v
```

The `local-stub` profile runs a stand-in payments service inside the same jar,
so the demo needs one machine and nothing else. Without that profile it does
not exist.

To replay the whole upgrade, run the script:

```bash
scripts/verify.sh            # every step
scripts/verify.sh step-3     # one step: step-0 ... step-6, or jars
```

Each step is checked out into a temporary git worktree, so your working copy is
left alone. For each step the script builds, runs the tests, starts the app
against a fresh database, sends the requests with curl and stops it again. It
writes the transcripts this article quotes into `evidence/`, and
`evidence/CLAIMS.md` is the ledger: each claim, what 3.5 did, what 4.1 did, the
Spring page that documents it, and its kind.

You need Docker, ports 8080 and 5442 free, and a JDK 21.0.8 or newer (or any
JDK 22+) for the NullAway steps. Set `VERIFY_JAVA_HOME` to choose the JDK. The
Maven wrapper downloads Maven itself.

The free design sheet has the before and after code, the ledger and the
checklist on one page.

Spring Boot 4 did not make this service a different application. It moved the
boundaries. Dependencies are explicit, tests are modular, JSON moved a major
version, and the framework gives you things you used to build yourself.
