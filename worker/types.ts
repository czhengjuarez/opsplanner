/**
 * Extended environment types for Cloudflare Workers
 */

/// <reference types="../worker-configuration.d.ts" />

declare global {
  interface Env {
    // Cloudflare Assets binding (auto-generated)
    ASSETS: Fetcher;
    
    // Jira Integration
    JIRA_DOMAIN?: string;
    
    // Cloudflare Access Authentication (for Jira behind CF Access)
    CF_ACCESS_CLIENT_ID?: string;
    CF_ACCESS_CLIENT_SECRET?: string;
    
    // Legacy Jira Auth (if using standard Jira authentication)
    JIRA_EMAIL?: string;
    JIRA_API_TOKEN?: string;
  }
}

export {};
