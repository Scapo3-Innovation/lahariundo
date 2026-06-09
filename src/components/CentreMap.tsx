import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Loader2, Route, X } from 'lucide-react';
import type { Centre } from '../types';
import { resolveDialNumber } from '../utils/phone';
import {
  fetchDrivingRoute,
  formatRouteDistance,
  formatRouteDuration,
  googleMapsDirectionsUrl,
  type RouteLineString,
} from '../utils/routing';

export interface CentreMapHandle {
 triggerGeolocate(): void;
}

 interface Props {
  centres: Centre[];
  userLat?: number | null;
  userLng?: number | null;
  selectedId?: string | null;
  directionsToId?: string | null;
  visible?: boolean;
  onSelectCentre?: (id: string) => void;
  onDirectionsRequest?: (id: string) => void;
  onDirectionsClear?: () => void;
 onGeolocate?: (lat: number, lng: number) => void;
 onGeolocateError?: (code: number) => void;
 onMapReady?: (handle: CentreMapHandle) => void;
 language?: string;
}

const OFM_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const KERALA_CENTER: [number, number] = [76.2711, 10.8505];
const KERALA_BOUNDS: maplibregl.LngLatBoundsLike = [[73.0, 7.5], [78.5, 13.5]];

interface ActiveRoute {
  centreId: string;
  distanceM: number;
  durationS: number;
}

function scheduleMapResize(map: maplibregl.Map) {
  const resize = () => map.resize();
  resize();
  requestAnimationFrame(resize);
  window.setTimeout(resize, 100);
  window.setTimeout(resize, 350);
}

function clearRouteLine(map: maplibregl.Map | null) {
  if (!map) return;
  const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
  src?.setData({ type: 'FeatureCollection', features: [] });
}

function drawRouteLine(map: maplibregl.Map, geometry: RouteLineString) {
  const src = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry }],
  });
}

function fitRouteOnMap(
  map: maplibregl.Map,
  geometry: RouteLineString,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const bounds = new maplibregl.LngLatBounds();
  bounds.extend([from.lng, from.lat]);
  bounds.extend([to.lng, to.lat]);
  for (const [lng, lat] of geometry.coordinates) {
    bounds.extend([lng, lat]);
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  map.fitBounds(bounds, {
    padding: { top: 90, bottom: 110, left: 50, right: 50 },
    maxZoom: 14,
    duration: reduced ? 0 : 900,
  });
}

function buildPopupHTML(c: Centre, lang: string): string {
 const name = lang === 'ml' ? c.name_ml : c.name_en;
 const address = lang === 'ml' ? c.address_ml : c.address_en;
 const dialNumber = resolveDialNumber(c.phone);

 const callHtml = `<a href="tel:${dialNumber}" style="display:inline-flex;align-items:center;gap:4px;background:#0f766e;color:#fff;padding:5px 10px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12px;">📞 ${dialNumber}</a>`;
 const dirLabel = lang === 'ml' ? 'ദിശ' : 'Directions';

 const serviceLabelEn: Record<string, string> = { detox: 'Detox', counselling: 'Counselling', op: 'Outpatient', inpatient: 'Inpatient' };
 const serviceLabelMl: Record<string, string> = { detox: 'ഡിടോക്സ്', counselling: 'കൗൺസലിംഗ്', op: 'ഔട്ട്‌പേഷ്യന്റ്', inpatient: 'ഇൻപേഷ്യന്റ്' };
 const costLabelEn: Record<string, string> = { free: 'Free', subsidised: 'Subsidised', paid: 'Paid' };
 const costLabelMl: Record<string, string> = { free: 'സൗജന്യം', subsidised: 'സബ്‌സിഡൈസ്ഡ്', paid: 'പണം' };

 const svcLabels = lang === 'ml' ? serviceLabelMl : serviceLabelEn;
 const costLabels = lang === 'ml' ? costLabelMl : costLabelEn;

 const tags = c.type.map(s =>
  `<span style="font-size:10px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;padding:1px 6px;border-radius:20px;font-weight:600;">${svcLabels[s] ?? s}</span>`,
 ).join('');
 const costTag = `<span style="font-size:10px;background:#f0fdf4;color:#0f766e;border:1px solid #99f6e4;padding:1px 6px;border-radius:20px;font-weight:600;">${costLabels[c.cost] ?? c.cost}</span>`;

 return `<div style="font-family:'Inter',system-ui,sans-serif;font-size:13px;min-width:200px;max-width:280px;">
 <div style="font-weight:700;font-size:14px;color:#1e293b;line-height:1.3;margin-bottom:4px;">${name}</div>
 <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${address}</div>
 <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${tags}${costTag}</div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
  ${callHtml}
  <button type="button" data-directions data-centre-id="${c.id}"
    style="display:inline-flex;align-items:center;gap:4px;background:#f1f5f9;color:#475569;padding:5px 10px;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:12px;font-family:inherit;">${dirLabel}</button>
 </div>
</div>`;
}

function fitAllCentres(map: maplibregl.Map, centreList: Centre[], instant = false) {
  if (!centreList.length) return;
  const bounds = new maplibregl.LngLatBounds();
  centreList.forEach((c) => bounds.extend([c.lng, c.lat]));
  map.fitBounds(bounds, {
    padding: { top: 70, bottom: 50, left: 50, right: 50 },
    maxZoom: 9,
    duration: instant ? 0 : 800,
  });
}

function buildGeoJSON(centres: Centre[]) {
 return {
  type: 'FeatureCollection' as const,
  features: centres.map(c => ({
   type: 'Feature' as const,
   properties: {
    id: c.id,
    name_en: c.name_en,
    name_ml: c.name_ml,
    address_en: c.address_en,
    address_ml: c.address_ml,
    phone: c.phone,
    cost: c.cost,
    lat: c.lat,
    lng: c.lng,
    hasFullService: c.type.includes('detox') || c.type.includes('inpatient'),
   },
   geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] as [number, number] },
  })),
 };
}

