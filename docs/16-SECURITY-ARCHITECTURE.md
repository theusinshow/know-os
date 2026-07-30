# 16 — Security Architecture

## Trust boundaries

1. Browser UI.
2. Application server.
3. PostgreSQL.
4. Imported Pack files.
5. Learner code runtime.
6. Exported files.
7. Future external integrations.

Pack files and learner code are always untrusted.

## Major threats

- script or markup injection through content blocks;
- runtime escape or resource exhaustion;
- maliciously large/deep Pack payloads;
- schema confusion and unsafe migrations;
- partial imports corrupting content;
- accidental exposure of private notes/source code in exports;
- secrets in logs or repository;
- insecure direct object access after multi-user evolution.

## Required controls

- allowlisted block renderers;
- sanitization for supported rich text;
- schema depth, size and count limits;
- transactions for import application;
- parameterized ORM queries;
- owner scoping on user data;
- isolated code runtime with timeout/output limits;
- explicit export selection;
- dependency and CI scanning before public deployment;
- security headers and CSP appropriate to editor/runtime needs.

## Authentication

No internet-accessible production deployment is approved without a dedicated authentication/session ADR and threat review.
