import { NextResponse } from "next/server";
import { searchRestaurants } from "@/lib/places";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));
  const radiusMeters = parseInt(searchParams.get("radiusMeters") ?? "8047", 10);
  const cuisineParam = searchParams.get("cuisines") ?? "";
  const cuisines = cuisineParam ? cuisineParam.split(",").filter(Boolean) : [];

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  try {
    const restaurants = await searchRestaurants({ lat, lng, radiusMeters, cuisines });
    return NextResponse.json({ restaurants });
  } catch (err) {
    console.error("restaurants API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
