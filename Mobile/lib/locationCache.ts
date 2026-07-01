/**
 * Module-level location cache so the GPS + reverse-geocode call only runs
 * once per app session regardless of how many screens request it.
 */
import * as Location from "expo-location";

type LocationResult =
  | { status: "denied" }
  | { status: "error" }
  | { status: "ready"; label: string };

let cache: LocationResult | null = null;
let inflight: Promise<LocationResult> | null = null;

export async function getCachedLocation(): Promise<LocationResult> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async (): Promise<LocationResult> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      const result: LocationResult = { status: "denied" };
      cache = result;
      inflight = null;
      return result;
    }
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const label = [place?.district ?? place?.city ?? place?.subregion, place?.region]
        .filter(Boolean)
        .join(", ");
      const result: LocationResult = { status: "ready", label: label || "Location unavailable" };
      cache = result;
      inflight = null;
      return result;
    } catch {
      const result: LocationResult = { status: "error" };
      cache = result;
      inflight = null;
      return result;
    }
  })();

  return inflight;
}

export function clearLocationCache() {
  cache = null;
  inflight = null;
}
