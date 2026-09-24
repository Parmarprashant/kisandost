import { NextResponse } from 'next/server';

export async function DELETE() {
  return NextResponse.json({ message: "Success" }, { status: 200 });
}
