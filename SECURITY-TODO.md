# Security Roadmap & Known Vulnerabilities

This document outlines structural security gaps that require architectural changes (such as introducing a backend server) to fully resolve.

## 1. Client-Side TOTP Validation
**Current State:** The TOTP secret for generating activation codes is embedded within the client application. Although consolidated to `services/activation.ts`, a sophisticated user can extract this secret from the compiled bundle to generate valid activation keys.
**Required Solution:** Move the activation validation logic to a backend service. The client should send the user-provided code to the backend, which will return a signed session token (JWT) upon successful validation.

## 2. Client-Side RBAC & Direct Database Access
**Current State:** The application communicates directly with the Turso (libsql) database using a full-access token stored in `localStorage`. Role-Based Access Control (RBAC) is only enforced in the UI. A malicious user with Cashier privileges could extract the database token and perform Owner-level operations directly against the Turso API. Moreover, the current user role is stored as plaintext in `localStorage` and can be tampered with.
**Required Solution:** 
1. Revoke the client's direct access to the database.
2. Introduce a backend API layer to mediate all database interactions.
3. The backend must validate the user's signed JWT token, verify their server-side role, and authorize the specific operation before executing the query against Turso.

## 3. Local Mode Trial Enforcement
**Current State:** The "Local Mode" bypasses the activation check entirely. We have implemented a 14-day trial period enforced via `localStorage`. However, clearing browser data resets this trial.
**Required Solution:** If local mode is intended as a commercial trial, the trial anchor should be bound to a hardware ID or an OS-level protected file (via Electron's main process), rather than relying solely on `localStorage`.

## 4. Third-Party Pricing Proxies
**Current State:** Live gold prices are fetched using public CORS proxies (`corsproxy.io`, `api.allorigins.win`). These services can inject malicious data or go offline. Sanity bounds have been added, but the core issue remains.
**Required Solution:** The planned backend should be responsible for fetching live gold prices from reliable APIs and serving them to the client.
