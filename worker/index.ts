/**
 * Cloudflare Workers entry point for serving the React application
 */

/// <reference types="../worker-configuration.d.ts" />

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
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  
  // Example API endpoint
  if (url.pathname === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Add your API routes here
  // Example:
  // if (url.pathname === '/api/data' && request.method === 'GET') {
  //   return handleGetData(request, env);
  // }
  
  return new Response('API endpoint not found', { status: 404 });
}
