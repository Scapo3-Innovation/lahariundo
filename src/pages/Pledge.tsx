import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HandHeart, Download, Share2, Check, Sparkles, BadgeCheck, MessageCircle, ImageIcon, QrCode,
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import {
  drawPledgeBadge,
  drawPledgeCard,
  generateBadgeId,
  type PledgeDrawProps,
} from '../utils/pledgeCanvas';

type CardFormat = 'card' | 'badge';

const FORMATS: Record<CardFormat, { w: number; h: number }> = {
  card: { w: 1080, h: 1350 },
  badge: { w: 1080, h: 1080 },
};

export function Pledge() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { showStatus } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = useState(false);
  const [badgeId] = useState(generateBadgeId);

  const [name, setName] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [format, setFormat] = useState<CardFormat>('badge');
  const [downloaded, setDownloaded] = useState(false);

  const messages = t('pledge.messages', { returnObjects: true }) as string[];
  const achievementLevels = t('pledge.achievementLevels', { returnObjects: true }) as string[];
  const { w: CARD_W, h: CARD_H } = FORMATS[format];

  const verifyUrl = useMemo(
    () => `${window.location.origin}/pledge?verify=${badgeId}`,
    [badgeId],
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoRef.current = img; setLogoReady(true); };
    img.onerror = () => { setLogoReady(true); };
    img.src = '/logo-opt.png';
  }, []);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bodyFont = isML ? "'Noto Sans Malayalam'" : "'JetBrains Mono'";
    try {
      await Promise.all([
        document.fonts.load(`700 52px ${bodyFont}`),
        document.fonts.load(`800 46px 'JetBrains Mono'`),
      ]);
    } catch { /* system font fallback */ }

    const message = messages[msgIndex] ?? messages[0] ?? '';
    const trimmed = name.trim();
    const datePart = new Date().toLocaleDateString(isML ? 'ml-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const dateStamp = new Date().toLocaleDateString(isML ? 'ml-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).toUpperCase();
    const dateLabel = `${t('pledge.datePrefix')} · ${datePart}`;

    const props: PledgeDrawProps = {
      w: CARD_W,
      h: CARD_H,
      logo: logoRef.current,
      message,
      name: trimmed,
      badgeId,
      achievementLevel: achievementLevels[msgIndex] ?? achievementLevels[0] ?? '',
      ambassadorTitle: t('pledge.ambassadorTitle'),
      dateLabel,
      dateStamp,
      cardTag: t('pledge.cardTag'),
      cardBrand: t('pledge.cardBrand'),
      cardStamp: t('pledge.cardStamp'),
      bodyFont,
      verifyUrl,
    };

    if (format === 'card') await drawPledgeCard(ctx, props);
    else await drawPledgeBadge(ctx, props);
  }, [isML, msgIndex, name, messages, achievementLevels, format, CARD_W, CARD_H, badgeId, verifyUrl, t]);

  useEffect(() => {
    if (logoReady) void draw();
  }, [logoReady, draw]);

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      canvasRef.current?.toBlob((b) => resolve(b), 'image/png');
    });

  const fileName = format === 'badge' ? 'lahariundo-pledge-badge.png' : 'lahariundo-pledge-card.png';

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
    showStatus('success', t('pledge.downloaded'));
  };

  const handleShare = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: t('pledge.shareTitle'),
          text: t('pledge.shareText'),
        });
        return;
      } catch { /* cancelled or failed */ }
    }
    await handleDownload();
    showStatus('info', t('pledge.shareFailed'));
  };

  const previewMaxW = format === 'badge' ? 'max-w-[280px]' : 'max-w-[260px]';

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card border border-border bg-surface-2 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-soft border border-border flex items-center justify-center shrink-0">
          <HandHeart size={22} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className={`heading-text text-xl sm:text-2xl font-extrabold text-primary ${isML ? 'ml-text' : ''}`}>
            {t('pledge.heading')}
          </h1>
          <p className={`text-secondary text-sm mt-1 leading-relaxed ${isML ? 'ml-text' : ''}`}>
            {t('pledge.intro')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 tone-teal border rounded-full px-3 py-1.5">
          <Sparkles size={14} className="text-accent" />
          <span className={`text-xs font-bold text-primary ${isML ? 'ml-text' : ''}`}>{t('pledge.badgeHint')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
          <div className="flex gap-2 w-full max-w-[320px]">
            {(['badge', 'card'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={[
                  'flex-1 py-2 px-3 rounded-full text-xs font-bold border-2 transition-all',
                  format === f
                    ? 'border-accent bg-accent text-accent-text'
                    : 'border-border bg-surface-2 text-secondary hover:border-border-strong',
                  isML ? 'ml-text' : '',
                ].join(' ')}
              >
                {f === 'badge' ? t('pledge.formatBadge') : t('pledge.formatCard')}
              </button>
            ))}
          </div>

          <div
            className={[
              'relative w-full flex justify-center',
              format === 'badge' ? 'py-6' : 'py-4',
            ].join(' ')}
          >
            <div
              className="absolute inset-0 mx-auto w-[85%] h-[85%] rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #0b8f3c 0%, transparent 70%)' }}
              aria-hidden="true"
            />
            <div
              className={[
                'relative rounded-card p-2 bg-surface border border-border shadow-elevated',
                format === 'badge' ? 'rounded-full p-3' : '',
              ].join(' ')}
            >
              <canvas
                ref={canvasRef}
                width={CARD_W}
                height={CARD_H}
                className={`w-full ${previewMaxW} block ${format === 'badge' ? 'rounded-full aspect-square' : 'rounded-lg aspect-[4/5]'}`}
                role="img"
                aria-label={`${t('pledge.cardTag')}: ${messages[msgIndex] ?? ''}${name.trim() ? ` — ${name.trim()}` : ''}`}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-accent text-accent-text px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap">
                <BadgeCheck size={12} />
                {t('pledge.livePreview')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted bg-surface-2 border border-border rounded-full px-3 py-1.5">
            <QrCode size={12} className="text-accent shrink-0" />
            <span className={`tabular-nums ${isML ? 'ml-text' : ''}`}>{badgeId}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[320px]">
            <button onClick={handleShare} className="btn-primary flex-1 py-3">
              <Share2 size={16} />
              {t('pledge.sharePrimary')}
            </button>
            <button onClick={handleDownload} className="btn-ghost flex-1 py-3 border-border-strong">
              {downloaded ? <Check size={16} /> : <Download size={16} />}
              {t('pledge.download')}
            </button>
          </div>
        </div>

        <div className="order-2 lg:order-1 flex flex-col gap-5">
          <div>
            <label htmlFor="pledge-name" className={`ui-label block mb-1.5 ${isML ? 'ml-text' : ''}`}>
              {t('pledge.nameLabel')}
            </label>
            <input
              id="pledge-name"
              type="text"
              value={name}
              maxLength={28}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('pledge.namePlaceholder')}
              className={`input-field ${isML ? 'ml-text' : ''}`}
              autoComplete="off"
            />
          </div>

          <fieldset>
            <legend className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('pledge.messageLabel')}</legend>
            <div className="grid grid-cols-1 gap-2">
              {messages.map((m, i) => {
                const selected = msgIndex === i;
                const level = achievementLevels[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMsgIndex(i)}
                    aria-pressed={selected}
                    className={[
                      'text-left p-3.5 rounded-card border-2 transition-all flex items-start gap-3',
                      selected
                        ? 'border-accent bg-accent-soft ring-2 ring-accent/20'
                        : 'border-border bg-surface hover:border-border-strong',
                      isML ? 'ml-text' : '',
                    ].join(' ')}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-border bg-surface-2 flex items-center justify-center text-[11px] font-bold text-muted shrink-0 tabular-nums"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className={`text-sm leading-relaxed whitespace-pre-line ${selected ? 'font-bold text-primary' : 'text-secondary'}`}>
                        {m}
                      </span>
                      {level && (
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${selected ? 'text-accent' : 'text-muted'}`}>
                          {level}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="rounded-card border border-border bg-surface-2 p-4">
            <p className={`ui-label mb-2.5 ${isML ? 'ml-text' : ''}`}>{t('pledge.shareTipsHeading')}</p>
            <ul className="flex flex-col gap-2">
              {[
                { icon: <MessageCircle size={14} className="text-green-600" />, text: t('pledge.shareTipWa') },
                { icon: <ImageIcon size={14} className="text-pink-500" />, text: t('pledge.shareTipIg') },
                { icon: <QrCode size={14} className="text-accent" />, text: t('pledge.shareTipQr') },
                { icon: <BadgeCheck size={14} className="text-accent" />, text: t('pledge.shareTipBadge') },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  <span className={`text-xs text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className={`text-[11px] text-muted leading-relaxed ${isML ? 'ml-text' : ''}`}>
            {t('pledge.privacy')}
          </p>
        </div>
      </div>
    </div>
  );
}
