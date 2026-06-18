// Single data module — all Geoapify calls live here.
// To swap providers later, edit only this file.

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

function buildMapsUrl(name, lat, lng) {
  const query = encodeURIComponent(`${name}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${lat},${lng}`;
}

function buildGoogleSearchUrl(name, address) {
  const query = encodeURIComponent(`${name} ${address ?? ""}`);
  return `https://www.google.com/search?q=${query}`;
}

function normalizePlace(place) {
  const props = place.properties;
  const lat = place.geometry?.coordinates?.[1] ?? null;
  const lng = place.geometry?.coordinates?.[0] ?? null;
  const name = props.name ?? "Unnamed";
  const address = props.formatted ?? props.address_line2 ?? null;

  // Geoapify returns cuisine as a comma-separated string in datasource tags
  // e.g. "italian" or "pizza,italian"
  const cuisine = props.datasource?.raw?.cuisine ?? null;

  // Price level: Geoapify rarely surfaces this; set null and let UI handle it
  const priceLevel = props.datasource?.raw?.["price_range"] ?? null;

  // Rating: not available in free Geoapify Places tier
  const rating = null;

  // Photo: not available in free Geoapify Places tier
  const photoUrl = null;

  return {
    id: props.place_id ?? `${lat},${lng}`,
    name,
    lat,
    lng,
    distanceMeters: props.distance ?? null,
    category: props.categories?.[0] ?? null,
    cuisine,
    priceLevel,
    rating,
    photoUrl,
    address,
    mapsUrl: lat && lng ? buildMapsUrl(name, lat, lng) : null,
    googleSearchUrl: buildGoogleSearchUrl(name, address),
  };
}

/**
 * Search for restaurants near a location.
 * @param {object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {number} params.radiusMeters
 * @param {string[]} params.cuisines  - e.g. ["italian","pizza"], or [] for no filter
 * @returns {Promise<Array>} normalized restaurant objects
 */
export async function searchRestaurants({ lat, lng, radiusMeters, cuisines = [] }) {
  if (!GEOAPIFY_API_KEY) throw new Error("GEOAPIFY_API_KEY is not set");

  // Geoapify Places category for restaurants/food
  const categories = "catering.restaurant,catering.fast_food,catering.food_court";

  const params = new URLSearchParams({
    categories,
    filter: `circle:${lng},${lat},${radiusMeters}`,
    bias: `proximity:${lng},${lat}`,
    limit: "500",
    apiKey: GEOAPIFY_API_KEY,
  });

  const url = `https://api.geoapify.com/v2/places?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Geoapify Places API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const features = data.features ?? [];

  if (features.length === 0) return [];

  const normalized = features.map(normalizePlace);

  // Cuisine comes back as semicolon-separated values e.g. "pizza;italian;regional"
  // If cuisine filters were requested, restaurants matching ANY selected cuisine come first.
  // Untagged/non-matching restaurants are kept but ranked lower (soft filter).
  if (cuisines.length > 0) {
    const cuisinesLower = cuisines.map((c) => c.toLowerCase());
    const matches = (r) => {
      if (!r.cuisine) return false;
      const tags = r.cuisine.split(";").map((c) => c.trim().toLowerCase());
      return cuisinesLower.some((c) => tags.includes(c));
    };
    return [...normalized.filter(matches), ...normalized.filter((r) => !matches(r))];
  }

  return normalized;
}

/**
 * Geocode a free-text location string to {lat, lng}.
 * @param {string} locationText - e.g. "Lawrence, Kansas"
 * @returns {Promise<{lat: number, lng: number, displayName: string}>}
 */
export async function geocodeLocation(locationText) {
  if (!GEOAPIFY_API_KEY) throw new Error("GEOAPIFY_API_KEY is not set");

  const params = new URLSearchParams({
    text: locationText,
    format: "json",
    limit: "1",
    apiKey: GEOAPIFY_API_KEY,
  });

  const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Geoapify Geocoding API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const result = data.results?.[0];

  if (!result) throw new Error(`No location found for: ${locationText}`);

  return {
    lat: result.lat,
    lng: result.lon,
    displayName: result.formatted,
  };
}
