import { Phone, MapPin, ExternalLink, Navigation, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PhoneLink } from './PhoneLink';
import { isPlaceholderPhone, resolveDialNumber, VIMUKTHI_HELPLINE } from '../utils/phone';
import { googleMapsDirectionsUrl } from '../utils/routing';
import type { Centre } from '../types';

interface Props {
  centre: Centre;
  distanceKm?: number | null;
  selected?: boolean;
  onClick?: () => void;
  onDirections?: (centreId: string) => void;
  userLat?: number | null;
  userLng?: number | null;
}

const SERVICE_STYLES: Record<string, string> = {
  detox:       'bg-surface-2 text-secondary border-border',
  counselling: 'tone-teal border text-xs',
  op:          'tone-amber border text-xs',
  inpatient:   'tone-violet border text-xs',
};

const COST_STYLES: Record<string, string> = {
  free:       'tone-emerald border',
  subsidised: 'tone-blue border',
  paid:       'bg-surface-2 text-secondary border-border',
};

export function CentreCard({ centre, distanceKm, selected, onClick, onDirections, userLat, userLng }: Props) {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';

  const name = isML ? centre.name_ml : centre.name_en;
  const address = isML ? centre.address_ml : centre.address_en;
  const dialNumber = resolveDialNumber(centre.phone);
  const usesHelpline = isPlaceholderPhone(centre.phone);

  const handleDirections = () => {
    if (onDirections) {
      onDirections(centre.id);
      return;
    }
    window.open(
      googleMapsDirectionsUrl(
        { lat: centre.lat, lng: centre.lng },
        userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null,
      ),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <article
      className={[
        'card card-hover flex flex-col h-full p-4 transition-colors',
        selected ? 'border-accent ring-1 ring-accent/30' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`font-semibold text-primary text-sm leading-snug line-clamp-2 ${isML ? 'ml-text' : ''}`}>
          {name}
        </h3>
        {distanceKm != null && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent-soft border border-border px-2 py-0.5 rounded-md">
            <Navigation size={9} />
            {distanceKm.toFixed(1)} {t('getHelp.kilometre')}
          </span>
        )}
      </div>

      <p className={`text-xs text-muted flex items-start gap-1.5 mb-3 leading-relaxed line-clamp-2 ${isML ? 'ml-text' : ''}`}>
        <MapPin size={11} className="mt-0.5 shrink-0" />
        <span>{address}</span>
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {centre.type.map((s) => (
          <span
            key={s}
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${SERVICE_STYLES[s] ?? 'bg-surface-2 text-secondary border-border'}`}
          >
            {t(`getHelp.services.${s}`)}
          </span>
        ))}
        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${COST_STYLES[centre.cost] ?? ''}`}>
          {t(`getHelp.cost.${centre.cost}`)}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <PhoneLink
          phone={dialNumber}
          label={usesHelpline ? `Vimukthi Helpline — ${name}` : name}
          className="btn-primary py-2 px-3 text-[11px] w-full justify-center"
        >
          <Phone size={12} />
          {usesHelpline ? VIMUKTHI_HELPLINE : t('getHelp.callCentre')}
        </PhoneLink>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDirections}
            className="btn-ghost py-2 px-2 text-[11px] justify-center"
            aria-label={`${t('getHelp.directions')}: ${name}`}
          >
            <ExternalLink size={12} />
            {t('getHelp.directions')}
          </button>
          {onClick && (
            <button
              type="button"
              onClick={onClick}
              className={[
                'btn-ghost py-2 px-2 text-[11px] justify-center',
                selected ? 'border-accent text-accent' : '',
              ].join(' ')}
              aria-label={`${isML ? 'ഭൂപടത്തിൽ കാണൂ' : 'View on map'}: ${name}`}
            >
              <Map size={12} />
              {isML ? 'ഭൂപടം' : 'Map'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
