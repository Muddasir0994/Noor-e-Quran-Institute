## 2024-05-18 - Hardcoded API Key in Example Env

**Vulnerability:**
Hardcoded API keys and admin credentials in `.env.example` file. This is a security risk because developers might accidentally commit this file with sensitive information, or attackers might find it and use the credentials.

**Learning:**
Always use empty strings or dummy values in `.env.example` files to indicate what variables are expected, without exposing any actual sensitive data.

**Prevention:**
Implement automated scanning (e.g., using a secret scanner like git-secrets or TruffleHog) in CI/CD pipelines to prevent `.env` files or files containing secrets from being committed. Ensure `.env.example` files are thoroughly reviewed for sensitive information.
