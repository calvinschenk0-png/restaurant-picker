export interface Restaurant {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  distanceMeters: number | null;
  category: string | null;
  cuisine: string | null;
  priceLevel: string | null;
  rating: number | null;
  photoUrl: string | null;
  address: string | null;
  mapsUrl: string | null;
  googleSearchUrl: string | null;
}

export function rankRestaurants(
  restaurants: Restaurant[],
  cuisineValues: string[]
): Restaurant[] {
  const cuisinesLower = cuisineValues.map((c) => c.toLowerCase());

  const score = (r: Restaurant): number => {
    let s = 0;

    // Proximity: closer = higher score (max 100 pts at 0m, 0 pts at 16km)
    if (r.distanceMeters !== null) {
      s += Math.max(0, 100 - (r.distanceMeters / 16000) * 100);
    }

    // Cuisine match boost (soft filter already sorted matching first, this reinforces it)
    if (cuisinesLower.length > 0 && r.cuisine) {
      const tags = r.cuisine.split(";").map((c) => c.trim().toLowerCase());
      if (cuisinesLower.some((c) => tags.includes(c))) {
        s += 50;
      }
    }

    return s;
  };

  return [...restaurants].sort((a, b) => score(b) - score(a));
}