export function CentreMap({
  centres,
  userLat,
  userLng,
  selectedId,
  directionsToId,
  visible = true,
  onSelectCentre,
  onDirectionsRequest,
  onDirectionsClear,
  onGeolocate,
  onGeolocateError,
  onMapReady,
  language = 'en',
}: Props) {
  const { t } = useTranslation();
  const isML = language === 'ml';

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geolocateRef = useRef<maplibregl.GeolocateControl | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const prevSelRef = useRef<string | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);

 // Stable callback refs — prevent stale closures inside map event handlers
 const languageRef     = useRef(language);
 const centresRef     = useRef(centres);
 const onSelectCentreRef  = useRef(onSelectCentre);
 const onDirectionsRequestRef = useRef(onDirectionsRequest);
 const onGeolocateRef   = useRef(onGeolocate);
 const onGeolocateErrorRef = useRef(onGeolocateError);
 const onMapReadyRef    = useRef(onMapReady);
 const selectedIdRef    = useRef(selectedId);
 const userLatRef = useRef(userLat);
 const userLngRef = useRef(userLng);

 useEffect(() => { languageRef.current = language; }, [language]);
 useEffect(() => { centresRef.current = centres; }, [centres]);
 useEffect(() => { onSelectCentreRef.current = onSelectCentre; }, [onSelectCentre]);
 useEffect(() => { onDirectionsRequestRef.current = onDirectionsRequest; }, [onDirectionsRequest]);
 useEffect(() => { onGeolocateRef.current = onGeolocate; }, [onGeolocate]);
 useEffect(() => { onGeolocateErrorRef.current = onGeolocateError; }, [onGeolocateError]);
 useEffect(() => { onMapReadyRef.current = onMapReady; }, [onMapReady]);
 useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
 useEffect(() => { userLatRef.current = userLat; }, [userLat]);
 useEffect(() => { userLngRef.current = userLng; }, [userLng]);

  const handleClearRoute = useCallback(() => {
    clearRouteLine(mapRef.current);
    setActiveRoute(null);
    onDirectionsClear?.();
  }, [onDirectionsClear]);

  // Popup "Directions" button (HTML inside MapLibre popup)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-directions]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.getAttribute('data-centre-id');
      if (id) onDirectionsRequestRef.current?.(id);
    };

    wrapper.addEventListener('click', onClick);
    return () => wrapper.removeEventListener('click', onClick);
  }, []);

  // ── Initialize map (once) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OFM_STYLE,
      center: KERALA_CENTER,
      zoom: 7,
      maxBounds: KERALA_BOUNDS,
      minZoom: 5,
      maxZoom: 17,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      trackUserLocation: false,
      showAccuracyCircle: true,
      showUserLocation: true,
    });
    geolocateRef.current = geolocate;
    map.addControl(geolocate, 'top-right');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geolocate.on('geolocate', (e: any) => {
      onGeolocateRef.current?.(e.coords.latitude, e.coords.longitude);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geolocate.on('error', (e: any) => {
      onGeolocateErrorRef.current?.(e.code);
    });

    const setupLayers = () => {
      scheduleMapResize(map);

      if (map.getSource('centres')) return;

      const geojson = buildGeoJSON(centresRef.current);

      map.addSource('centres', {
        type: 'geojson',
        data: geojson,
        promoteId: 'id',
      });

      map.addSource('user-loc', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#2563eb',
          'line-width': 5,
          'line-opacity': 0.85,
        },
      });

      map.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 8,
          'line-opacity': 0.9,
        },
      }, 'route-line');

      map.addLayer({
        id: 'centre-points',
        type: 'circle',
        source: 'centres',
        paint: {
          'circle-color': [
            'case',
            ['boolean', ['get', 'hasFullService'], false],
            '#0f766e',
            '#7c3aed',
          ],
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            14,
            9,
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            4,
            2.5,
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#fbbf24',
            '#ffffff',
          ],
        },
      });

      map.addLayer({
        id: 'centre-labels',
        type: 'symbol',
        source: 'centres',
        minzoom: 10,
        layout: {
          'text-field': ['get', languageRef.current === 'ml' ? 'name_ml' : 'name_en'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-max-width': 12,
          'text-optional': true,
        },
        paint: {
          'text-color': '#334155',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      });

      map.addLayer({
        id: 'user-dot',
        type: 'circle',
        source: 'user-loc',
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      if (centresRef.current.length) {
        fitAllCentres(map, centresRef.current, reduced);
      }

      map.on('click', 'centre-points', (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as Record<string, unknown>;
        const id = String(props.id ?? '');
        const coords = (e.features[0].geometry as { coordinates: [number, number] }).coordinates;
        const centre = centresRef.current.find((c) => c.id === id);
        if (!centre) return;

        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', offset: 12 })
          .setLngLat(coords)
          .setHTML(buildPopupHTML(centre, languageRef.current))
          .addTo(map);

        onSelectCentreRef.current?.(id);
      });

      (['centre-points'] as const).forEach((layer) => {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      });

      setMapReady(true);
      onMapReadyRef.current?.({ triggerGeolocate: () => geolocateRef.current?.trigger() });

      const initialId = selectedIdRef.current;
      if (initialId) {
        const c = centresRef.current.find((x) => x.id === initialId);
        if (c) {
          if (reduced) {
            map.jumpTo({ center: [c.lng, c.lat], zoom: 13 });
          } else {
            map.flyTo({ center: [c.lng, c.lat], zoom: 13, speed: 1.2 });
          }
          window.setTimeout(() => {
            try { map.setFeatureState({ source: 'centres', id: initialId }, { selected: true }); }
            catch { /* ignore */ }
            prevSelRef.current = initialId;
          }, 300);
        }
      }
    };

    map.once('load', setupLayers);
    map.once('style.load', () => scheduleMapResize(map));

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      geolocateRef.current = null;
      setMapReady(false);
    };
  }, []);

  // ── Fetch and draw driving route ─────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !directionsToId) {
      clearRouteLine(mapRef.current);
      setActiveRoute(null);
      setRouteLoading(false);
      return;
    }

    const lat = userLatRef.current;
    const lng = userLngRef.current;
    if (lat == null || lng == null) return;

    const centre = centres.find((c) => c.id === directionsToId);
    if (!centre) return;

    let cancelled = false;
    setRouteLoading(true);
    setActiveRoute(null);
    clearRouteLine(mapRef.current);

    const from = { lat, lng };
    const to = { lat: centre.lat, lng: centre.lng };

    fetchDrivingRoute(from, to).then((route) => {
      if (cancelled || !mapRef.current) return;

      if (!route) {
        window.open(
          googleMapsDirectionsUrl(to, from),
          '_blank',
          'noopener,noreferrer',
        );
        onDirectionsClear?.();
        setRouteLoading(false);
        return;
      }

      drawRouteLine(mapRef.current, route.geometry);
      fitRouteOnMap(mapRef.current, route.geometry, from, to);
      setActiveRoute({
        centreId: directionsToId,
        distanceM: route.distanceM,
        durationS: route.durationS,
      });
      setRouteLoading(false);
    });

    return () => { cancelled = true; };
  }, [directionsToId, userLat, userLng, mapReady, centres, onDirectionsClear]);

  // ── Resize when container size changes or tab becomes visible ─────────────
  useEffect(() => {
    if (!mapRef.current || !containerRef.current) return;

    const map = mapRef.current;
    const resize = () => scheduleMapResize(map);

    if (visible) resize();

    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);
    window.addEventListener('resize', resize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [visible, mapReady]);

 // ── Update GeoJSON when centres prop changes ───────────────────────────────
 useEffect(() => {
  if (!mapReady || !mapRef.current) return;
  const map = mapRef.current;
  const src = map.getSource('centres') as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData(buildGeoJSON(centres));
  if (centres.length && userLat == null && !selectedId && !directionsToId) {
   fitAllCentres(map, centres);
  }
 }, [centres, mapReady, userLat, userLng, selectedId, directionsToId]);

 // ── Refresh map when tab becomes visible (was display:none) ───────────────
 useEffect(() => {
  if (!visible || !mapReady || !mapRef.current) return;
  const map = mapRef.current;
  scheduleMapResize(map);
  const src = map.getSource('centres') as maplibregl.GeoJSONSource | undefined;
  if (src && centres.length) {
   src.setData(buildGeoJSON(centres));
  }
 }, [visible, mapReady, centres]);

 // ── User location dot + pan map to user ───────────────────────────────────
 useEffect(() => {
  if (!mapReady || !mapRef.current) return;
  const map = mapRef.current;
  const src = map.getSource('user-loc') as maplibregl.GeoJSONSource | undefined;
  if (!src) return;

  if (userLat != null && userLng != null) {
   src.setData({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [userLng, userLat] },
      properties: {},
    }],
   });

   if (!directionsToId) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
     map.jumpTo({ center: [userLng, userLat], zoom: Math.max(map.getZoom(), 11) });
    } else {
     map.easeTo({
      center: [userLng, userLat],
      zoom: Math.max(map.getZoom(), 11),
      duration: 800,
     });
    }
   }
  } else {
   src.setData({ type: 'FeatureCollection', features: [] });
  }
 }, [userLat, userLng, mapReady, directionsToId]);

 // ── Fly to / highlight selected centre ────────────────────────────────────
 useEffect(() => {
  const map = mapRef.current;
  if (!map || !mapReady) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prevSelRef.current) {
   try { map.setFeatureState({ source: 'centres', id: prevSelRef.current }, { selected: false }); }
   catch { /* may be in cluster */ }
  }

  if (selectedId) {
   prevSelRef.current = selectedId;
   try { map.setFeatureState({ source: 'centres', id: selectedId }, { selected: true }); }
   catch { /* ignore */ }

   const centre = centres.find(c => c.id === selectedId);
   if (centre && !directionsToId) {
    if (reduced) {
     map.jumpTo({ center: [centre.lng, centre.lat], zoom: 13 });
    } else {
     map.flyTo({ center: [centre.lng, centre.lat], zoom: 13, speed: 1.2 });
    }
    setTimeout(() => {
     if (!mapRef.current) return;
     popupRef.current?.remove();
     popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', offset: 12 })
      .setLngLat([centre.lng, centre.lat])
      .setHTML(buildPopupHTML(centre, languageRef.current))
      .addTo(mapRef.current);
    }, reduced ? 0 : 600);
   }
  } else {
   prevSelRef.current = null;
   popupRef.current?.remove();
  }
 }, [selectedId, centres, mapReady, directionsToId]);

 // ── Rebuild open popup when language switches ──────────────────────────────
 useEffect(() => {
  if (!mapReady || !mapRef.current) return;
  const map = mapRef.current;
  if (map.getLayer('centre-labels')) {
   map.setLayoutProperty(
    'centre-labels',
    'text-field',
    ['get', language === 'ml' ? 'name_ml' : 'name_en'],
   );
  }
  if (!popupRef.current || !selectedId) return;
  const centre = centres.find(c => c.id === selectedId);
  if (centre) popupRef.current.setHTML(buildPopupHTML(centre, language));
 }, [language, selectedId, centres, mapReady]);

 const routeCentre = activeRoute
  ? centres.find((c) => c.id === activeRoute.centreId)
  : null;
 const googleUrl = routeCentre && userLat != null && userLng != null
  ? googleMapsDirectionsUrl(
    { lat: routeCentre.lat, lng: routeCentre.lng },
    { lat: userLat, lng: userLng },
  )
  : null;

 return (
  <div ref={wrapperRef} className={`relative w-full ${visible ? '' : 'hidden'}`}>
   <div className="absolute top-2 left-2 z-10 bg-surface/90 backdrop-blur-sm rounded-lg border border-border px-2.5 py-2 flex flex-col gap-1.5 text-[11px] pointer-events-none select-none">
    <p className="text-primary font-semibold">
     {centres.length} {language === 'ml' ? 'സെന്ററുകൾ' : 'centres on map'}
    </p>
    <div className="flex items-center gap-1.5">
     <div className="w-3 h-3 rounded-full bg-teal-700 shrink-0" />
     <span className="text-secondary font-medium">Full service</span>
    </div>
    <div className="flex items-center gap-1.5">
     <div className="w-3 h-3 rounded-full bg-violet-700 shrink-0" />
     <span className="text-secondary font-medium">Counselling / OP</span>
    </div>
    {activeRoute && (
     <div className="flex items-center gap-1.5 pt-1 border-t border-border">
      <div className="w-3 h-0.5 bg-blue-600 shrink-0 rounded" style={{ width: 12 }} />
      <span className="text-secondary font-medium">{t('getHelp.routeByRoad')}</span>
     </div>
    )}
   </div>

   {(routeLoading || activeRoute) && (
    <div className="absolute bottom-3 left-3 right-3 z-10 bg-surface/95 backdrop-blur-sm rounded-lg border border-border px-3 py-2.5 flex flex-wrap items-center gap-2 shadow-sm">
     {routeLoading ? (
      <span className={`text-xs text-secondary flex items-center gap-1.5 ${isML ? 'ml-text' : ''}`}>
       <Loader2 size={13} className="animate-spin text-accent" />
       {t('getHelp.routeLoading')}
      </span>
     ) : activeRoute && (
      <>
       <Route size={14} className="text-blue-600 shrink-0" />
       <span className={`text-xs font-bold text-primary ${isML ? 'ml-text' : ''}`}>
        {formatRouteDistance(activeRoute.distanceM / 1000, isML)}
        {' · '}
        {formatRouteDuration(activeRoute.durationS / 60, isML)}
       </span>
       {googleUrl && (
        <a
         href={googleUrl}
         target="_blank"
         rel="noopener noreferrer"
         className="btn-ghost py-2 px-3 text-xs min-h-[44px]"
        >
         <ExternalLink size={11} />
         {t('getHelp.openInGoogleMaps')}
        </a>
       )}
       <button
         type="button"
         onClick={handleClearRoute}
         className="btn-ghost py-2 px-3 text-xs min-h-[44px]"
         aria-label={t('getHelp.clearRoute')}
       >
         <X size={11} />
         {t('getHelp.clearRoute')}
       </button>
      </>
     )}
    </div>
   )}

   <div
    ref={containerRef}
    className="centre-map-container w-full rounded-card overflow-hidden border border-border"
    aria-label="Map of Kerala de-addiction centres"
    role="region"
    tabIndex={0}
   />
  </div>
 );
}
