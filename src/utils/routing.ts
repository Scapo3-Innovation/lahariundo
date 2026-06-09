export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteLineString {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface RouteResult {
  distanceM: number;
  durationS: number;
  geometry: RouteLineString;
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export async function fetchDrivingRoute(
  from: RoutePoint,
  to: RoutePoint,
): Promise<RouteResult | null> {
  const url =
    `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}` +
    '?overview=full&geometries=geojson&steps=false';

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as {
      code?: string;
      routes?: Array<{ distance: number; duration: number; geometry: RouteLineString }>;
    };
    const route = data.routes?.[0];
    if (!route?.geometry) return null;
    return {
      distanceM: route.distance,
      durationS: route.duration,
      geometry: route.geometry,
    };
  } catch {
    return null;
  }
}

export function formatRouteDistance(km: number, isML: boolean) {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return isML ? `${m} മീ` : `${m} m`;
  }
  return isML ? `${km.toFixed(1)} കി.മീ` : `${km.toFixed(1)} km`;
}

export function formatRouteDuration(minutes: number, isML: boolean) {
  if (minutes < 1) return isML ? '< 1 മിനിറ്റ്' : '< 1 min';
  if (minutes < 60) {
    return isML ? `~${Math.round(minutes)} മിനിറ്റ്` : `~${Math.round(minutes)} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return isML ? `~${h} മണി ${m} മിനിറ്റ്` : `~${h} hr ${m} min`;
}

export function googleMapsDirectionsUrl(
  to: RoutePoint,
  from?: RoutePoint | null,
) {
  const dest = `${to.lat},${to.lng}`;
  if (from) {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${dest}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

export function googleMapsPlaceUrl(to: RoutePoint) {
  return `https://www.google.com/maps/search/?api=1&query=${to.lat},${to.lng}`;
}
