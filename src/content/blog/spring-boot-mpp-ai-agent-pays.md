---
title: 'I Built a Spring Boot AI Agent That Pays for APIs: HTTP 402, MPP and MCP in Java'
description: 'A Spring Boot courier API answers HTTP 402 Payment Required. A hand-written Java client reads the challenge, pays five test cents on the Tempo test network and asks again with proof of payment. An AI assistant calls it over MCP. Then it breaks twice: it pays five dollars when the price changes, and pays twice when a paid response is lost. The fixes are a payment policy that refuses before anything is signed and a recovery workflow that never pays again. Every payment is a real testnet transaction you can open.'
pubDate: 2026-10-11
sheet: '/downloads/spring-boot-mpp-ai-agent-pays.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-boot-mpp-courier'
tags: ['java', 'spring', 'ai', 'payments']
duration: '14:43'
draft: true
---

A Spring Boot application asks a courier API for a delivery quote. The API
refuses with `402 Payment Required`. The application pays five cents in test
dollars, asks again, and gets the quote. Then the network drops one paid
response, the application retries, and this is what the courier logged:

```text
c.c.c.p.payment.PaymentProblemAdvice     : 402 Payment Required: Payment is required for "localhost:18090" (Premium courier quotation)., challenge NATM-jTiYeZ6PMgG5ZSF9rLxMPsoGYU9ffHE2Su64oY
c.c.c.provider.payment.PaymentGate       : payment verified, tx 0x68b0f9aaf4dacb0bf44d432626f03aa52b1cc2b643ce11bdad698acaa7b2ba1e
c.c.c.p.m.LostResponseSimulator          : dropping a paid response on purpose
c.c.c.p.payment.PaymentProblemAdvice     : 402 Payment Required: Payment is required for "localhost:18090" (Premium courier quotation)., challenge Aui9gNPm0hqGC6FjzymX8ZZJaWdfhIOUFFqPNdrWSNU
c.c.c.provider.payment.PaymentGate       : payment verified, tx 0x3d543432cb91ecd0cd95ce451c9cfa2aaab4216653267139c0dd7fde427eb85d
```

Two challenges. Two verified payments. Two transaction hashes. One quote
request. Nothing went wrong on the blockchain. The retry
logic spent the money twice.

This article is the written version of the episode. It explains what the
Machine Payments Protocol (MPP) is, how it differs from MCP, builds a paid
Spring Boot API and a Java client that pays for it, connects an AI assistant
over MCP, breaks the client twice, and fixes it twice.

