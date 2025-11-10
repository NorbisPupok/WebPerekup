
// src/html/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Если это предварительный запрос (OPTIONS), сразу отвечаем разрешенными заголовками
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Ждем, пока следующий middleware или маршрут обработает запрос и вернет ответ
  const response = await next();

  // Проверяем, что ответ действительно был получен, и добавляем заголовки
  if (response) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Возвращаем (возможно, измененный) ответ
  return response;
});
