# Quick Start: Jira Integration

## 5-Minute Setup

### 1. Get Your Jira API Token
Visit: https://id.atlassian.com/manage-profile/security/api-tokens
- Click "Create API token"
- Copy the token

### 2. Create `.dev.vars` File
```bash
# In the project root, create .dev.vars
JIRA_DOMAIN=yourcompany.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=paste_your_token_here
```

### 3. Start Development Server
```bash
npm run workers:dev
```

### 4. Test It
- Open http://localhost:8787
- Go to "Quick Jira Ticket Creator"
- Enter a description
- Click "Create Ticket"
- ✅ Success! You should see a link to your new ticket

## For Production Deployment

```bash
wrangler secret put JIRA_DOMAIN
wrangler secret put JIRA_EMAIL
wrangler secret put JIRA_API_TOKEN
npm run workers:deploy
```

## Troubleshooting

**Error: "Jira credentials not configured"**
- Check that `.dev.vars` exists in the project root
- Restart the dev server

**Error: "Failed to create Jira ticket"**
- Verify your Jira domain (no `https://`)
- Check your API token is valid
- Ensure you have permission to create tickets in the DES project

**Still not working?**
- Use the "Copy Command" button as a fallback
- Paste the command in Slack for RespectTables to create the ticket

---

For detailed setup instructions, see [JIRA_SETUP.md](./JIRA_SETUP.md)
