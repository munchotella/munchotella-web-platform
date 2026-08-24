import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse("WhatsApp webhook is disabled", { status: 404 });
}

export async function POST() {
  return NextResponse.json({ status: "whatsapp_disabled", message: "Canalul WhatsApp este dezactivat." }, { status: 200 });
}
