# Cloudflare Access Authentication Setup

Your Jira instance (`jira.cfdata.org`) is protected by Cloudflare Access, which requires special authentication headers instead of standard Jira API tokens.

## ✅ Configuration Complete

The `.dev.vars` file has been created with your Cloudflare Access credentials:

```bash
JIRA_DOMAIN=jira.cfdata.org
CF_ACCESS_CLIENT_ID=36bac0f8820e36e3c7e06dce36c3f6c0.access
CF_ACCESS_CLIENT_SECRET=1ec1894e59ab3d82cc0d97b77d659f1ec244764e24cd3286d78bb8548a23ebee
```

**Note:** This file is automatically ignored by git for security.

## How It Works

When creating Jira tickets, the application sends these headers with each API request:

```
CF-Access-Client-Id: 36bac0f8820e36e3c7e06dce36c3f6c0.access
CF-Access-Client-Secret: 1ec1894e59ab3d82cc0d97b77d659f1ec244764e24cd3286d78bb8548a23ebee
```

These headers authenticate your requests through Cloudflare Access to reach the Jira API.

## Testing

1. **Development server is running** at http://localhost:8787

2. **To test the integration:**
   - Navigate to the "Quick Jira Ticket Creator" section
   - Enter a ticket description
   - Click "Create Ticket"
   - If successful, you'll see a link to the created ticket

3. **Check the browser console** for any error messages if the ticket creation fails

## Production Deployment

When deploying to Cloudflare Workers, set these secrets:

```bash
wrangler secret put JIRA_DOMAIN
# Enter: jira.cfdata.org

wrangler secret put CF_ACCESS_CLIENT_ID
# Enter: 36bac0f8820e36e3c7e06dce36c3f6c0.access

wrangler secret put CF_ACCESS_CLIENT_SECRET
# Enter: 1ec1894e59ab3d82cc0d97b77d659f1ec244764e24cd3286d78bb8548a23ebee
```

Then deploy:
```bash
npm run workers:deploy
```

## Troubleshooting

### Error: "Jira credentials not configured"
- Restart the development server: `npm run workers:dev`
- Verify `.dev.vars` exists in the project root

### Error: "Failed to create Jira ticket" with 403
- Your Cloudflare Access credentials may be invalid or expired
- Contact your Cloudflare Access administrator to verify the client ID and secret

### Error: "Failed to create Jira ticket" with 401
- The Jira API may require additional authentication
- Verify you have permission to create tickets in the DES project

### Error: "Failed to create Jira ticket" with 404
- Verify the Jira domain is correct: `jira.cfdata.org`
- Check that the DES project exists and you have access

## Security Notes

- ✅ `.dev.vars` is ignored by git
- ✅ Credentials are stored as environment variables
- ✅ Never commit secrets to version control
- ⚠️ Rotate Cloudflare Access credentials periodically
- ⚠️ Monitor Cloudflare Access logs for unauthorized usage

## Differences from Standard Jira Auth

**Standard Jira (Atlassian Cloud):**
- Uses email + API token
- Basic Authentication header
- Example: `Authorization: Basic base64(email:token)`

**Cloudflare Access Protected Jira:**
- Uses client ID + client secret
- Custom CF-Access headers
- Example: `CF-Access-Client-Id` and `CF-Access-Client-Secret`

Your setup uses the Cloudflare Access method since your Jira is behind Cloudflare Access protection.
