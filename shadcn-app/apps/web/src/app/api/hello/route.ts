import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello from API route",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "Data received",
      data: body,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
