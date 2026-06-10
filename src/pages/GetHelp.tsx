import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, LayoutGrid, Navigation, Phone, Loader2, Scale, WifiOff, Info } from 'lucide-react';
import { CentreCard } from '../components/CentreCard';
import { PageHeader } from '../components/PageHeader';
import { PhoneLink } from '../components/PhoneLink';
import { DistrictSelector } from '../components/DistrictSelector';
import { DataErrorBanner } from '../components/DataErrorBanner';
import { useToast } from '../components/ToastProvider';
import { useAppData } from '../context/DataContext';
import { findContact } from '../utils/contacts';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getCurrentPosition, isGeolocationSupported } from '../utils/geolocation';
import { googleMapsDirectionsUrl } from '../utils/routing';
import type { Centre } from '../types';
import type { CentreMapHandle } from '../components/CentreMap';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function CentreListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card p-4 flex flex-col gap-3 min-h-[220px]">
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-14 rounded-md" />
            <div className="skeleton h-5 w-16 rounded-md" />
            <div className="skeleton h-5 w-10 rounded-md" />
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <div className="skeleton h-9 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-9 rounded-md" />
              <div className="skeleton h-9 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-[clamp(260px,52dvh,420px)] sm:h-[clamp(320px,55vh,480px)] rounded-card overflow-hidden border border-border" aria-hidden="true">
      <div className="skeleton w-full h-full" />
    </div>
  );
}

type MapComponentType = React.ComponentType<{
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
}>;

