/**
 * Cloudflare Workers entry point for serving the React application
 */

import './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API routes (if you have any)
    if (url.pathname.startsWith('/api/')) {
      return handleApiRoutes(request, env, ctx);
    }
    
    // Try to serve static assets first
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      
      // If asset found, return it
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    } catch (error) {
      console.error('Error fetching asset:', error);
    }
    
    // For SPA routing, serve index.html for all non-asset requests
    if (!url.pathname.includes('.')) {
      try {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        
        if (indexResponse.status === 200) {
          return new Response(indexResponse.body, {
            ...indexResponse,
            headers: {
              ...indexResponse.headers,
              'Content-Type': 'text/html',
            },
          });
        }
      } catch (error) {
        console.error('Error serving index.html:', error);
      }
    }
    
    // Fallback 404
    return new Response('Not Found', { status: 404 });
  },
};

/**
 * Handle API routes (customize based on your needs)
 */
async function handleApiRoutes(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  
  // Health check endpoint
  if (url.pathname === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Jira ticket creation endpoint
  if (url.pathname === '/api/jira/create-ticket' && request.method === 'POST') {
    return handleCreateJiraTicket(request, env);
  }
  
  // Test CF Access authentication
  if (url.pathname === '/api/jira/test-auth' && request.method === 'GET') {
    return handleTestJiraAuth(request, env);
  }
  
  return new Response('API endpoint not found', { status: 404 });
}

/**
 * Test CF Access and Jira authentication
 */
async function handleTestJiraAuth(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Check if credentials are configured
    if (!env.JIRA_DOMAIN || !env.CF_ACCESS_CLIENT_ID || !env.CF_ACCESS_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing CF Access credentials',
          configured: {
            domain: !!env.JIRA_DOMAIN,
            clientId: !!env.CF_ACCESS_CLIENT_ID,
            clientSecret: !!env.CF_ACCESS_CLIENT_SECRET,
            email: !!env.JIRA_EMAIL,
            apiToken: !!env.JIRA_API_TOKEN
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Test 1: Try to access Jira API root with just CF Access headers
    const testUrl = `https://${env.JIRA_DOMAIN}/rest/api/3/myself`;
    console.log('Testing CF Access to:', testUrl);
    
    const auth = env.JIRA_EMAIL && env.JIRA_API_TOKEN 
      ? btoa(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`)
      : null;
    
    // Test with CF Access headers
    const headersWithCF: Record<string, string> = {
      'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
      'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET,
      'Accept': 'application/json'
    };
    
    if (auth) {
      headersWithCF['Authorization'] = `Basic ${auth}`;
    }
    
    // Also test without CF Access headers (just Jira auth)
    const headersWithoutCF: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (auth) {
      headersWithoutCF['Authorization'] = `Basic ${auth}`;
    }
    
    const headers = headersWithCF;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');
    
    let responseBody: string;
    if (isHtml) {
      responseBody = await response.text();
    } else {
      responseBody = await response.text();
    }

    return new Response(
      JSON.stringify({
        success: !isHtml && response.ok,
        status: response.status,
        contentType,
        isHtml,
        responsePreview: responseBody.substring(0, 500),
        headers: {
          cfRay: response.headers.get('cf-ray'),
          cfCacheStatus: response.headers.get('cf-cache-status')
        },
        message: isHtml 
          ? 'CF Access authentication failed - receiving HTML login page'
          : response.ok 
            ? 'Successfully authenticated!'
            : 'Authentication failed with JSON error'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Create a Jira ticket using the Jira REST API
 */
async function handleCreateJiraTicket(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Check if Jira credentials are configured
    if (!env.JIRA_DOMAIN || !env.CF_ACCESS_CLIENT_ID || !env.CF_ACCESS_CLIENT_SECRET || !env.JIRA_API_TOKEN || !env.JIRA_EMAIL) {
      return new Response(
        JSON.stringify({ 
          error: 'Jira credentials not configured. Please set JIRA_DOMAIN, CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await request.json() as {
      project: string;
      summary: string;
      description?: string;
      issueType?: string;
    };

    if (!body.project || !body.summary) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: project and summary' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Jira API request
    const jiraUrl = `https://${env.JIRA_DOMAIN}/rest/api/3/issue`;
    
    // Create Basic Auth header for Jira API
    const auth = btoa(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`);

    const jiraPayload = {
      fields: {
        project: {
          key: body.project
        },
        summary: body.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: body.description || body.summary
                }
              ]
            }
          ]
        },
        issuetype: {
          name: body.issueType || 'Task'
        }
      }
    };

    // Log request details for debugging
    console.log('Making request to:', jiraUrl);
    console.log('CF-Access-Client-Id:', env.CF_ACCESS_CLIENT_ID?.substring(0, 20) + '...');
    
    // Make request to Jira API with both CF Access and Jira authentication
    const jiraResponse = await fetch(jiraUrl, {
      method: 'POST',
      headers: {
        // Cloudflare Access authentication
        'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
        'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET,
        // Jira API authentication
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(jiraPayload)
    });
    
    console.log('Response status:', jiraResponse.status);
    console.log('Response content-type:', jiraResponse.headers.get('content-type'));

    // Check content type to handle HTML responses (even with 200 status)
    const contentType = jiraResponse.headers.get('content-type') || '';
    
    // If we got HTML instead of JSON, it's likely a CF Access or auth error
    if (contentType.includes('text/html')) {
      const htmlText = await jiraResponse.text();
      console.error('Jira returned HTML page (status ' + jiraResponse.status + '):', htmlText.substring(0, 500));
      
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed or Jira is unreachable',
          details: `Received HTML response (status ${jiraResponse.status}). This usually means Cloudflare Access authentication failed or the Jira URL is incorrect.`,
          hint: 'Verify your CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET credentials, and ensure the JIRA_DOMAIN is correct.'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Now we know we have JSON, check if request was successful
    if (!jiraResponse.ok) {
      // Parse JSON error
      const responseData = await jiraResponse.json() as {
        key?: string;
        id?: string;
        self?: string;
        errors?: Record<string, string>;
        errorMessages?: string[];
      };
      
      console.error('Jira API error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create Jira ticket', 
          details: responseData 
        }),
        { 
          status: jiraResponse.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse successful JSON response
    const responseData = await jiraResponse.json() as {
      key?: string;
      id?: string;
      self?: string;
      errors?: Record<string, string>;
      errorMessages?: string[];
    };

    // Return success response with ticket details
    return new Response(
      JSON.stringify({
        success: true,
        ticket: {
          key: responseData.key,
          id: responseData.id,
          url: `https://${env.JIRA_DOMAIN}/browse/${responseData.key}`,
          self: responseData.self
        }
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating Jira ticket:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
