# Turnstile Verification API

This endpoint verifies Cloudflare Turnstile CAPTCHA tokens.

## Configuration

### Environment Variables

- `TURNSTILE_SECRET_KEY` - Your Cloudflare Turnstile secret key (server-side)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Your Cloudflare Turnstile site key (client-side)

### Important Notes

1. **Site key and secret key must be from the same Turnstile widget** in Cloudflare Dashboard. Using keys from different widgets will cause `invalid-input-secret` errors.

2. **Sandbox mode should only be used with test keys**, not with real secret keys. Using `sandbox: true` with a real key causes verification to fail.

3. **In development/test environments**, if `TURNSTILE_SECRET_KEY` is not set, the API falls back to Cloudflare's test key (`1x0000000000000000000000000000000AA`) which always passes.

## Cloudflare Test Keys

For testing purposes, Cloudflare provides these keys:

| Type | Site Key | Secret Key |
|------|----------|------------|
| Always passes | `1x00000000000000000000AA` | `1x0000000000000000000000000000000AA` |
| Always fails | `2x00000000000000000000AB` | `2x0000000000000000000000000000000AA` |
| Forces interactive challenge | `3x00000000000000000000FF` | `3x0000000000000000000000000000000AA` |

## Troubleshooting

### `invalid-input-secret` Error

This error means Cloudflare rejected the secret key. Common causes:

1. Secret key is incorrect or from a different Turnstile widget than the site key
2. Using `sandbox: true` with a real (non-test) secret key
3. Secret key was rotated/regenerated in Cloudflare but not updated in your env