export function GetHelp() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { showStatus } = useToast();
  const { data, loading, error, retry } = useAppData();
  const online = useOnlineStatus();
  const centres = data?.centres ?? [];
  const vimukthi = findContact(data, 'vimukthi-14405');

  const [tab, setTab] = useState<'list' | 'map'>('map');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [directionsToId, setDirectionsToId] = useState<string | null>(null);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();

  const [MapComponent, setMapComponent] = useState<MapComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import('../components/CentreMap');
      if (!cancelled) {
        setMapComponent(() => mod.CentreMap as MapComponentType);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const ensureMapLoaded = useCallback(async () => {
    if (MapComponent) return;
    const mod = await import('../components/CentreMap');
    setMapComponent(() => mod.CentreMap as MapComponentType);
  }, [MapComponent]);

  const handleMapReady = useCallback((_handle: CentreMapHandle) => {
    // Map ready — geolocation uses navigator API directly from the button click
  }, []);

  const handleGeolocate = useCallback((lat: number, lng: number, quiet = false) => {
    setUserLat(lat);
    setUserLng(lng);
    setLocationName(null);
    setSelectedDistrict(undefined);
    setLocating(false);
    if (!quiet) {
      showStatus('success', isML ? 'ദൂരം അനുസരിച്ച് ക്രമീകരിച്ചു' : 'Sorted by your distance');
    }
  }, [showStatus, isML]);

  const handleGeolocateError = useCallback((code: number, quiet = false) => {
    setLocating(false);
    if (quiet) return;
    if (code === 1) {
      showStatus('warning', isML
        ? 'ലൊക്കേഷൻ അനുവദിച്ചില്ല — ജില്ല തിരഞ്ഞെടുക്കൂ'
        : 'Location access denied — use the district selector');
    } else if (code === 2) {
      showStatus('error', isML
        ? 'ലൊക്കേഷൻ ലഭ്യമല്ല — ജില്ല തിരഞ്ഞെടുക്കൂ'
        : 'Location unavailable — use the district selector');
    } else {
      showStatus('error', isML
        ? 'ലൊക്കേഷൻ ടൈം ഔട്ട് — വീണ്ടും ശ്രമിക്കൂ'
        : 'Location timed out — try again or use the district selector');
    }
  }, [showStatus, isML]);

  const findNearest = useCallback((options?: { auto?: boolean }) => {
    const quiet = options?.auto ?? false;

    if (!isGeolocationSupported()) {
      if (!quiet) {
        showStatus('warning', isML
          ? 'ലൊക്കേഷൻ ലഭ്യമല്ല — HTTPS/localhost ആവശ്യം. ജില്ല തിരഞ്ഞെടുക്കൂ'
          : 'Location needs HTTPS or localhost — use the district selector');
      }
      return;
    }

    setLocating(true);
    setTab('map');
    void ensureMapLoaded();

    getCurrentPosition()
      .then(({ lat, lng }) => {
        handleGeolocate(lat, lng, quiet);
      })
      .catch((err: GeolocationPositionError & { code?: number }) => {
        handleGeolocateError(err.code ?? 2, quiet);
      });
  }, [isML, showStatus, ensureMapLoaded, handleGeolocate, handleGeolocateError]);

  // Geolocation is opt-in: it runs only when the user taps "Find nearest"
  // (or requests directions). Nothing is requested automatically on load.

  const handleDistrictSelect = useCallback((lat: number, lng: number, name: string, id: string) => {
    setUserLat(lat);
    setUserLng(lng);
    setLocationName(name);
    setSelectedDistrict(id);
    setTab('map');
    showStatus('info', isML
      ? `${name} — ദൂരം അനുസരിച്ച് ക്രമീകരിച്ചു`
      : `Showing centres nearest to ${name}`);
  }, [showStatus, isML]);

  const handleCardClick = useCallback(async (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    await ensureMapLoaded();
    setTab('map');
  }, [ensureMapLoaded]);

  const openGoogleDirections = useCallback((centre: Centre, from?: { lat: number; lng: number } | null) => {
    window.open(
      googleMapsDirectionsUrl({ lat: centre.lat, lng: centre.lng }, from),
      '_blank',
      'noopener,noreferrer',
    );
  }, []);

  const handleDirections = useCallback((centreId: string) => {
    const centre = centres.find((c) => c.id === centreId);
    if (!centre) return;

    setSelectedId(centreId);
    setTab('map');
    void ensureMapLoaded();

    const startRoute = () => setDirectionsToId(centreId);

    if (userLat != null && userLng != null) {
      startRoute();
      return;
    }

    if (!isGeolocationSupported()) {
      openGoogleDirections(centre);
      return;
    }

    setLocating(true);
    getCurrentPosition()
      .then(({ lat, lng }) => {
        setUserLat(lat);
        setUserLng(lng);
        setLocating(false);
        startRoute();
      })
      .catch(() => {
        setLocating(false);
        openGoogleDirections(centre);
        showStatus('info', isML
          ? 'Google Maps-ൽ തുറക്കുന്നു…'
          : 'Opening Google Maps…');
      });
  }, [centres, userLat, userLng, ensureMapLoaded, openGoogleDirections, showStatus, isML, t]);

  const showList = useCallback(async () => {
    setTab('list');
  }, []);

  const showMap = useCallback(async () => {
    setTab('map');
    await ensureMapLoaded();
  }, [ensureMapLoaded]);

  const sortedCentres = userLat != null && userLng != null
    ? [...centres].sort((a, b) =>
        haversineKm(userLat, userLng, a.lat, a.lng) -
        haversineKm(userLat, userLng, b.lat, b.lng),
      )
    : centres;

  const locationNote = locationName
    ? (isML ? `ദൂരം: ${locationName}` : `Sorted by distance from ${locationName}`)
    : userLat != null
      ? t('getHelp.locationNote')
      : null;

  return (
    <div>
      <PageHeader
        icon={<MapPin size={18} />}
        title={t('getHelp.heading')}
        subtitle={t('getHelp.intro')}
        isML={isML}
      />

      {error && (
        <div className="mb-4">
          <DataErrorBanner onRetry={retry} />
        </div>
      )}

      {/* Toolbar: location controls + view toggle */}
      <div className="card p-3 mb-4 flex flex-col gap-2.5">
        {/* Row 1 — location: find-nearest + district */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => findNearest()}
            disabled={locating}
            className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
            {locating ? (isML ? 'കണ്ടെത്തുന്നു…' : 'Locating…') : t('getHelp.findNearest')}
          </button>
          <DistrictSelector
            onSelect={handleDistrictSelect}
            selectedId={selectedDistrict}
            className="flex-1 min-w-0"
          />
        </div>

        {/* Row 2 — view toggle: full-width segmented control */}
        <div className="tab-toggle">
          <button
            onClick={showMap}
            className={`tab-toggle-btn ${tab === 'map' ? 'tab-toggle-btn-active' : ''}`}
          >
            <MapPin size={14} />
            {t('getHelp.mapTab')}
          </button>
          <button
            onClick={showList}
            className={`tab-toggle-btn ${tab === 'list' ? 'tab-toggle-btn-active' : ''}`}
          >
            <LayoutGrid size={14} />
            {t('getHelp.listTab')}
          </button>
        </div>

        {locationNote && (
          <p className={`text-[11px] text-accent flex items-center gap-1 ${isML ? 'ml-text' : ''}`}>
            <Navigation size={10} />
            {locationNote}
          </p>
        )}
        <p className={`text-[11px] text-muted flex items-start gap-1.5 ${isML ? 'ml-text' : ''}`}>
          <Info size={11} className="mt-0.5 shrink-0" />
          {t('getHelp.directionsNotice')}
        </p>
      </div>

      {/* Primary content: map + list. The map needs network tiles, so when
          offline we show a graceful message instead of a broken map; the
          card list still works from cached data.json. */}
      {(() => {
        const centreList = loading
          ? <CentreListSkeleton />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {sortedCentres.map((c) => (
                <CentreCard
                  key={c.id}
                  centre={c}
                  distanceKm={
                    userLat != null && userLng != null
                      ? haversineKm(userLat, userLng, c.lat, c.lng)
                      : null
                  }
                  selected={selectedId === c.id}
                  onClick={() => handleCardClick(c.id)}
                  onDirections={handleDirections}
                  userLat={userLat}
                  userLng={userLng}
                />
              ))}
            </div>
          );

        if (!online) {
          return (
            <>
              {tab === 'map' && (
                <div className="tone-amber border rounded-card p-5 flex flex-col items-center text-center gap-2">
                  <WifiOff size={22} className="text-amber-600" />
                  <h2 className={`heading-text font-bold text-primary text-sm ${isML ? 'ml-text' : ''}`}>
                    {t('offline.mapTitle')}
                  </h2>
                  <p className={`text-sm text-secondary leading-relaxed max-w-md ${isML ? 'ml-text' : ''}`}>
                    {t('offline.mapBody')}
                  </p>
                  <button onClick={showList} className="btn-primary mt-1 py-2 px-3 text-xs">
                    <LayoutGrid size={13} />
                    {t('getHelp.listTab')}
                  </button>
                </div>
              )}
              {tab === 'list' && centreList}
            </>
          );
        }

        if (!MapComponent) return <MapSkeleton />;

        return (
          <>
            <MapComponent
              centres={centres}
              userLat={userLat}
              userLng={userLng}
              selectedId={selectedId}
              directionsToId={directionsToId}
              visible={tab === 'map'}
              onSelectCentre={setSelectedId}
              onDirectionsRequest={handleDirections}
              onDirectionsClear={() => setDirectionsToId(null)}
              onGeolocate={handleGeolocate}
              onGeolocateError={handleGeolocateError}
              onMapReady={handleMapReady}
              language={i18n.language}
            />
            {tab === 'list' && centreList}
          </>
        );
      })()}

      {/* Secondary info below map/list */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="tone-indigo border rounded-card p-3 flex items-start gap-3">
          <Scale size={15} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className={`font-bold text-primary text-xs mb-1 ${isML ? 'ml-text' : ''}`}>
              {t('getHelp.rights.heading')}
            </p>
            <p className={`text-secondary text-[11px] leading-relaxed mb-1.5 ${isML ? 'ml-text' : ''}`}>
              {t('getHelp.rights.body')}
            </p>
            <Link
              to="/rights"
              className={`text-[11px] font-bold text-accent hover:opacity-80 ${isML ? 'ml-text' : ''}`}
            >
              {t('getHelp.rights.link')} →
            </Link>
          </div>
        </div>

        <div className="cta-banner p-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
          <p className={`text-xs opacity-90 flex-1 min-w-0 ${isML ? 'ml-text' : ''}`}>
            {t('getHelp.counsellingNote')}
          </p>
          {vimukthi && (
            <PhoneLink
              phone={vimukthi.value}
              label={isML ? vimukthi.label_ml : vimukthi.label_en}
              className="btn-ghost bg-surface text-accent border-none py-2.5 px-3 text-xs w-full sm:w-auto justify-center"
            >
              <Phone size={12} />
              {vimukthi.value}
            </PhoneLink>
          )}
        </div>
      </div>
    </div>
  );
}
