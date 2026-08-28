
## 2024-05-18 - Hardcoded Admin Credentials in Environment Example File
**Vulnerability:** Weak, default administrative credentials were provided directly in the `.env.example` file.
**Learning:** Development documentation and sample files must never include usable credentials, even as examples, as developers frequently copy these files verbatim during setup and fail to change the defaults before production deployment.
**Prevention:** Always use placeholder text (e.g., `<YOUR_ADMIN_PASSWORD>`) or empty strings (`""`) for sensitive values in example environment configuration files.
