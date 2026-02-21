import { NextResponse } from 'next/server';

export async function GET() {
    // Cloud Run injects the variable here at Runtime
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'API Key not found on server' }, { status: 500 });
    }

    return NextResponse.json({ apiKey });
}
