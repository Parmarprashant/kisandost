import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([], { status: 200 });
}

export async function POST(req: Request) {
  return NextResponse.json({ message: "Success" }, { status: 200 });
}
