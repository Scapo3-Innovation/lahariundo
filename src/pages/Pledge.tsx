import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HandHeart, Download, Share2, Check, Sparkles, BadgeCheck, MessageCircle,
  ImageIcon, QrCode, Copy, Trophy, Shield, Users, Leaf,
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

const TIER_META = [
  { icon: Leaf, accent: 'text-emerald-500', ring: 'border-emerald-400', bg: 'from-emerald-500/15 to-emerald-500/5' },
  { icon: Trophy, accent: 'text-amber-500', ring: 'border-amber-400', bg: 'from-amber-500/15 to-amber-500/5' },
  { icon: Shield, accent: 'text-sky-500', ring: 'border-sky-400', bg: 'from-sky-500/15 to-sky-500/5' },
  { icon: Users, accent: 'text-violet-500', ring: 'border-violet-400', bg: 'from-violet-500/15 to-violet-500/5' },
];

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
  const [copied, setCopied] = useState(false);

  const messages = t('pledge.messages', { returnObjects: true }) as string[];
  const achievementLevels = t('pledge.achievementLevels', { returnObjects: true }) as string[];
  const { w: CARD_W, h: CARD_H } = FORMATS[format];

  const verifyUrl = useMemo(
    () => `${window.location.origin}/pledge?verify=${badgeId}`,
    [badgeId],
  );

  const shareCaption = useMemo(() => {
    const msg = (messages[msgIndex] ?? '').replace(/\n/g, ' ');
    const who = name.trim() || t('pledge.anonymousName');
    return t('pledge.shareCaptionTemplate', { name: who, message: msg, badgeId, hashtag: t('pledge.hashtag') });
  }, [messages, msgIndex, name, badgeId, t]);

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
    const dateStamp = datePart.toUpperCase();
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
          text: shareCaption,
        });
        return;
      } catch { /* cancelled or failed */ }
    }
    await handleDownload();
    showStatus('info', t('pledge.shareFailed'));
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(shareCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showStatus('success', t('pledge.copied'));
    } catch {
      showStatus('info', t('pledge.shareFailed'));
    }
  };

  const currentLevel = achievementLevels[msgIndex] ?? '';
  const TierIcon = TIER_META[msgIndex]?.icon ?? Leaf;
  const tierStyle = TIER_META[msgIndex] ?? TIER_META[0];
  const previewMaxW = format === 'badge' ? 'max-w-[min(100%,300px)]' : 'max-w-[min(100%,270px)]';

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-card border border-accent/30 bg-gradient-to-br from-accent/20 via-surface to-surface-2 p-5 sm:p-6">
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent text-accent-text flex items-center justify-center shrink-0 shadow-sm">
            <HandHeart size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`heading-text text-2xl sm:text-3xl font-extrabold text-primary ${isML ? 'ml-text' : ''}`}>
              {t('pledge.heading')}
            </h1>
            <p className={`text-secondary text-sm mt-2 leading-relaxed max-w-xl ${isML ? 'ml-text' : ''}`}>
              {t('pledge.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[t('pledge.pillFree'), t('pledge.pillPrivate'), t('pledge.pillShareable')].map((pill) => (
                <span
                  key={pill}
                  className={`inline-flex items-center gap-1 rounded-full bg-surface/80 border border-border px-2.5 py-1 text-[10px] font-bold text-primary ${isML ? 'ml-text' : ''}`}
                >
                  <Sparkles size={10} className="text-accent" />
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Builder */}
        <div className="flex flex-col gap-5 order-2 xl:order-1">
          <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
            <p className={`ui-label mb-3 flex items-center gap-2 ${isML ? 'ml-text' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center">1</span>
              {t('pledge.stepName')}
            </p>
            <label htmlFor="pledge-name" className={`sr-only ${isML ? 'ml-text' : ''}`}>
              {t('pledge.nameLabel')}
            </label>
            <input
              id="pledge-name"
              type="text"
              value={name}
              maxLength={28}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('pledge.namePlaceholder')}
              className={`input-field text-base ${isML ? 'ml-text' : ''}`}
              autoComplete="off"
            />
          </section>

          <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
            <p className={`ui-label mb-3 flex items-center gap-2 ${isML ? 'ml-text' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center">2</span>
              {t('pledge.stepPledge')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {messages.map((m, i) => {
                const selected = msgIndex === i;
                const level = achievementLevels[i];
                const meta = TIER_META[i] ?? TIER_META[0];
                const Icon = meta.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMsgIndex(i)}
                    aria-pressed={selected}
                    className={[
                      'relative text-left p-4 rounded-card border-2 transition-all overflow-hidden',
                      selected
                        ? `${meta.ring} bg-gradient-to-br ${meta.bg} ring-2 ring-accent/25 shadow-sm`
                        : 'border-border bg-surface-2 hover:border-border-strong',
                      isML ? 'ml-text' : '',
                    ].join(' ')}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-accent-text flex items-center justify-center">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                    <div className={`w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center mb-2.5 ${meta.accent}`}>
                      <Icon size={18} />
                    </div>
                    {level && (
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider mb-1.5 ${selected ? 'text-accent' : 'text-muted'}`}>
                        {level}
                      </span>
                    )}
                    <span className={`text-sm leading-snug whitespace-pre-line block ${selected ? 'font-bold text-primary' : 'text-secondary'}`}>
                      {m}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
            <p className={`ui-label mb-3 flex items-center gap-2 ${isML ? 'ml-text' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center">3</span>
              {t('pledge.stepShare')}
            </p>
            <div className="rounded-lg bg-surface-2 border border-border p-3 mb-3">
              <p className={`text-xs text-secondary leading-relaxed mb-2 ${isML ? 'ml-text' : ''}`}>
                {t('pledge.shareCaptionLabel')}
              </p>
              <p className={`text-sm text-primary leading-relaxed ${isML ? 'ml-text' : ''}`}>{shareCaption}</p>
              <button
                type="button"
                onClick={copyCaption}
                className="btn-ghost mt-2 py-1.5 px-3 text-xs"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t('pledge.copied') : t('pledge.copyCaption')}
              </button>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: <MessageCircle size={14} className="text-green-600" />, text: t('pledge.shareTipWa') },
                { icon: <ImageIcon size={14} className="text-pink-500" />, text: t('pledge.shareTipIg') },
                { icon: <QrCode size={14} className="text-accent" />, text: t('pledge.shareTipQr') },
                { icon: <BadgeCheck size={14} className="text-accent" />, text: t('pledge.shareTipBadge') },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2 rounded-lg bg-surface-2 border border-border p-2.5">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  <span className={`text-[11px] text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className={`text-[11px] text-muted leading-relaxed px-1 ${isML ? 'ml-text' : ''}`}>
            {t('pledge.privacy')}
          </p>
        </div>

        {/* Preview stage */}
        <div className="order-1 xl:order-2 xl:sticky xl:top-24 self-start">
          <div className="rounded-card border border-border bg-gradient-to-b from-surface-2 to-surface p-4 sm:p-5 flex flex-col items-center gap-4">
            <div className="flex gap-2 w-full">
              {(['badge', 'card'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={[
                    'flex-1 py-2.5 px-3 rounded-full text-xs font-bold border-2 transition-all',
                    format === f
                      ? 'border-accent bg-accent text-accent-text shadow-sm'
                      : 'border-border bg-surface text-secondary hover:border-accent/40',
                    isML ? 'ml-text' : '',
                  ].join(' ')}
                >
                  {f === 'badge' ? t('pledge.formatBadge') : t('pledge.formatCard')}
                </button>
              ))}
            </div>

            <div className="relative w-full flex justify-center py-4">
              <div
                className="absolute inset-0 mx-auto w-4/5 h-4/5 rounded-full opacity-50 blur-3xl pointer-events-none bg-accent"
                aria-hidden="true"
              />
              <div
                className={[
                  'relative p-2.5 bg-surface border-2 border-accent/30 shadow-elevated',
                  format === 'badge' ? 'rounded-full' : 'rounded-2xl',
                ].join(' ')}
              >
                <canvas
                  ref={canvasRef}
                  width={CARD_W}
                  height={CARD_H}
                  className={`w-full ${previewMaxW} block ${format === 'badge' ? 'rounded-full aspect-square' : 'rounded-xl aspect-[4/5]'}`}
                  role="img"
                  aria-label={`${t('pledge.cardTag')}: ${messages[msgIndex] ?? ''}${name.trim() ? ` — ${name.trim()}` : ''}`}
                />
              </div>

              {currentLevel && (
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border-2 ${tierStyle.ring} bg-surface px-3 py-1 shadow-sm`}>
                  <TierIcon size={14} className={tierStyle.accent} />
                  <span className={`text-[10px] font-bold uppercase tracking-wide text-primary ${isML ? 'ml-text' : ''}`}>
                    {currentLevel}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted bg-surface border border-border rounded-full px-3 py-1.5 w-full justify-center">
              <QrCode size={12} className="text-accent shrink-0" />
              <span className={`tabular-nums font-semibold ${isML ? 'ml-text' : ''}`}>{badgeId}</span>
            </div>

            <div className="w-full rounded-lg tone-teal border p-3 text-center">
              <p className={`text-sm font-bold text-primary mb-0.5 ${isML ? 'ml-text' : ''}`}>
                {t('pledge.readyHeading')}
              </p>
              <p className={`text-xs text-secondary ${isML ? 'ml-text' : ''}`}>{t('pledge.readyBody')}</p>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleShare}
                className="btn-primary w-full py-3.5 text-base shadow-sm animate-pulse hover:animate-none"
              >
                <Share2 size={18} />
                {t('pledge.sharePrimary')}
              </button>
              <button onClick={handleDownload} className="btn-ghost w-full py-3 border-border-strong">
                {downloaded ? <Check size={16} /> : <Download size={16} />}
                {t('pledge.download')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
