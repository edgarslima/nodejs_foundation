# How to Complete the Reset Password Flow

1. User triggers the flow via `POST /auth/forgot-password` with their email.
2. Backend generates a base64url token, stores its SHA-256 hash (pepper included) with TTL ~20 minutes, logs the IP/User-Agent, and sends the email (currently logged for dev).
3. User visits the frontend `/reset-password?token=...` page.
4. Frontend submits the new password together with the token to `POST /auth/reset-password`.
5. Backend verifies the hashed token, marks it as used, updates the password (argon2id), revokes existing refresh tokens, and returns 204.
6. User is redirected to `/login` and must authenticate with the new password.

Any subsequent attempt to reuse the same token fails because the record is marked as `usedAt` or expired.