export interface GeoResult {
  lat: number;
  lng: number;
}

export function isGeolocationSupported() {
  return typeof navigator !== 'undefined'
    && !!navigator.geolocation
    && window.isSecureContext;
}

export function getCurrentPosition(): Promise<GeoResult> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(Object.assign(new Error('Geolocation not available'), { code: 0 }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}
