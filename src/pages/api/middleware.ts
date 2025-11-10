
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const response = next();
  Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
});
