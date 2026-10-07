---
title: 'Complete CI/CD Pipeline, Step by Step: GitLab to AWS EKS'
youtube: 'vf1679noofQ'
cover: '/covers/gitlab-ci-to-aws-eks.jpg'
description: 'A complete, hands-on CI/CD lab. GitLab CI pipelines that test, scan and gate every change, one image promoted by digest through four environments on AWS EKS, Argo CD keeping each in sync with Git, and a canary that judges itself on real orders.'
pubDate: 2026-10-07
sheet: '/downloads/gitlab-ci-to-aws-eks.pdf'
repo: 'https://gitlab.com/cws-cicd-eks'
tags: ['gitlab-ci', 'aws', 'kubernetes', 'argo-cd', 'terraform', 'devops']
series: 'CI/CD from Zero to Production'
episode: 1
duration: '2:07:39'
draft: false
---

A release can answer every request with a 201 and still be wrong. In this lab a
faulty release passed every gate and every environment's Playwright tests, then
in production charged the wrong total on every order it answered. The canary
caught it, aborted, and sent traffic back to the stable version.

This is the whole pipeline that made that possible, built step by step. Everything
here ran for real on GitLab and AWS while the video was recorded, and every number
below comes from those runs. Follow it in order and you end with the same running
pipeline.

## What you build

- GitLab CI pipelines that test, scan and gate every change
- An image built once and promoted by digest through Dev, UAT, PreProd and
  Production on AWS EKS
- Argo CD keeping each environment in sync with Git
- A canary that checks real orders, and alerts to Slack

## The five repositories

| Repository | What it holds |
| --- | --- |
| [orders-backend](https://gitlab.com/cws-cicd-eks/orders-backend) | The Java service and its pipeline: tests, gates, publish, deploy to Dev |
| [orders-frontend](https://gitlab.com/cws-cicd-eks/orders-frontend) | The web app and its pipeline |
| [platform-infra](https://gitlab.com/cws-cicd-eks/platform-infra) | AWS as code with Terraform, plus the teardown scripts |
| [orders-gitops](https://gitlab.com/cws-cicd-eks/orders-gitops) | What UAT, PreProd and Production run, and the platform Argo CD installs |
| [orders-gitops-dev](https://gitlab.com/cws-cicd-eks/orders-gitops-dev) | What Dev runs, updated by the application pipelines |

## No stored AWS keys

No AWS key is stored in GitLab. Each job trades a token GitLab signs for
credentials that last minutes, and AWS only accepts it for one project on its
protected main branch. Push the `demo/oidc-denied` branch and the job fails with
`AccessDenied ... Not authorized to perform sts:AssumeRoleWithWebIdentity`.

## Five planted mistakes, five blocked merges

| Branch | What it plants | What blocks it |
|---|---|---|
| demo/gate-unit-test | one cent per line | verify: expected 12498, was 12500 |
| demo/gate-sast | SQL built by concatenation | security-gate: High, SQL Injection |
| demo/gate-secret | a token in a properties file | security-gate: Critical, GitLab personal access token |
| demo/gate-dependency | commons-text 1.9 | dependency-scan: CVE-2022-42889, critical |
| platform-infra demo/gate-iac | port 22 open to the internet | misconfiguration-scan: AWS-0107 |

Two settings decide whether a gate exists at all. GitLab's SAST and secret
detection templates skip merge request pipelines unless
`AST_ENABLE_MR_PIPELINES` is `"true"`. And without **Pipelines must succeed**
under the project's merge checks, a gate fails and the merge button still works.
The security gate also fails when a scan report is missing: a scanner that did
not run must never look like a scanner that found nothing.

## One artifact, four environments

The image is built once, scanned before it is pushed, and recorded by digest.
Every later environment receives that digest through a merge request that copies
one file. Then ask the cluster, not the pipeline:

```bash
for e in dev uat preprod prod; do
  kubectl -n orders-$e get pods -l app=backend -o jsonpath='{.items[0].status.containerStatuses[0].imageID}'; echo
done
```

The same digest four times, equal to ECR.

## Changing the database safely

Renaming a column in one release broke Dev the moment the first new pod migrated,
while every test had passed, because tests only ever run one version. Three
releases instead: expand, contract, cleanup. Through the cleanup release we
counted 1,420 orders that succeeded and 3 that failed, all three answered by the
load balancer, not the app, in the same few seconds of full promotion. Part 9 removes
that window: 1,479 orders, 0 failed.

## A canary that judges itself

Production moves 10, 25, 50, then 100 percent:

```yaml
canary:
  steps: [10, 25, 50]   # percent of traffic, each held while analysis runs
  pause: 2m
```

At each step the analysis checks the canary's own version: enough real orders,
no server errors, no wrong totals. The last one is the check HTTP cannot make.
Synthetic shoppers order a fixed basket with a known total, and an order only
counts as right if the total is right too:

```js
  const version = res.headers["X-App-Version"] || "unknown";
  const right = res.status === 201 && res.json("totalCents") === EXPECTED_CENTS;
  checks.add(1, { version: version, result: right ? "right" : "wrong" });
```

The faulty release aborted with an error rate of 0 and a wrong total rate of 1.
That proves one business rule held, not that a release is healthy in every way.

## Stop the meter, and prove it

While the cluster runs, AWS costs about 0.50 USD an hour. Building, testing and
tearing down in one sitting costs a few dollars. When you are done:

```bash
cd platform-infra
export KUBECONFIG=~/.kube/cws-cicd   # the script refuses any other cluster
./tools/teardown.sh          # removes what Kubernetes created, then terraform destroy
./tools/verify-teardown.sh   # asks AWS directly; every line must be 0
```

From the moment the platform is applied, never walk away from a running cluster.
Finish the checkpoint you are on, or tear down.

## Follow along

The five repositories are linked above, and the free design sheet has the trust
policy, the publish job, the gate, the canary analysis and the synthetic shopper
on one page. Versions as checked in October 2026, at the time of recording: Java
25, Node 24, Terraform 1.16. Newer ones may differ.

Kafka through this same pipeline, and the GitHub version of everything here,
will follow.
