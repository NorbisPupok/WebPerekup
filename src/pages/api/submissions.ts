
// src/pages/api/submissions.ts
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

interface Submission {
  id: string;
  server: string;
  car: string;
  price: number;
  photoUrl: string;
  timestamp: number;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'submissions.json');
const SUBMISSIONS_IMAGE_DIR = path.join(process.cwd(), 'public', 'submissions');

async function ensureFileAndDir() {
  await fs.mkdir(SUBMISSIONS_IMAGE_DIR, { recursive: true });
  try { await fs.access(DATA_FILE_PATH); } catch {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2));
  }
}

// POST: Получаем данные от бота
export const POST: APIRoute = async ({ request }) => {
  // --- ПРОВЕРКА API-КЛЮЧА ---
  const expectedKey = import.meta.env.WEB_API_KEY;
  const authHeader = request.headers.get('authorization');

  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return Response.json({ message: 'Unauthorized' }, { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // --- КОНЕЦ ПРОВЕРКИ ---

  try {
    await ensureFileAndDir();
    const body = await request.json();
    const { server, car, price, photo_file_id } = body;

    if (!server || !car || !price || !photo_file_id) {
      return Response.json({ message: 'Missing fields' }, { status: 400 });
    }

    // 1. Забираем картинку из API бота
    const botApiUrl = `http://localhost:8000/api/photo/${photo_file_id}`;
    const imageResponse = await fetch(botApiUrl);
    if (!imageResponse.ok) return Response.json({ message: 'Failed to fetch image' }, { status: 500 });
    
    // 2. Сохраняем картинку в папку public
    const timestamp = Date.now();
    const imageFileName = `submission_${timestamp}.jpg`;
    const imageFilePath = path.join(SUBMISSIONS_IMAGE_DIR, imageFileName);
    await fs.writeFile(imageFilePath, new Uint8Array(await imageResponse.arrayBuffer()));
    
    // 3. Создаем объект заявки
    const newSubmission: Submission = {
      id: String(timestamp), server, car, price,
      photoUrl: `/submissions/${imageFileName}`, timestamp
    };
    
    // 4. Сохраняем заявку в JSON-файл
    const submissionsData = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const submissions: Submission[] = JSON.parse(submissionsData);
    submissions.unshift(newSubmission); // Добавляем в начало
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(submissions, null, 2));

    return Response.json({ message: 'OK' }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/submissions:', error);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};

// GET: Отдаем заявки на фронтенд
export const GET: APIRoute = async () => {
  try {
    await ensureFileAndDir();
    const submissionsData = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return new Response(submissionsData, {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return Response.json({ message: 'Error' }, { status: 500 });
  }
};