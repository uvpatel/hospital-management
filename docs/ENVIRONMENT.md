# Environment and Configuration

## Required Environment Variables

Create `.env.example` with placeholders only.

Suggested variables:

```text
NODE_ENV=
DATABASE_URL=
AUTH_SECRET=
APP_URL=
```

Add storage/email variables only when those integrations are implemented.

## Validation

Create `lib/env.ts` using Zod. Validate required environment variables at server startup/build boundary as appropriate.

Never access unvalidated `process.env.*` throughout the codebase. Centralize server environment access.

## Secrets

- `.env` is gitignored.
- `.env.example` contains no secrets.
- Never commit database credentials, auth secrets, API keys, SMTP passwords, or storage keys.
- Production secrets come from deployment secret management.

## Database Environments

Use separate databases/credentials for:
- development
- test
- production

Never point automated tests or seed scripts at production.
