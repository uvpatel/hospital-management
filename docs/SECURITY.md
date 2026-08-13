# Security and Authorization

## Authentication

- Use secure server-side sessions.
- Store passwords only as strong password hashes if credentials auth is used.
- Cookies must use secure defaults appropriate to environment (`HttpOnly`, `Secure` in production, suitable `SameSite`).
- Rotate/invalidate sessions after sensitive account changes where appropriate.
- Never expose session tokens in browser logs or URLs.

## Authorization

Use permission codes, for example:

```text
patients.read
patients.create
patients.update
appointments.read
appointments.create
appointments.manage
encounters.read
encounters.write
prescriptions.write
admissions.read
admissions.manage
laboratory.read
laboratory.manage
pharmacy.read
pharmacy.manage
billing.read
billing.manage
payments.create
expenses.read
expenses.manage
reports.read
users.manage
roles.manage
audit.read
settings.manage
```

Every API mutation and protected read checks permissions server-side.

## Data Exposure

Return only fields required by the screen/API consumer. Avoid leaking password hashes, internal session data, sensitive audit metadata, or unrelated patient information.

## Input Security

- Zod validation on untrusted input.
- Database query builder parameterization; do not create SQL by string concatenating user input.
- Allowlist sorting fields.
- Limit search lengths and pagination sizes.
- Validate uploaded file type/size server-side.
- Generate storage object keys server-side.

## CSRF and Mutations

Follow the security model of the chosen session/auth mechanism. Mutations must not be implemented as GET requests. Validate origin/CSRF mechanism where required by the auth architecture.

## Sensitive Logs

Do not log:
- Passwords.
- Password hashes.
- Session tokens.
- Authorization headers.
- Full sensitive clinical notes unless specifically required in a protected audit system.

## Rate Limiting

Apply rate limiting at least to:
- Login/auth endpoints.
- Password reset endpoints.
- Public-facing lookup/upload endpoints if introduced.

Internal authenticated operational endpoints may also need abuse controls depending on deployment.

## Audit Integrity

Audit records are append-only through normal application behavior. Users cannot edit/delete audit events from UI.

## File Uploads

- Do not trust file extension.
- Validate MIME/type and maximum size.
- Use private storage for patient documents by default.
- Downloads require authorization checks.
- Do not expose unrestricted public object URLs for sensitive patient documents.

## Healthcare Compliance Note

This architecture provides security foundations but does not by itself certify compliance with HIPAA, ABDM, GDPR, or local healthcare regulation. Production deployment must add the legal, organizational, retention, consent, encryption, backup, access-review, and incident-response controls required by the target jurisdiction.
