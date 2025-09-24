# How to Rotate JWT Keys

1. Generate new RSA key pair:
   ```bash
   openssl genrsa -out jwt-private.pem 4096
   openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
   ```
2. Update secrets store / deployment variables with the new PEM contents for `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`.
3. Redeploy backend instances. During rotation window you can keep both old/new keys available by storing the previous public key in a trust store (future enhancement: JWKS endpoint).
4. Invalidate outstanding refresh tokens if the key rotation is in response to compromise (`POST /auth/logout` for all sessions or a bulk revocation job).

Remember: private key must stay private; never commit PEM content to git.