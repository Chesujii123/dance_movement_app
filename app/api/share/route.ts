import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { Project } from '@/types';

// Vercel KV が設定されていない場合はインメモリストアで代用（ローカル開発用）
const inMemoryStore = new Map<string, Project>();

async function getKV() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    return kv;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const project = (await req.json()) as Project;
    const id = nanoid(10);

    const kv = await getKV();
    if (kv) {
      await kv.set(`share:${id}`, project, { ex: 60 * 60 * 24 * 30 }); // 30日
    } else {
      inMemoryStore.set(id, project);
    }

    return NextResponse.json({ id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const kv = await getKV();
    let project: Project | null = null;

    if (kv) {
      project = await kv.get<Project>(`share:${id}`);
    } else {
      project = inMemoryStore.get(id) ?? null;
    }

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
