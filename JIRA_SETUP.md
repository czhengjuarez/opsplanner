# Jira Integration Setup Guide

This guide explains how to configure the Jira integration for direct ticket creation from the Ops Planner.

## Overview

The application now supports two methods for creating Jira tickets:

1. **Direct API Integration** - Create tickets directly via the Jira REST API
2. **RespectTables Command** - Copy a command to paste in Slack (fallback method)

## Prerequisites

You need the following information from your Jira account:

1. **Jira Domain** - Your Jira instance domain (e.g., `yourcompany.atlassian.net`)
2. **Jira Email** - The email address associated with your Jira account
3. **Jira API Token** - A personal API token for authentication

## Step 1: Generate a Jira API Token

1. Log in to your Atlassian account at https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Give it a descriptive label (e.g., "Ops Planner Integration")
4. Copy the generated token immediately (you won't be able to see it again)

## Step 2: Configure Environment Variables

### For Local Development

Create a `.dev.vars` file in the root of your project:

```bash
# .dev.vars
JIRA_DOMAIN=yourcompany.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_api_token_here
```

**Important:** Add `.dev.vars` to your `.gitignore` to prevent committing secrets!

### For Production (Cloudflare Workers)

Set the secrets using Wrangler CLI:

```bash
# Set production secrets
wrangler secret put JIRA_DOMAIN
# Enter: yourcompany.atlassian.net

wrangler secret put JIRA_EMAIL
# Enter: your.email@company.com

wrangler secret put JIRA_API_TOKEN
# Enter: your_api_token_here
```

Or for a specific environment:

```bash
wrangler secret put JIRA_DOMAIN --env production
wrangler secret put JIRA_EMAIL --env production
wrangler secret put JIRA_API_TOKEN --env production
```

## Step 3: Test the Integration

### Local Testing

1. Start the development server:
   ```bash
   npm run workers:dev
   ```

2. Open the application in your browser (typically http://localhost:8787)

3. Navigate to the "Quick Jira Ticket Creator" section

4. Enter a test ticket description and click "Create Ticket"

5. If configured correctly, you should see a success message with a link to the created ticket

### Troubleshooting

If you encounter errors:

1. **"Jira credentials not configured"**
   - Ensure your `.dev.vars` file exists and contains all three variables
   - Restart the development server after creating/modifying `.dev.vars`

2. **"Failed to create Jira ticket"**
   - Verify your Jira domain is correct (without `https://`)
   - Check that your API token is valid and hasn't expired
   - Ensure your Jira account has permission to create tickets in the DES project
   - Check the browser console for detailed error messages

3. **401 Unauthorized**
   - Your API token may be invalid or expired
   - Verify the email address matches your Jira account

4. **404 Not Found**
   - The Jira domain may be incorrect
   - The project key (DES) may not exist or you don't have access

## Step 4: Customize Project Settings

To change the default Jira project or issue type, edit the `JiraTicketCreator` component:

```typescript
// src/components/JiraTicketCreator.tsx
const jiraProject = "DES"; // Change to your project key

// In handleCreateTicket function:
issueType: 'Task' // Change to 'Story', 'Bug', etc.
```

## API Endpoint Details

The integration uses the following endpoint:

- **URL:** `/api/jira/create-ticket`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "project": "DES",
  "summary": "Ticket title/summary",
  "description": "Detailed description",
  "issueType": "Task"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "ticket": {
    "key": "DES-123",
    "id": "10001",
    "url": "https://yourcompany.atlassian.net/browse/DES-123",
    "self": "https://yourcompany.atlassian.net/rest/api/3/issue/10001"
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Error message",
  "details": { /* Additional error details */ }
}
```

## Security Best Practices

1. **Never commit secrets** - Always use `.dev.vars` for local development and Wrangler secrets for production
2. **Use API tokens, not passwords** - Jira API tokens can be revoked without changing your password
3. **Rotate tokens regularly** - Generate new API tokens periodically
4. **Limit permissions** - Use a Jira account with minimal necessary permissions
5. **Monitor usage** - Check Jira audit logs for unexpected API usage

## Deployment

When deploying to Cloudflare Workers:

1. Ensure secrets are set in production:
   ```bash
   wrangler secret list --env production
   ```

2. Deploy the application:
   ```bash
   npm run workers:deploy
   ```

3. Test the production deployment to verify the integration works

## Fallback Method

If the direct API integration fails or isn't configured, users can still use the RespectTables command method:

1. Enter the ticket description
2. Click "Copy Command"
3. Paste the command in your Slack workspace
4. The RespectTables bot will create the ticket

This provides a reliable fallback when API access is unavailable.

## Support

For issues with:
- **Jira API** - Check [Atlassian's REST API documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- **Cloudflare Workers** - Check [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- **This integration** - Review the error messages in the browser console and worker logs
