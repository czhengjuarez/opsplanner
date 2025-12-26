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
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  
  // Example API endpoint
  if (url.pathname === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // AI communication template generation
  if (url.pathname === '/api/generate-comm-template' && request.method === 'POST') {
    return handleGenerateCommTemplate(request, env);
  }
  
  return new Response('API endpoint not found', { status: 404 });
}

/**
 * Generate communication template using Workers AI
 */
async function handleGenerateCommTemplate(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = await request.json() as { taskText: string; context?: string };
    const { taskText, context } = body;
    
    if (!taskText) {
      return new Response(JSON.stringify({ error: 'Task text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are a helpful assistant for a DesignOps professional. Generate a professional communication template for the following task: "${taskText}"

${context ? `Additional context: ${context}` : ''}

Create a clear, concise email template with rich formatting using markdown:
1. A subject line (marked with "**Subject:**")
2. A brief greeting
3. The main message with **[BLANK]** placeholders for the user to fill in specific details
4. Use markdown formatting: **bold** for emphasis, bullet points for lists, etc.
5. A professional closing

Keep it professional but friendly. Make it easy to customize by using **[BLANK]** placeholders where specific information needs to be added. Use markdown formatting to make the template visually appealing.

Template:`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates professional communication templates for DesignOps professionals.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ 
      template: response.response || 'Unable to generate template. Please try again.',
      success: true 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate template',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
