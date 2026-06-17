import { NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/places";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json({ error: "text parameter is required" }, { status: 400 });
  }

  try {
    const result = await geocodeLocation(text);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