Everything here ran for real, on a test network, with test tokens. Every code
block is copied from a file in the
[repository](https://github.com/code-with-sam-dev/spring-boot-mpp-courier) at
commit `cd2e4d1`, named above the block. Every terminal block is copied from a
file in its `evidence/` folder, also named. The last section shows the
commands that reproduce them.

**No real money moves anywhere in this article.** Every payment is in
pathUSD, a test token on Tempo's Moderato test network, handed out free by the
testnet faucet. It has no value.

## The scenario

A small online shop needs to send a 2 kg parcel from London to Manchester. Its
assistant compares delivery quotes.

- **The standard courier** quotes for free.
- **The premium courier** charges 0.05 pathUSD (five test cents) for every
  quote it gives you, and wants to be paid before it answers.

There is no account with the premium courier and no API key. The courier
names a price in the response, and the client pays during the request. The
client still needs something to pay with: a dedicated test wallet, funded
from the faucet before the demonstration.

## Versions, at the time of writing

At the time of writing, October 2026:

- MPP is an **Internet-Draft**, written up by Stripe and Tempo. It is a draft,
  not a standard, and it is not how most enterprise APIs bill today. The IETF
  datatracker lists the individual draft as expired; the living text is at
  [paymentauth.org](https://paymentauth.org).
- The Java library is `com.stripe:mpp-java` **0.1.6**. Its README calls it
  experimental and says the API is subject to change, so the project pins
  that version.
- The test network is **Tempo Moderato, chain id 42431**. pathUSD lives at
  `0x20c0000000000000000000000000000000000000` and has **6 decimals**, so
  50,000 base units is 0.05.
- The rest: Java 25, Spring Boot 4.1.1, Spring AI 2.0.1 for the MCP server,
  web3j 6.0.0 for signing, H2 for the two small databases.

Check all of these against the version you are running before you rely on
them. This is a young protocol and an experimental library.

## What MPP is

HTTP has had a status code called `402 Payment Required` for decades. It never
became a widely used way to pay for anything. MPP proposes a payment
conversation built around it:

1. The client asks for something.
2. The server answers `402`, with a `WWW-Authenticate: Payment` header carrying
   a **challenge**: how much, in what currency, to whom, on which network, and
   when the offer expires.
3. The client decides whether to pay. If it does, it pays, then asks again
   with an `Authorization: Payment` header carrying a **credential**: the
   challenge it is answering and proof of payment.
4. The server verifies the payment and returns the resource, with a
   `Payment-Receipt` header.

A `402` is a challenge, not a charge. Nothing has been paid when it arrives,
and the client is free to say no. That decision is the most important part of
this article.

Why would anyone want this? Because the caller might be a program, not a
person: an assistant buying one paid data lookup, a job renting a few seconds
of compute, a service using an API it has never used before. The provider
advertises a price and accepts payment in the request, instead of asking every
customer to arrange a subscription first.

MPP is payment-method agnostic. Tempo is simply the settlement method this
demo uses; the protocol defines others.

## MCP and MPP are different things

One letter apart, and they do completely different jobs.

| Aspect | MCP | MPP |
|---|---|---|
| Full name | Model Context Protocol | Machine Payments Protocol |
| Primary purpose | Connecting AI applications to tools and context | Paying for access to a resource over HTTP |
| Main interaction | The host calls a tool (`tools/call`, JSON-RPC 2.0) | 402 challenge, credential, receipt |
| Requires an LLM? | Not in the wire protocol | No |
| Handles payment? | Not in its core specification | Yes |
| Can they work together? | Yes | Yes |

- **MCP calls the tool.** An AI assistant says "call this tool with these
  arguments". Our Java application runs the tool and returns a result. No
  money moves.
- **MPP pays the API.** One program pays another over HTTP. No AI is
  required: the Java client in this article pays with no model anywhere, and
  so do the tests.

Put together: the assistant calls a Java tool over MCP, and the tool calls the
paid courier API using MPP. The payment credentials stay inside the Java
application, and its payment policy decides whether spending is allowed.

There is also a separate draft, `draft-payment-transport-mcp-00`, that carries
MPP challenges and credentials inside MCP messages directly. **This project
does not use it**, on purpose. At the time of writing there is no Java
implementation of it, it would need the MCP host itself to understand
payments, and keeping the two apart shows exactly which protocol does which
job. MCP carries the tool call. MPP carries the payment, over plain HTTP,
inside the tool.

## The courier: a paid Spring Boot endpoint

The courier has two endpoints. The standard quote is free. It just answers.

`courier-api/src/main/java/com/codewithsam/courier/provider/quote/StandardQuoteController.java`:

```java
package com.codewithsam.courier.provider.quote;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StandardQuoteController {

    private final RateCard rateCard;

    public StandardQuoteController(RateCard rateCard) {
        this.rateCard = rateCard;
    }

    @GetMapping("/quotes/standard")
    public QuoteResponse standardQuote(@Valid QuoteRequest request) {
        return rateCard.standard(request);
    }
}
```

The premium endpoint asks a `PaymentGate` for a verified receipt before it
hands over the quote. Ignore the `RedemptionService` lines for now. They are
the second fix, and the last part of this article comes back to them.

`courier-api/src/main/java/com/codewithsam/courier/provider/quote/PremiumQuoteController.java`:

```java
package com.codewithsam.courier.provider.quote;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;

import com.codewithsam.courier.provider.misbehaviour.LostResponseSimulator;
import com.codewithsam.courier.provider.payment.PaymentGate;
import com.codewithsam.courier.provider.redemption.Redemption;
import com.codewithsam.courier.provider.redemption.RedemptionService;
import com.stripe.mpp.Receipt;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PremiumQuoteController {

    private final RateCard rateCard;
    private final PaymentGate paymentGate;
    private final RedemptionService redemptions;
    private final LostResponseSimulator lostResponses;

    public PremiumQuoteController(RateCard rateCard, PaymentGate paymentGate,
            RedemptionService redemptions, LostResponseSimulator lostResponses) {
        this.rateCard = rateCard;
        this.paymentGate = paymentGate;
        this.redemptions = redemptions;
        this.lostResponses = lostResponses;
    }

    @GetMapping("/quotes/premium")
    public ResponseEntity<QuoteResponse> premiumQuote(
            @Valid QuoteRequest request,
            @RequestHeader(name = AUTHORIZATION, required = false) String authorization,
            @RequestHeader(name = "Idempotency-Key", required = false)
            String idempotencyKey) {
        // Already paid for this exact request, but the answer never arrived.
        Optional<Redemption> earlier =
                redemptions.findEarlier(authorization, idempotencyKey, request);
        if (earlier.isPresent()) {
            return paid(earlier.get().quote(), earlier.get().receipt());
        }

        Receipt receipt = paymentGate.charge(authorization);
        QuoteResponse quote = rateCard.premium(request);
        redemptions.record(receipt, authorization, idempotencyKey, request, quote);
        lostResponses.afterPaidResponseBuilt();
        return paid(quote, receipt.toPaymentReceipt());
    }

    private static ResponseEntity<QuoteResponse> paid(QuoteResponse quote,
            String receipt) {
        return ResponseEntity.ok()
                .header("Payment-Receipt", receipt)
                .cacheControl(CacheControl.empty().cachePrivate())
                .body(quote);
    }
}
```

The gate is a thin wrapper around mpp-java's `MppHandler`. A verified payment
returns a receipt. Anything else throws.

`courier-api/src/main/java/com/codewithsam/courier/provider/payment/PaymentGate.java`:

```java
package com.codewithsam.courier.provider.payment;

import com.stripe.mpp.Challenge;
import com.stripe.mpp.Receipt;
import com.stripe.mpp.error.PaymentRequiredException;
import com.stripe.mpp.server.ChargeRequest;
import com.stripe.mpp.server.MppHandler;
import com.stripe.mpp.server.VerifyResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/** Lets a request through only with a verified payment for the premium quote. */
@Service
public class PaymentGate {

    private static final Logger log = LoggerFactory.getLogger(PaymentGate.class);

    private final MppHandler payments;
    private final ChargeRequest premiumQuoteCharge;

    public PaymentGate(MppHandler payments, ChargeRequest premiumQuoteCharge) {
        this.payments = payments;
        this.premiumQuoteCharge = premiumQuoteCharge;
    }

    /**
     * Returns the receipt of a verified payment. Throws a PaymentException otherwise,
     * which PaymentProblemAdvice turns into 402 with a fresh challenge.
     */
    public Receipt charge(String authorization) {
        VerifyResult result = payments.charge(authorization, premiumQuoteCharge);
        if (result instanceof VerifyResult.Verified verified) {
            log.info("payment verified, tx {}", verified.receipt().reference());
            return verified.receipt();
        }
        throw new PaymentRequiredException(
                payments.realm(), premiumQuoteCharge.description());
    }

    public Challenge freshChallenge() {
        return payments.challenge(premiumQuoteCharge);
    }
}
```

The price, the token and the courier's wallet come from configuration. One
`TempoMethod` is shared by the whole application, because its replay store
has to see every request.

`courier-api/src/main/java/com/codewithsam/courier/provider/payment/MppConfig.java`:

```java
package com.codewithsam.courier.provider.payment;

import com.stripe.mpp.Mpp;
import com.stripe.mpp.methods.tempo.TempoDefaults;
import com.stripe.mpp.methods.tempo.TempoMethod;
import com.stripe.mpp.server.ChargeRequest;
import com.stripe.mpp.server.MppHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class MppConfig {

    /** One instance for the whole app: its replay store must see every request. */
    @Bean
    TempoMethod tempo() {
        return TempoMethod.of().testnet().build();
    }

    @Bean
    MppHandler payments(TempoMethod tempo, PremiumChargeProperties charge) {
        return Mpp.create(tempo, charge.realm(), charge.secretKey());
    }

    @Bean
    ChargeRequest premiumQuoteCharge(TempoMethod tempo,
            PremiumChargeProperties charge) {
        return ChargeRequest.of(tempo.chargeIntent(), charge.price().toPlainString(),
                        TempoDefaults.TESTNET_PATH_USD, charge.recipient())
                .description(charge.description());
    }
}
```

`courier-api/src/main/resources/application.properties` (excerpt):

```properties
# Premium quote: 0.05 pathUSD per request on Tempo testnet. Testnet tokens only.
courier.premium.price=0.05
courier.premium.recipient=${COURIER_RECIPIENT_ADDRESS:}
courier.premium.realm=localhost:8090
courier.premium.secret-key=${MPP_SECRET_KEY:}
```

The courier only needs its wallet **address** to be paid. It never holds a
private key.

mpp-java does not turn its `PaymentException` into an HTTP response, and it
does not add the cache headers the spec asks for. This advice does both:
every payment failure becomes a `402` with a fresh challenge, a Problem
Details body and `Cache-Control: no-store`.

`courier-api/src/main/java/com/codewithsam/courier/provider/payment/PaymentProblemAdvice.java` (excerpt):

```java
    @ExceptionHandler(PaymentException.class)
    ResponseEntity<Map<String, Object>> paymentProblem(PaymentException problem) {
        ResponseEntity.BodyBuilder response = ResponseEntity
                .status(problem.getHttpStatus())
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON);
        String challengeId = null;
        if (problem.getHttpStatus() == 402) {
            Challenge retry = paymentGate.freshChallenge();
            response.header(HttpHeaders.WWW_AUTHENTICATE, retry.toWwwAuthenticate());
            challengeId = retry.id();
            log.info("402 {}: {}, challenge {}", problem.getTitle(),
                    problem.getMessage(), challengeId);
        }
        return response.body(problem.toProblemDetails(challengeId));
    }
```

## A real 402

Ask for the premium quote with no payment. This is a real exchange against
the courier, recorded by an integration test.

`evidence/01-http-exchange.txt` (excerpt):

```text
== 1. Ask for the premium quote with no payment ==
> GET /quotes/premium?from=London&to=Manchester&weightKg=2
> Idempotency-Key: transcript-1791555248734

< HTTP/1.1 402
< cache-control: no-store
< content-type: application/problem+json
< www-authenticate: Payment id="XkSC0rcJNEN3rlGCVFV0lFNaERKlqaOitEO-U6YObOk", realm="localhost:18196", method="tempo", intent="charge", request="eyJhbW91bnQiOiI1MDAwMCIsImN1cnJlbmN5IjoiMHgyMGMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwibWV0aG9kRGV0YWlscyI6eyJjaGFpbklkIjo0MjQzMX0sInJlY2lwaWVudCI6IjB4ZTYxNGU0M2U0ZmJmOTg2N2JkZjRlMmRkYmQzZjYyODY1OGI5M2RkYiJ9", expires="2026-10-09T14:19:08.773192Z", description="Premium courier quotation"

{"type":"https://paymentauth.org/problems/payment-required","title":"Payment Required","status":402,"detail":"Payment is required for \"localhost:18196\" (Premium courier quotation).","challengeId":"XkSC0rcJNEN3rlGCVFV0lFNaERKlqaOitEO-U6YObOk"}

decoded request = {"amount":"50000","currency":"0x20c0000000000000000000000000000000000000","methodDetails":{"chainId":42431},"recipient":"0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb"}
```

Read the challenge:

- `method="tempo"` names the payment network. `intent="charge"` means a one
  time payment.
- `request` is base64url JSON. Decoded: the **amount** is 50,000 base units,
  and pathUSD has six decimals, so that is 0.05. Then the **currency** (the
  pathUSD token address), the **recipient** (the courier's wallet) and the
  **chain** (42431).
- `expires` says how long the offer stands.
- The `id` binds all of it together, so a client cannot pay a different
  amount and claim it answered this challenge.

Every one of those values matters when the client decides whether to pay.

One more thing the spec cares about: servers must not issue payment
challenges over plain HTTP, and clients must not send credentials over it.
This demo runs on `localhost` over plain HTTP. That is a deliberate local
development shortcut. Anything beyond your own machine needs TLS.

## The Java client: MppPaymentClient

The client is written by hand, so you can see exactly where Java receives an
offer, makes a payment decision, signs a transaction and asks again. This is
the final, safe version. The two fixes are already in it, and the next
sections show what happens without them.

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/MppPaymentClient.java`:

```java
package com.codewithsam.courier.payment;

import com.codewithsam.courier.wallet.SignedTransfer;
import com.stripe.mpp.Challenge;
import com.stripe.mpp.Receipt;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.ResourceAccessException;

/**
 * An HTTP client that can pay for what it fetches, following MPP:
 * GET, 402 with a challenge, policy check, pay on Tempo, GET again with a credential.
 *
 * Paying twice for one request is the failure it exists to prevent. Every paid
 * request is written down (PaymentOperationStore) before money moves, and once a
 * transfer is signed the client only ever resumes it: same transaction, same
 * credential, same Idempotency-Key.
 */
public class MppPaymentClient {

    private static final Logger log = LoggerFactory.getLogger(MppPaymentClient.class);
    private static final int DELIVERY_ATTEMPTS = 3;

    private final CourierHttp http;
    private final PaymentPolicyService policy;
    private final TempoChargePayer payer;
    private final PaymentOperationStore operations;
    private final PaymentAuditService audit;

    public MppPaymentClient(CourierHttp http, PaymentPolicyService policy,
            TempoChargePayer payer, PaymentOperationStore operations,
            PaymentAuditService audit) {
        this.http = http;
        this.policy = policy;
        this.payer = payer;
        this.operations = operations;
        this.audit = audit;
    }

    /** requestKey names the logical request: the same key is never paid for twice. */
    public PaidResponse get(URI uri, String requestKey) {
        Optional<PaymentOperation> earlier = operations.find(requestKey);
        if (earlier.isPresent()) {
            return resume(uri, earlier.get());
        }

        HttpReply first = http.get(uri, null, idempotencyKey(requestKey));
        if (!first.isPaymentRequired()) {
            return PaidResponse.free(first.body());
        }

        Challenge challenge = TempoChargePayer.challengeFrom(first);
        PolicyDecision decision = policy.approve(ChargeOffer.from(challenge));
        if (!decision.approved()) {
            throw new PaymentRefusedException(decision.reason());
        }

        SignedTransfer transfer = payer.sign(challenge);
        // Written down before any money moves. From here on we only ever resume.
        return resume(uri, operations.startPayment(requestKey, challenge, transfer));
    }

    private PaidResponse resume(URI uri, PaymentOperation operation) {
        Challenge challenge = operation.challenge();
        ChargeOffer offer = ChargeOffer.from(challenge);
        String txHash = operation.txHash();
        switch (operation.state()) {
            case REDEEMED -> {
                return new PaidResponse(operation.body(), offer.amount(), txHash);
            }
            case PENDING_PAYMENT -> {
                // Broadcasts the SAME signed transfer; a no-op if it is already mined.
                payer.settle(operation.signedTransfer());
                operations.markBroadcast(operation.requestKey());
                audit.record("safe", AuditOutcome.PAID, offer, txHash,
                        "transfer mined");
            }
            case BROADCAST, UNDELIVERED -> log.info("resuming paid request {}", txHash);
        }
        return redeem(uri, operation, offer);
    }

    private PaidResponse redeem(URI uri, PaymentOperation operation,
            ChargeOffer offer) {
        String txHash = operation.txHash();
        String authorization = payer.authorization(operation.challenge(), txHash);
        for (int attempt = 1; attempt <= DELIVERY_ATTEMPTS; attempt++) {
            Optional<HttpReply> reply =
                    presentCredential(uri, authorization, operation);
            if (reply.isPresent() && reply.get().isOk()) {
                String body = reply.get().body();
                String receipt = matchingReceipt(reply.get(), txHash);
                operations.markRedeemed(operation.requestKey(), body, receipt);
                audit.record("safe", AuditOutcome.DELIVERED, offer, txHash,
                        "receipt matches");
                return new PaidResponse(body, offer.amount(), txHash);
            }
            if (reply.isPresent() && !reply.get().isServerError()) {
                break; // the courier answered, and the answer is no
            }
            audit.record("safe", AuditOutcome.RESPONSE_LOST, offer, txHash,
                    "attempt " + attempt + ": no answer, same credential again");
        }
        operations.markUndelivered(operation.requestKey());
        audit.record("safe", AuditOutcome.UNDELIVERED, offer, txHash,
                "not paying again");
        throw new PaidButUndeliveredException(txHash);
    }

    private Optional<HttpReply> presentCredential(URI uri, String authorization,
            PaymentOperation operation) {
        try {
            String key = idempotencyKey(operation.requestKey());
            return Optional.of(http.get(uri, authorization, key));
        } catch (ResourceAccessException timeout) {
            return Optional.empty();
        }
    }

    private static String matchingReceipt(HttpReply reply, String txHash) {
        String header = reply.headers().getFirst("Payment-Receipt");
        if (header == null || !txHash.equalsIgnoreCase(
                Receipt.fromPaymentReceipt(header).reference())) {
            throw new IllegalStateException("200 without a receipt for " + txHash);
        }
        return header;
    }

    private static String idempotencyKey(String requestKey) {
        byte[] bytes = requestKey.getBytes(StandardCharsets.UTF_8);
        return UUID.nameUUIDFromBytes(bytes).toString();
    }
}
```

Follow `get` from the top:

1. Ask for the quote. If the answer is not `402`, there is nothing to pay.
2. Parse the challenge into a `ChargeOffer`: amount, currency, recipient,
   network and expiry.
3. Ask the policy. A refusal throws before anything is signed.
4. Sign the transfer, write it down, then pay.
5. Ask again with the credential, and check that the receipt's reference is
   our own transaction hash.

The challenge is read into a plain record before any decision is made.

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/ChargeOffer.java`:

```java
package com.codewithsam.courier.payment;

import com.codewithsam.courier.wallet.PathUsd;
import com.stripe.mpp.Challenge;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.util.Map;

/** What a 402 challenge is asking the assistant to pay, read before paying anything. */
public record ChargeOffer(
        String challengeId,
        String realm,
        String method,
        String intent,
        BigInteger amountUnits,
        String currency,
        String recipient,
        long chainId,
        Instant expires) {

    public static ChargeOffer from(Challenge challenge) {
        Map<String, Object> request = challenge.request();
        Object details = request.getOrDefault("methodDetails", Map.of());
        Object chainId = details instanceof Map<?, ?> map ? map.get("chainId") : null;
        return new ChargeOffer(
                challenge.id(),
                challenge.realm(),
                challenge.method(),
                challenge.intent(),
                new BigInteger(String.valueOf(request.get("amount"))),
                String.valueOf(request.get("currency")),
                String.valueOf(request.get("recipient")),
                chainId instanceof Number number ? number.longValue() : -1,
                challenge.expires() == null ? null
                        : Instant.parse(challenge.expires()));
    }

    /** pathUSD has 6 decimals, so 50000 base units is 0.05. */
    public BigDecimal amount() {
        return PathUsd.fromBaseUnits(amountUnits);
    }
}
```

## Paying on Tempo

The payment has to be tied to the challenge it answers. A random transfer of
five cents to the courier is not enough.

In the library version tested here, mpp-java (and the other MPP SDKs) reject a
Tempo payment unless it is a `transferWithMemo` whose memo binds it to the
server's realm and the challenge id. At the time of writing, the Tempo charge
draft does not spell that out. A client that follows only the specification
text gets rejected.

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/TempoChargePayer.java`:

```java
package com.codewithsam.courier.payment;

import com.codewithsam.courier.wallet.SignedTransfer;
import com.codewithsam.courier.wallet.TempoNetwork;
import com.codewithsam.courier.wallet.Wallet;
import com.stripe.mpp.Challenge;
import com.stripe.mpp.Credential;
import com.stripe.mpp.methods.tempo.Attribution;
import java.util.List;
import java.util.Map;

/**
 * Turns a Tempo charge challenge into money on chain and a credential that proves
 * it. Knows nothing about limits: that is PaymentPolicyService's job.
 */
public class TempoChargePayer {

    private final Wallet wallet;
    private final TempoNetwork network;

    public TempoChargePayer(Wallet wallet, TempoNetwork network) {
        this.wallet = wallet;
        this.network = network;
    }

    public static Challenge challengeFrom(HttpReply reply) {
        List<String> headers = reply.headers().getOrEmpty("WWW-Authenticate");
        List<Challenge> challenges = Challenge.fromWwwAuthenticate(headers);
        return challenges.stream()
                .filter(challenge -> "tempo".equals(challenge.method()))
                .findFirst()
                .orElse(challenges.getFirst());
    }

    /**
     * Every MPP SDK rejects a Tempo payment unless its memo is bound to this server
     * (realm) and this challenge (id), so nobody can claim someone else's transfer.
     */
    public static String memoFor(Challenge challenge) {
        return Attribution.encode(challenge.realm(), challenge.id());
    }

    public SignedTransfer sign(Challenge challenge) {
        ChargeOffer offer = ChargeOffer.from(challenge);
        return wallet.signTransferWithMemo(offer.currency(), offer.recipient(),
                offer.amountUnits(), memoFor(challenge));
    }

    public void settle(SignedTransfer transfer) {
        wallet.broadcast(transfer);
        wallet.awaitSuccess(transfer.hash());
    }

    /** Push mode: we broadcast ourselves and hand the courier the transaction hash. */
    public String authorization(Challenge challenge, String txHash) {
        String payer = "did:pkh:eip155:" + network.chainId() + ":" + wallet.address();
        return new Credential(challenge.toEcho(),
                Map.of("type", "hash", "hash", txHash), payer).toAuthorization();
    }

    public String explorerUrl(String txHash) {
        return network.transactionUrl(txHash);
    }
}
```

This is **push mode**: the client broadcasts its own transfer and sends the
courier the transaction hash (`type=hash`). Pull mode, where the server
broadcasts a signed transaction for you, is not implemented here.

The wallet signs an ordinary EIP-1559 transaction with stock web3j. One
problem showed up in testing: the first transfer from a brand new wallet
needed far more gas than later ones, about 545,000, because creating the
account on chain is charged. A fixed gas limit made that first payment fail.
So the wallet asks the network for an estimate every time and adds a margin.

`tempo-wallet/src/main/java/com/codewithsam/courier/wallet/TempoWallet.java` (excerpt):

```java
    @Override
    public SignedTransfer signTransferWithMemo(
            String token, String recipient, BigInteger amount, String memo) {
        String data = TempoCalls.transferWithMemo(recipient, amount, memo);
        BigInteger nonce =
                rpc.quantity("eth_getTransactionCount", address(), "pending");
        BigInteger gasPrice = rpc.quantity("eth_gasPrice");
        RawTransaction tx = RawTransaction.createTransaction(chainId, nonce,
                estimateGas(token, data), token, BigInteger.ZERO, data,
                gasPrice, gasPrice.multiply(BigInteger.TWO));
        return sign(tx, chainId, credentials);
    }

    static SignedTransfer sign(RawTransaction tx, long chainId,
            Credentials credentials) {
        String raw = Numeric.toHexString(
                TransactionEncoder.signMessage(tx, chainId, credentials));
        return new SignedTransfer(Hash.sha3(raw), raw);
    }
```

```java
    // A brand new account's first transfer costs about 545,000 gas on Tempo
    // (account creation is charged), so never hard-code a gas limit.
    private BigInteger estimateGas(String token, String data) {
        BigInteger estimate = rpc.quantity("eth_estimateGas",
                Map.of("from", address(), "to", token, "data", data));
        return estimate.multiply(BigInteger.valueOf(12)).divide(BigInteger.TEN);
    }
```

Notice `sign` returns the hash of the signed transaction. The hash is known
**before** anything is broadcast. That detail is what makes the second fix
possible.

## Paid, with a receipt

The rest of the same recorded exchange: the memo, the transaction, the
credential, and the courier's answer.

`evidence/01-http-exchange.txt` (excerpt):

```text
== 3. Pay: transferWithMemo, memo bound to realm and challenge ==
memo = 0xef1ed7120131de7975921eda9276c40000000000000000000047550ec0c75806
tx hash, known before broadcast = 0x2ec458ed110b51c5f38900e8cb03bb53575110c8860fd0a612bf62a74fabb76a
mined: https://explore.testnet.tempo.xyz/tx/0x2ec458ed110b51c5f38900e8cb03bb53575110c8860fd0a612bf62a74fabb76a
```

```text
decoded credential = {"challenge":{"expires":"2026-10-09T14:19:08.773192Z","id":"XkSC0rcJNEN3rlGCVFV0lFNaERKlqaOitEO-U6YObOk","intent":"charge","method":"tempo","realm":"localhost:18196","request":"eyJhbW91bnQiOiI1MDAwMCIsImN1cnJlbmN5IjoiMHgyMGMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwibWV0aG9kRGV0YWlscyI6eyJjaGFpbklkIjo0MjQzMX0sInJlY2lwaWVudCI6IjB4ZTYxNGU0M2U0ZmJmOTg2N2JkZjRlMmRkYmQzZjYyODY1OGI5M2RkYiJ9"},"payload":{"hash":"0x2ec458ed110b51c5f38900e8cb03bb53575110c8860fd0a612bf62a74fabb76a","type":"hash"},"source":"did:pkh:eip155:42431:0x103604c41634224c9914bd79988369d694c69e2a"}

< HTTP/1.1 200
< cache-control: private
< content-type: application/json
< payment-receipt: eyJtZXRob2QiOiJ0ZW1wbyIsInJlZmVyZW5jZSI6IjB4MmVjNDU4ZWQxMTBiNTFjNWYzODkwMGU4Y2IwM2JiNTM1NzUxMTBjODg2MGZkMGE2MTJiZjYyYTc0ZmFiYjc2YSIsInN0YXR1cyI6InN1Y2Nlc3MiLCJ0aW1lc3RhbXAiOiIyMDI2LTEwLTA5VDE0OjE0OjEzLjE0NzUzNFoifQ

{"courier":"Swift Courier Premium","price":8.60,"currency":"GBP","days":1}

decoded receipt = {"method":"tempo","reference":"0x2ec458ed110b51c5f38900e8cb03bb53575110c8860fd0a612bf62a74fabb76a","status":"success","timestamp":"2026-10-09T14:14:13.147534Z"}
```

The credential echoes the challenge and carries the transaction hash. The
receipt's `reference` is the same hash, which is what `matchingReceipt`
checks. The `source` is the payer's public testnet address.

A credential is a bearer token. Never log one in a real system. The audit in
this project stores transaction hashes, not credentials. The file above
prints one spent, single-use testnet credential on purpose, to show what is
on the wire.

The same flow, called from the retailer's own REST endpoint, with the
balances either side. The courier's balance goes up by exactly 0.05.

`evidence/02-assistant-paid-quote.txt` (excerpt):

```text
$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999983.848335 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  16.15 pathUSD
```

```text
$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999983.798294 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  16.2 pathUSD
```

The payer lost 0.050041: the 0.05 price, plus a network fee of about 0.00004.
Tempo has no separate gas coin, so the fee is paid in pathUSD too. The policy
limits count the price the courier asked for, not the fee.

Five cents paid, one premium quote returned, and nobody clicked a payment
button.

## Adding MCP

Now the retailer's application exposes three MCP tools with Spring AI:
standard quotes, a premium quote, and the payment audit.

`retailer-assistant/src/main/java/com/codewithsam/courier/agent/CourierAssistant.java`:

```java
package com.codewithsam.courier.agent;

import com.codewithsam.courier.payment.PaymentAuditEntry;
import com.codewithsam.courier.payment.PaymentAuditService;
import com.codewithsam.courier.quotation.DeliveryQuote;
import com.codewithsam.courier.quotation.PremiumQuoteResult;
import com.codewithsam.courier.quotation.QuotationService;
import com.codewithsam.courier.quotation.QuoteRequest;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;
import org.springframework.stereotype.Component;

/**
 * The tools an AI application can call over MCP. MCP carries the tool call;
 * the payment inside premium_delivery_quote is MPP, over plain HTTP.
 */
@Component
public class CourierAssistant {

    private final QuotationService quotations;
    private final PaymentAuditService audit;

    public CourierAssistant(QuotationService quotations, PaymentAuditService audit) {
        this.quotations = quotations;
        this.audit = audit;
    }

    @McpTool(name = "standard_delivery_quotes",
            description = "Free. Standard delivery price (GBP) and days for a parcel.")
    public DeliveryQuote standardDeliveryQuotes(
            @McpToolParam(description = "Collection town, e.g. London") String from,
            @McpToolParam(description = "Delivery town, e.g. Manchester") String to,
            @McpToolParam(description = "Parcel weight in kg, 0.1 to 30")
            BigDecimal weightKg) {
        return quotations.standard(new QuoteRequest(from, to, weightKg));
    }

    @McpTool(name = "premium_delivery_quote",
            description = "COSTS MONEY. Buys the premium courier's next-day quote. "
                    + "The courier charges a fee per request (0.05 pathUSD on Tempo "
                    + "testnet), paid automatically only if the payment policy allows "
                    + "it: per-request limit, daily budget and approved couriers. "
                    + "Returns the quote, the fee paid and the transaction, or the "
                    + "policy's reason for refusing.")
    public PremiumQuoteResult premiumDeliveryQuote(
            @McpToolParam(description = "Collection town, e.g. London") String from,
            @McpToolParam(description = "Delivery town, e.g. Manchester") String to,
            @McpToolParam(description = "Parcel weight in kg, 0.1 to 30")
            BigDecimal weightKg) {
        return quotations.premium(new QuoteRequest(from, to, weightKg));
    }

    @McpTool(name = "payment_audit",
            description = "Read only. Every payment decision so far: approved, "
                    + "refused, paid, delivered, with amounts and transaction links.")
    public List<PaymentAuditEntry> paymentAudit() {
        return audit.entries();
    }
}
```

The premium tool delegates to `QuotationService`, which calls the
`MppPaymentClient` above. The assistant can ask for a premium quote, which may
cost money. It cannot bypass the payment rules: they run inside Java, before
the wallet signs anything.

The request key names the business request: one parcel, one day, one
payment. Asking again the same day returns the quote already bought.

`retailer-assistant/src/main/java/com/codewithsam/courier/quotation/QuotationService.java` (excerpt):

```java
    public PremiumQuoteResult premium(QuoteRequest request) {
        // One parcel, one day, one payment: asking again returns the quote we bought.
        String requestKey = "premium-quote|" + request.fingerprint() + "|"
                + LocalDate.now(clock);
```

The MCP server runs over streamable HTTP at `/mcp`, and any MCP host can
connect to it. Claude Code reads this file in the project root:

`.mcp.json`:

```json
{
  "mcpServers": {
    "courier-assistant": {
      "type": "http",
      "url": "http://localhost:${ASSISTANT_PORT:-8080}/mcp"
    }
  }
}
```

Here is a real Claude Code session, restricted to this project's three tools,
asked to compare delivery options for the parcel.

`evidence/agent-claude-code.txt` (excerpt):

```text
USER: We run a small online shop and need to send a 2 kg parcel from London to Manchester. Use the courier tools to compare the delivery options and recommend one. You may buy the premium quote if the payment policy allows it. Finish by showing what was paid, from the payment audit. 

TOOL CALL  standard_delivery_quotes {"from": "London", "to": "Manchester", "weightKg": 2}
TOOL CALL  premium_delivery_quote {"from": "London", "to": "Manchester", "weightKg": 2}
TOOL RESULT {"courier":"Parcel Post Standard","price":4.90,"currency":"GBP","days":3}

TOOL RESULT {"status":"PAID","quote":{"courier":"Swift Courier Premium","price":8.60,"currency":"GBP","days":1},"quoteFee":0.05,"paymentTx":"0xf95d4adc1b0a217b3d423cbfa354bc17a663d295a1cb63675a4f200e537111e9","explorerUrl":"https://explore.testnet.tempo.xyz/tx/0xf95d4adc1b0a217b3d423cbfa354bc17a663d295a1cb63675a4f200e537111e9","reason":null}

TOOL CALL  payment_audit {}
```

The standard quote is £4.90, three days. The premium quote is £8.60, next
day, and getting it cost the application five test cents. Note the two
different amounts: the delivery price is in pounds and is what the shop would
pay to ship the parcel; the 0.05 pathUSD is the fee for the quote itself.

The assistant then read the audit, which records the payment in three steps
(approved, paid, delivered), and ended its answer with:

```text
The audit shows one charge of 0.05 pathUSD, recorded in three steps (approved, paid, delivered). There were no duplicate payments. 
```

Everything works. Now break it.

## Break it: five dollars

The first version of the client trusted the price in the challenge. It still
exists in the repository, for exactly this demonstration.

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/UnsafePaymentClient.java` (excerpt):

```java
    public PaidResponse get(URI uri) {
        try {
            return payAndFetch(uri);
        } catch (RuntimeException firstFailure) {
            log.warn("request failed ({}), retrying", firstFailure.getMessage());
            // A fresh request: a fresh challenge, and a fresh payment.
            return payAndFetch(uri);
        }
    }

    private PaidResponse payAndFetch(URI uri) {
        HttpReply first = http.get(uri, null, null);
        if (!first.isPaymentRequired()) {
            return PaidResponse.free(first.body());
        }
        Challenge challenge = TempoChargePayer.challengeFrom(first);
        ChargeOffer offer = ChargeOffer.from(challenge);

        SignedTransfer transfer = payer.sign(challenge);
        payer.settle(transfer);
        audit.record("unsafe", AuditOutcome.PAID, offer, transfer.hash(), "no policy");

        String credential = payer.authorization(challenge, transfer.hash());
        HttpReply paid = http.get(uri, credential, null);
        if (!paid.isOk()) {
            throw new IllegalStateException("courier answered " + paid.status());
        }
        return new PaidResponse(paid.body(), offer.amount(), transfer.hash());
    }
```

The courier used to charge five cents per quote. Restart it asking for five
dollars (`--courier.premium.price=5.00`). The unsafe client sees a valid
challenge and pays.

`evidence/04-unsafe-overpay.txt` (excerpt):

```text
$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999983.548089 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  16.45 pathUSD


$ curl -s 'http://localhost:18080/break/quotes/premium?from=London&to=Manchester&weightKg=2' | python3 -m json.tool
{
    "body": "{\"courier\":\"Swift Courier Premium\",\"price\":8.60,\"currency\":\"GBP\",\"days\":1}",
    "amountPaid": 5,
    "txHash": "0x461659e630c03818bee3ce6b89d46309d718e88d3f1c3c493cb717b9132a7ea2"
}


$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999978.548048 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  21.45 pathUSD
```

Five test dollars gone, for one quote. The challenge was perfectly valid.
That is the point: MPP tells the client what the server wants to charge. It
does not decide what your business is willing to spend. That decision
belongs in your code.

## Break it: paid twice

The second failure is the one from the top of this article. Restart the
courier with `--courier.misbehaviour.lose-paid-responses=1`. It verifies the
payment, produces the quote, records what was bought, and then drops the
response before it reaches the client, as a timeout or a crashed proxy
would.

`courier-api/src/main/java/com/codewithsam/courier/provider/misbehaviour/LostResponseSimulator.java` (excerpt):

```java
    public void afterPaidResponseBuilt() {
        if (lost.incrementAndGet() <= responsesToLose) {
            log.warn("dropping a paid response on purpose");
            throw new SimulatedLostResponseException();
        }
        lost.decrementAndGet();
    }
```

From the unsafe client's point of view the request failed. It never saw the
answer. So its retry starts again from the top: another `GET`, another
challenge, another transfer.

`evidence/05-lost-response.txt` (excerpt):

```text
## Unsafe client. courier-api: --courier.misbehaviour.lose-paid-responses=1

$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999978.548048 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  21.45 pathUSD


$ curl -s 'http://localhost:18080/break/quotes/premium?from=London&to=Manchester&weightKg=3' | python3 -m json.tool
{
    "body": "{\"courier\":\"Swift Courier Premium\",\"price\":9.70,\"currency\":\"GBP\",\"days\":1}",
    "amountPaid": 0.05,
    "txHash": "0x3d543432cb91ecd0cd95ce451c9cfa2aaab4216653267139c0dd7fde427eb85d"
}


$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999978.447966 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  21.55 pathUSD
```

The client reports 0.05 paid. The courier's balance went up by 0.10. The
courier's log, quoted at the top, shows why: two challenges, two verified
payments, one quote request. The payment audit in the same file lists both
transfers, `0x68b0f9aa...` and `0x3d543432...`, each with the detail
`no policy`.

## Three problems that look like one

It is tempting to call all of this "idempotency" and move on. There are three
different problems here, and each needs its own answer.

1. **Duplicate settlement.** Money moved twice for one business request. This
   is the bug above. Stopping it is the client's job.
2. **Duplicate redemption.** Someone tries to use one payment to buy
   something else. Stopping it is the server's job. mpp-java's replay store
   already rejects a reused transaction hash.
3. **Recovery.** The payment succeeded, but the response disappeared. The
   customer still needs the answer they already paid for.

Problems 2 and 3 pull in opposite directions. The courier has to refuse a
reused payment, and still hand a paid answer back to a client that lost it.
So the courier has to tell a retry of the same purchase from an attempt to
reuse a payment for a different one. That needs a durable operation record on
the client and a durable redemption record on the courier.

## Fix one: a payment policy that runs before signing

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/PaymentPolicyService.java`:

```java
package com.codewithsam.courier.payment;

import com.codewithsam.courier.config.PaymentPolicyProperties;
import java.math.BigDecimal;
import java.time.Clock;
import org.springframework.stereotype.Service;

/**
 * Decides whether the assistant may pay a challenge, before anything is signed.
 * An agent must never have unlimited payment authority: this is the limit.
 */
@Service
public class PaymentPolicyService {

    private final PaymentPolicyProperties limits;
    private final PaymentAuditService audit;
    private final Clock clock;

    public PaymentPolicyService(PaymentPolicyProperties limits,
            PaymentAuditService audit, Clock clock) {
        this.limits = limits;
        this.audit = audit;
        this.clock = clock;
    }

    /** Synchronized so two payments cannot both squeeze under the daily budget. */
    public synchronized PolicyDecision approve(ChargeOffer offer) {
        PolicyDecision decision = check(offer);
        AuditOutcome outcome =
                decision.approved() ? AuditOutcome.APPROVED : AuditOutcome.REFUSED;
        audit.record("safe", outcome, offer, null, decision.reason());
        return decision;
    }

    private PolicyDecision check(ChargeOffer offer) {
        if (!"tempo".equals(offer.method())) {
            return PolicyDecision.refuse(
                    "payment method " + offer.method() + " is not allowed");
        }
        if (!"charge".equals(offer.intent())) {
            return PolicyDecision.refuse(
                    "intent " + offer.intent() + " is not allowed");
        }
        if (offer.chainId() != limits.chainId()) {
            return PolicyDecision.refuse("chain " + offer.chainId()
                    + " is not the approved chain " + limits.chainId());
        }
        if (!limits.currency().equalsIgnoreCase(offer.currency())) {
            return PolicyDecision.refuse(
                    "currency " + offer.currency() + " is not pathUSD");
        }
        if (limits.allowedRecipients().stream()
                .noneMatch(allowed -> allowed.equalsIgnoreCase(offer.recipient()))) {
            return PolicyDecision.refuse(
                    "recipient " + offer.recipient() + " is not an approved courier");
        }
        if (offer.expires() == null) {
            return PolicyDecision.refuse("challenge has no expiry");
        }
        if (!offer.expires().isAfter(clock.instant())) {
            return PolicyDecision.refuse("challenge expired at " + offer.expires());
        }
        BigDecimal amount = offer.amount();
        if (amount.compareTo(limits.maxPerRequest()) > 0) {
            return PolicyDecision.refuse(money(amount) + " pathUSD is over the "
                    + money(limits.maxPerRequest()) + " per-request limit");
        }
        BigDecimal spentAfter = audit.spentToday().add(amount);
        if (spentAfter.compareTo(limits.dailyBudget()) > 0) {
            return PolicyDecision.refuse(money(amount)
                    + " pathUSD would bring today's spend to " + money(spentAfter)
                    + ", over the " + money(limits.dailyBudget()) + " daily budget");
        }
        return PolicyDecision.approve();
    }

    private static String money(BigDecimal value) {
        BigDecimal plain = value.stripTrailingZeros();
        return plain.setScale(Math.max(2, plain.scale())).toPlainString();
    }
}
```

It checks the payment method, the intent, the approved network, the currency,
the recipient and the expiry. Then the price: at most 0.10 for one request,
and at most 0.25 in one day. The limits live in configuration.

`retailer-assistant/src/main/resources/application.properties` (excerpt):

```properties
# The payment authority the assistant has, in pathUSD.
assistant.payment.policy.max-per-request=0.10
assistant.payment.policy.daily-budget=0.25
assistant.payment.policy.allowed-recipients=${COURIER_RECIPIENT_ADDRESS}
assistant.payment.policy.currency=0x20c0000000000000000000000000000000000000
assistant.payment.policy.chain-id=42431
```

Approving a payment records an `APPROVED` row, and `spentToday` sums those
rows, so an approval reserves its share of the budget before any money moves.
`approve` is `synchronized`, so inside one running application approvals
happen one at a time and two of them cannot both squeeze under the limit.

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/PaymentAuditService.java` (excerpt):

```java
    public BigDecimal spentToday() {
        return db.sql("""
                SELECT COALESCE(SUM(amount), 0) FROM payment_audit
                WHERE outcome = 'APPROVED' AND business_day = ?""")
                .param(LocalDate.now(clock))
                .query(BigDecimal.class)
                .single();
    }
```

The test fires twenty approvals at the same moment. Exactly five are
approved, and the day's total stops at 0.25.

`retailer-assistant/src/test/java/com/codewithsam/courier/payment/PaymentPolicyServiceTest.java` (excerpt):

```java
    @Test
    void twentySimultaneousRequestsCannotOverspendTheDailyBudget() throws Exception {
        CountDownLatch start = new CountDownLatch(1);
        List<Future<Boolean>> results = new ArrayList<>();
        try (ExecutorService threads = Executors.newFixedThreadPool(20)) {
            for (int i = 0; i < 20; i++) {
                results.add(threads.submit(() -> {
                    start.await();
                    return policy.approve(offer(TestChallenges.premiumQuote())).approved();
                }));
            }
            start.countDown();
        }

        long approved = 0;
        for (Future<Boolean> result : results) {
            if (result.get()) {
                approved++;
            }
        }
        assertThat(approved).isEqualTo(5);
        assertThat(audit.spentToday()).isEqualByComparingTo("0.25");
    }
```

`synchronized` holds within one process. If you run several instances of the
application against one budget, the reservation has to move into the
database (a row lock or a conditional insert), and this test would need to
prove that instead.

Now the courier asks for five dollars again, and the safe client is asked for
the same quote.

`evidence/04-unsafe-overpay.txt` (excerpt):

```text
# the same request through the safe client

$ curl -s 'http://localhost:18080/assistant/quotes/premium?from=London&to=Manchester&weightKg=2' | python3 -m json.tool
{
    "status": "REFUSED_BY_POLICY",
    "quote": null,
    "quoteFee": 0,
    "paymentTx": null,
    "explorerUrl": null,
    "reason": "5.00 pathUSD is over the 0.10 per-request limit"
}


$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999978.548048 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  21.45 pathUSD
```

Refused before signing anything. The balance does not change. The policy
evidence goes further: it checks the payer's nonce, the count of transactions
it has ever sent, before and after each refusal, and walks the daily budget
down to its limit.

`evidence/03-policy-refusals.txt` (excerpt):

```text
## 2. The challenge names a recipient that is not an approved courier
payer nonce 27

$ curl -s 'http://localhost:18080/assistant/quotes/premium?from=London&to=Manchester&weightKg=2' | python3 -m json.tool
{
    "status": "REFUSED_BY_POLICY",
    "quote": null,
    "quoteFee": 0,
    "paymentTx": null,
    "explorerUrl": null,
    "reason": "recipient 0x00000000000000000000000000000000000bad00 is not an approved courier"
}

payer nonce 27
```

```text
$ curl -s 'http://localhost:18080/assistant/quotes/premium?from=London&to=Manchester&weightKg=6' | python3 -c 'import json,sys; r=json.load(sys.stdin); print(r["status"], r["quoteFee"], r["paymentTx"] or r["reason"])'
REFUSED_BY_POLICY 0 0.05 pathUSD would bring today's spend to 0.30, over the 0.25 daily budget
```

That last refusal came after five paid 0.05 quotes for five different parcel
weights. The sixth would have taken the day to 0.30.

## Fix two: recover, never pay again

Before the client sends any money, it writes down a durable record for this
business request: the challenge, the signed transaction it is about to send,
and the request key.

`retailer-assistant/src/main/java/com/codewithsam/courier/payment/PaymentOperationStore.java` (excerpt):

```java
    public PaymentOperation startPayment(String requestKey, Challenge challenge,
            SignedTransfer transfer) {
        db.sql("""
                INSERT INTO payment_operation (request_key, state, www_authenticate,
                    tx_hash, raw_transaction, updated_at)
                VALUES (?, 'PENDING_PAYMENT', ?, ?, ?, ?)""")
                .params(requestKey, challenge.toWwwAuthenticate(), transfer.hash(),
                        transfer.rawTransaction(), now())
                .update();
        return find(requestKey).orElseThrow();
    }
```

From that point, `MppPaymentClient` only ever resumes. Look back at `resume`
and `redeem`:

- **The application crashed before the transaction reached the network.**
  The operation is `PENDING_PAYMENT`. It broadcasts the same signed
  transaction. Same transaction, same hash. It is never signed a second time.
- **The payment went through but the answer was lost.** The operation is
  `BROADCAST`. The client presents the same credential with the same
  `Idempotency-Key`, up to three times.
- **The courier will not hand it over.** The client marks the operation
  `UNDELIVERED`, records `not paying again`, and throws
  `PaidButUndeliveredException` with the transaction hash. It never pays again
  on its own. A person can follow it up with the hash in hand.

The courier keeps its own durable record of each verified redemption: the
transaction hash, the challenge id, the `Idempotency-Key`, a fingerprint of
the parcel, the quote it sold and the receipt. Before mpp-java sees a
credential, the courier checks it here.

`courier-api/src/main/java/com/codewithsam/courier/provider/redemption/RedemptionService.java` (excerpt):

```java
    public Optional<Redemption> findEarlier(
            String authorization, String idempotencyKey, QuoteRequest request) {
        Optional<Credential> credential = parse(authorization);
        Optional<Redemption> earlier = credential.flatMap(RedemptionService::paidHash)
                .flatMap(store::findByTxHash);
        if (earlier.isEmpty()) {
            return Optional.empty();
        }
        Redemption redemption = earlier.get();
        boolean sameRequest = idempotencyKey != null
                && idempotencyKey.equals(redemption.idempotencyKey())
                && redemption.requestFingerprint().equals(request.fingerprint())
                && redemption.challengeId().equals(credential.get().challenge().id());
        if (!sameRequest) {
            throw new VerificationFailedException(
                    "transaction hash already redeemed: " + redemption.txHash());
        }
        log.info("recovered paid quote for tx {}", redemption.txHash());
        return earlier;
    }
```

The same purchase, retried, gets the stored quote and the original receipt
back without another charge. A redeemed hash with a different parcel, a
different key or no key at all is refused with `402 verification-failed`.
mpp-java's own replay protection stays in place behind this check.

A note on the specification, because the two rules look like they conflict.
The core draft says servers "MUST NOT accept the same credential twice", and
suggests `Idempotency-Key` so that a retried paid request returns "the same
response as the original successful request without re-executing the
operation". The courier never settles a credential twice. It only replays the
stored response to the identical request. That is this project's reading of
how the two rules fit together, not text from the specification.

Now inject exactly the same failure, with the safe client.

`evidence/05-lost-response.txt` (excerpt):

```text
## Safe client. A fresh courier-api with the same misbehaviour

$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999978.447966 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  21.55 pathUSD
```

```text
$ bin/balance.sh
0x103604c41634224c9914bd79988369d694c69e2a  1999978.397925 pathUSD
0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb  21.6 pathUSD
```

```text
# courier-api log
c.c.c.p.payment.PaymentProblemAdvice     : 402 Payment Required: Payment is required for "localhost:18090" (Premium courier quotation)., challenge 4mrdZvdbtGICwTRZGV9SYFfDvnTuRfIIcNVFPeGJzBc
c.c.c.provider.payment.PaymentGate       : payment verified, tx 0xf370f84212087d72ec7239eaab25c6b32f37820e5a64a0fb8bcfac9e9432226d
c.c.c.p.m.LostResponseSimulator          : dropping a paid response on purpose
c.c.c.p.redemption.RedemptionService     : recovered paid quote for tx 0xf370f84212087d72ec7239eaab25c6b32f37820e5a64a0fb8bcfac9e9432226d
```

The courier's balance went up by 0.05, not 0.10. One challenge, one verified
payment, one recovery. The client's audit for the same run records the steps
`APPROVED`, `PAID`, `RESPONSE_LOST` with the detail
`attempt 1: no answer, same credential again`, and `DELIVERED`, all against
the one transaction `0xf370f842...`.

One quote. One payment. One transaction hash. The network was not made more
reliable. The payment workflow was made recoverable.

And the other side of the same record: the credential from the first
exchange, presented for a 9 kg parcel instead of 2 kg, is refused.

`evidence/06-replay-rejected.txt` (excerpt):

```text
== B. Same credential, same Idempotency-Key, a 9 kg parcel ==
< HTTP/1.1 402
```

```text
{"type":"https://paymentauth.org/problems/verification-failed","title":"Verification Failed","status":402,"detail":"Payment verification failed: transaction hash already redeemed: 0x2ec458ed110b51c5f38900e8cb03bb53575110c8860fd0a612bf62a74fabb76a.","challengeId":"4uUF5q8bEAPlWSnVqXFsgs_EmVo0KE8wubiVnV-RhXQ"}
```

## The transactions in the video

The runs recorded for the episode on 2026-10-11 used the same payer and
courier wallets. These are the transactions on screen, on Tempo Moderato
testnet. Anyone can open them.

| Run | Amount | Transaction |
|---|---|---|
| Safe client, one paid quote | 0.05 | [0xc6dcf417...8027d3](https://explore.testnet.tempo.xyz/tx/0xc6dcf417344f9a3c6535f76fba782d9b8f45ae5644744d50c354ef8f5e8027d3) |
| Claude Code compares the couriers | 0.05 | [0x97a72969...7c3817](https://explore.testnet.tempo.xyz/tx/0x97a72969802b50522d5fe4eb5a5622fa3b6a56967fb3fd80412df08fe47c3817) |
| Unsafe client, price raised | 5.00 | [0x84feb591...0c530d](https://explore.testnet.tempo.xyz/tx/0x84feb59189a69135aeec3b4ad5e29567e58df94d20e73be44eb731f98e0c530d) |
| Unsafe client, lost response, first payment | 0.05 | [0xceb676ce...9cbaf7](https://explore.testnet.tempo.xyz/tx/0xceb676cee429080efaebd8f32d0cad66570787a312b65fdf101b3a4fdf9cbaf7) |
| Unsafe client, lost response, second payment | 0.05 | [0x72108c53...b1c2a6](https://explore.testnet.tempo.xyz/tx/0x72108c53cda1cb16d585f33007501caaa2db3250b7a3828b242f78356eb1c2a6) |
| Safe client, lost response, one payment | 0.05 | [0x70e97ab9...f4b3fe](https://explore.testnet.tempo.xyz/tx/0x70e97ab959bde6e0e70e2f396254df204ae8a45966b48f3351bc20a274f4b3fe) |
| Claude Code final run, 5.00 refused first | 0.05 | [0xb4456e6b...aa6e92](https://explore.testnet.tempo.xyz/tx/0xb4456e6b636b5eb7ef82ee4e6ef49a8931073e52df36b337d20d9b1d77aa6e92) |

Payer `0x103604c41634224c9914bd79988369d694c69e2a`, courier
`0xe614e43e4fbf9867bdf4e2ddbd3f628658b93ddb`. Both are public testnet
addresses.

## The tests

The offline tests use a fake wallet and `MockRestServiceServer`, so they need
no network: every policy refusal, the memo binding, challenge parsing,
recovery after a lost response or a timeout, resuming after a crash before
broadcast, the courier's redemption rules, the unsafe client's two failures,
and a real MCP client listing the tools.

The integration tests start the real `courier-api` jar as a separate process
and pay on Tempo testnet. They check balances on chain: a paid quote moves
exactly 0.05 to the courier; a policy refusal leaves the payer's nonce and
balance unchanged; the unsafe client pays 5.00 when the price is raised; a
lost response costs the unsafe client 0.10 and the safe client 0.05; a
redeemed hash cannot buy a different request.

`retailer-assistant/src/test/java/com/codewithsam/courier/payment/MppPaymentTestnetIT.java` (excerpt):

```java
    void aLostResponseCostsTheUnsafeClientTwoTransfersAndTheSafeClientOne()
            throws Exception {
        try (CourierProcess courier = CourierProcess.start(18193, courierEnv,
                "--courier.misbehaviour.lose-paid-responses=1")) {
            BigDecimal before = courierBalance();
            unsafeClient.get(courier.uri(PREMIUM + "3"));
            assertThat(courierBalance().subtract(before)).isEqualByComparingTo("0.10");
            assertThat(audit.entries()).filteredOn(e -> e.client().equals("unsafe"))
                    .hasSize(2);
        }
        try (CourierProcess courier = CourierProcess.start(18194, courierEnv,
                "--courier.misbehaviour.lose-paid-responses=1")) {
            BigDecimal before = courierBalance();

            PaidResponse paid = safeClient.get(courier.uri(PREMIUM + "3"), "it-lost");

            assertThat(paid.body()).contains("Swift Courier Premium");
            assertThat(courierBalance().subtract(before)).isEqualByComparingTo("0.05");
            assertThat(audit.entries()).filteredOn(e -> e.client().equals("safe"))
                    .extracting(PaymentAuditEntry::outcome)
                    .containsExactly(AuditOutcome.APPROVED, AuditOutcome.PAID,
                            AuditOutcome.RESPONSE_LOST, AuditOutcome.DELIVERED);
            System.out.println("recovered tx " + network.transactionUrl(paid.txHash()));
        }
    }
```

`evidence/08-tests.txt` (excerpt):

```text
retailer-assistant  MppPaymentClientTest
  ok   pays once then retries with a hash credential
  ok   a request already redeemed is answered from the record
  ok   a lost response is recovered with exactly one transfer
  ok   a crash before the broadcast resumes the same signed transfer
  ok   a free response costs nothing
  ok   a timeout after paying is recovered the same way
  ok   if the courier will not hand it over the client stops and never pays again
  ok   a policy refusal broadcasts nothing
```

```text
retailer-assistant  HttpExchangeTranscriptTestnetIT
  ok   records one real exchange and the replay attempts
retailer-assistant  MppPaymentTestnetIT
  ok   the unsafe client pays the raised price
  ok   a redeemed transaction cannot buy a different request
  ok   a policy refusal broadcasts nothing
  ok   a lost response costs the unsafe client two transfers and the safe client one
  ok   free quote then402 then payment then200 with a receipt

49 tests, 0 failed
```

That file was recorded on 2026-10-09 with the testnet tests included: 49
tests, 0 failed. The twenty-thread budget test was added the next day, so it
is not in that file. Running the offline suite (`bin/tests.sh`) at commit
`cd2e4d1` gives 44 tests, 0 failed, including
`twenty simultaneous requests cannot overspend the daily budget`.

## What this does not prove

- **That MPP is how APIs will be paid for.** At the time of writing it is an
  Internet-Draft and the Java library is experimental. Treat it as something
  worth understanding early, not something everyone already uses.
- **Production readiness.** Plain HTTP on localhost, one instance of each
  application, H2 files on disk. The spec requires TLS. mpp-java's replay
  store is in memory, per process; its README recommends a shared store such
  as Redis for more than one instance. The courier's redemption table does
  survive a restart.
- **A budget across several instances.** The `synchronized` reservation
  holds inside one process only.
- **Pull mode.** Only push mode (`type=hash`) is implemented.
- **Anything about real money.** Every payment is a testnet token with no
  value.

## Interview questions this answers

1. What does an HTTP `402` with `WWW-Authenticate: Payment` ask the client to
   do, and has anything been paid when it arrives?
2. What is the difference between MCP and MPP, and which one moves money?
3. Why must a Tempo payment carry a memo bound to the challenge, in the SDK
   version tested here?
4. Why does a gas limit that works for every later transfer fail on a new
   wallet's first one?
5. A client paid, and the response was lost. What decides whether a retry
   pays again?
6. What is the difference between duplicate settlement, duplicate redemption
   and recovery, and which side owns each?
7. Why must the spending policy run in code before signing, rather than be
   left to the AI calling the tool?

## Run it yourself

All the code is in
[spring-boot-mpp-courier](https://github.com/code-with-sam-dev/spring-boot-mpp-courier).
You need JDK 25 (`bin/java25.sh` finds it; set `JAVA_HOME_25` if it does not)
and network access to `https://rpc.moderato.tempo.xyz`. No real money and no
account anywhere: the faucet funds the test wallet.

```sh
bin/build.sh                # build everything, run the offline tests
bin/new-wallet.sh           # keys into .env (mode 600, gitignored), fund the payer
bin/balance.sh              # pathUSD balances of payer and courier
bin/courier.sh              # courier-api on 8090
bin/assistant.sh            # retailer-assistant on 8080, MCP at /mcp
curl 'localhost:8080/assistant/quotes/compare?from=London&to=Manchester&weightKg=2'
curl localhost:8080/assistant/payments
bin/challenge.sh            # ask for the premium quote unpaid, decode the 402 challenge
bin/audit.sh                # the payment audit, one row per line
```

The private key stays in `.env` on your machine. It is gitignored, and
nothing in the project prints it. The courier needs only its address.

The break chapter switches:

```sh
bin/courier.sh --courier.premium.price=5.00                  # the courier raises its price
bin/courier.sh --courier.misbehaviour.lose-paid-responses=1  # the first paid answer is lost
bin/assistant.sh --spring.profiles.active=break              # adds GET /break/quotes/premium
```

The tests:

```sh
bin/tests.sh            # 44 offline tests, no network, one line each
bin/tests.sh testnet    # plus 6 integration tests that pay on Tempo testnet
./mvnw verify -Ptestnet # the same, plain Maven
```

To connect an AI assistant, start both applications and open the project in
any MCP host. Claude Code picks up `.mcp.json` from the project root.

Each file in `evidence/` starts with the command that produced it, and the
README lists them all. Your transaction hashes and balances will differ. The
shape should not: the unsafe client pays whatever it is asked and pays again
after a lost response; the safe client refuses over its limits and pays once.

The free [design sheet](/downloads/spring-boot-mpp-ai-agent-pays.pdf) has the
402 flow, the MCP and MPP table, the client, the payer, the policy, the
twenty-thread test and the recovery check on a few pages you can keep next to
your editor.

## In one line

A `402` is a payment challenge, not a charge: MCP lets an assistant call your
Java tools, MPP lets those tools pay for an API, and whenever software can
spend money, the policy and the recovery live in your code, never in the AI
deciding its own limits.
