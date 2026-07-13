# Pages CMS

[Pages CMS](https://pagescms.org) is an open source CMS for GitHub repositories. It is especially well suited for static sites and content-driven apps built with tools like Jekyll, Hugo, Next.js, Astro, VuePress, and similar stacks.

You can use the hosted version directly at [app.pagescms.org](https://app.pagescms.org), or run your own local development copy from this repository.

[![Screenshot of the Pages CMS editor](https://pagescms.org/media/screenshot.png)](https://demo.pagescms.org)

*[Watch the demo ▶](https://demo.pagescms.org)*

## Documentation

Full documentation lives at [pagescms.org/docs](https://pagescms.org/docs).

Useful starting points:

- [Install locally](https://pagescms.org/docs/guides/installing/)
- [Create the GitHub App](https://pagescms.org/docs/guides/installing/github-app/)
- [Environment variables](https://pagescms.org/docs/development/environment-variables/)
- [Upgrading to 2.x](https://pagescms.org/docs/guides/upgrading-to-2/)

## Use online

The easiest way to get started is the hosted version at [app.pagescms.org](https://app.pagescms.org).

Use that if you want to:

- try Pages CMS immediately,
- edit content without running anything locally,
- stay on the latest hosted version.

## Local development

### What you need

- PostgreSQL
- a GitHub App
- a local `.env.local`
- the Pages CMS repo checked out locally

### Quick start

1. Clone the repository:

```bash
git clone https://github.com/pagescms/pagescms.git
cd pagescms
```

2. Start PostgreSQL locally (Docker Compose, data persisted in a volume):

```bash
npm run db:up
```

Stop it later with `npm run db:down`.

3. Install dependencies:

```bash
npm install
```

4. Create `.env.local` with at least:

```bash
DATABASE_URL=postgresql://pagescms:pagescms@localhost:5432/pagescms
BETTER_AUTH_SECRET=your-random-secret
CRYPTO_KEY=your-random-secret
```

Optional but useful:

```bash
BASE_URL=https://cms.example.com
ADMIN_EMAILS=admin@example.com
```

Notes:

- In production, `BASE_URL` should be the single canonical URL for the app.
- Do not mix a custom domain and a `*.netlify.app` URL for the same install.
- `ADMIN_EMAILS` is a comma-separated allowlist for access to the admin panel.

Generate secrets with:

```bash
openssl rand -base64 32
```

5. Start a public HTTPS tunnel (GitHub rejects `localhost` webhook URLs):

```bash
npm run tunnel
```

By default this is a Cloudflare quick tunnel (random URL on every start,
requires [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)).
For a stable URL, set `TUNNEL_HOSTNAME` in `.env.local` and create a
named tunnel once — see the header of `scripts/dev-tunnel.mjs`.

6. Create your GitHub App with the helper (in another terminal, with the
tunnel running so its URL is used for the app):

```bash
npm run setup:github-app -- --env .env.local
```

Useful options:

- `--base-url <url>` (defaults to the tunnel URL, else `http://localhost:$PORT`)
- `--owner-type personal|org`
- `--org <slug>`
- `--app-name "Pages CMS (local)"`
- `--no-open`

After creation, set "Email addresses" to "Read-only" under the app's
account permissions (manifests cannot set account permissions), then
install the app on your account.

7. Run database migrations:

```bash
npm run db:migrate
```

If cache state is known stale or corrupted, clear it with:

```bash
npm run db:clear-cache
```

8. Start the app:

```bash
npm run dev
```

Or start the app and the tunnel together:

```bash
npm run dev:tunnel
```

While the tunnel runs, it keeps `BASE_URL` (via `.env.development.local`)
and the GitHub App's webhook URL in sync. Set
`DEV_REDIRECT_TO_BASE_URL=true` to redirect `localhost` to the tunnel URL
so the app is always used from a single origin.

For more detail, see:

- [Install locally](https://pagescms.org/docs/guides/installing/)
- [Create the GitHub App](https://pagescms.org/docs/guides/installing/github-app/)
- [Environment variables](https://pagescms.org/docs/development/environment-variables/)
- [Caching](https://pagescms.org/docs/development/caching/)

## Support the project

- [Contribute code](https://github.com/pagescms/pagescms/pulls)
- [Report issues](https://github.com/pagescms/pagescms/issues)
- [Sponsor me](https://github.com/sponsors/hunvreus)
- [Star the project on GitHub](https://github.com/pagescms/pagescms)
- [Join the Discord chat](https://pagescms.org/chat)

## License

Everything in this repo is released under the [MIT License](LICENSE).
