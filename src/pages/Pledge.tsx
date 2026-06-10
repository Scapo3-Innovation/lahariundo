import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HandHeart, Download, Share2, Check, Sparkles, BadgeCheck, MessageCircle, ImageIcon,
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';

type CardFormat = 'story' | 'badge';

const FORMATS: Record<CardFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1350 },
  badge: { w: 1080, h: 1080 },
};

const GREEN_TOP = '#16a34a';
const GREEN_MID = '#15803d';
const GREEN_DEEP = '#052e16';
const GOLD = '#fbbf24';
const CREAM = '#f0fdf4';
const WHITE = '#ffffff';

function drawCheckMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.35, cy);
  ctx.lineTo(cx - size * 0.05, cy + size * 0.3);
  ctx.lineTo(cx + size * 0.4, cy - size * 0.35);
  ctx.stroke();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawRingDots(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.fillStyle = i % 2 === 0 ? GOLD : WHITE;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStamp(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, sub: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  ctx.strokeStyle = 'rgba(251,191,36,0.85)';
  ctx.fillStyle = 'rgba(5,46,22,0.55)';
  ctx.lineWidth = 4;
  const w = 220;
  const h = 72;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.font = "700 28px 'JetBrains Mono'";
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, -4);
  ctx.font = "600 18px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(240,253,244,0.9)';
  ctx.fillText(sub, 0, 22);
  ctx.restore();
}

export function Pledge() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { showStatus } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = useState(false);

  const [name, setName] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [format, setFormat] = useState<CardFormat>('badge');
  const [downloaded, setDownloaded] = useState(false);

  const messages = t('pledge.messages', { returnObjects: true }) as string[];
  const { w: CARD_W, h: CARD_H } = FORMATS[format];

  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoRef.current = img; setLogoReady(true); };
    img.onerror = () => { setLogoReady(true); };
    img.src = '/logo-opt.png';
  }, []);

  const drawStory = useCallback(
    async (ctx: CanvasRenderingContext2D, bodyFont: string, message: string, trimmed: string, dateLabel: string) => {
      const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
      grad.addColorStop(0, GREEN_TOP);
      grad.addColorStop(0.45, GREEN_MID);
      grad.addColorStop(1, GREEN_DEEP);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      ctx.arc(CARD_W - 80, 180, 360, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(120, CARD_H - 200, 280, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 6;
      ctx.strokeRect(48, 48, CARD_W - 96, CARD_H - 96);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(64, 64, CARD_W - 128, CARD_H - 128);

      ctx.textAlign = 'center';
      const logo = logoRef.current;
      const logoY = 120;
      if (logo) ctx.drawImage(logo, CARD_W / 2 - 72, logoY, 144, 144);

      ctx.fillStyle = GOLD;
      ctx.font = "700 34px 'JetBrains Mono'";
      ctx.fillText(t('pledge.cardTag').toUpperCase(), CARD_W / 2, logo ? 310 : 260);

      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = "700 180px 'JetBrains Mono'";
      ctx.fillText('"', 120, CARD_H / 2 - 40);
      ctx.fillText('"', CARD_W - 120, CARD_H / 2 + 120);

      ctx.fillStyle = CREAM;
      ctx.font = `700 62px ${bodyFont}`;
      const lines = wrapLines(ctx, message, CARD_W - 200);
      const lineHeight = 86;
      const blockHeight = lines.length * lineHeight;
      let y = CARD_H / 2 - blockHeight / 2 + 20;
      for (const line of lines) {
        ctx.fillText(line, CARD_W / 2, y);
        y += lineHeight;
      }

      if (trimmed) {
        ctx.strokeStyle = 'rgba(251,191,36,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CARD_W / 2 - 120, y + 16);
        ctx.lineTo(CARD_W / 2 + 120, y + 16);
        ctx.stroke();
        ctx.fillStyle = WHITE;
        ctx.font = `600 46px ${bodyFont}`;
        ctx.fillText(trimmed, CARD_W / 2, y + 72);
        y += 72;
      }

      ctx.fillStyle = 'rgba(240,253,244,0.75)';
      ctx.font = "600 28px 'JetBrains Mono'";
      ctx.fillText(t('pledge.cardBrand'), CARD_W / 2, CARD_H - 100);
      ctx.font = "500 24px 'JetBrains Mono'";
      ctx.fillText(dateLabel, CARD_W / 2, CARD_H - 58);

      drawStamp(ctx, CARD_W - 160, CARD_H - 200, t('pledge.cardStamp'), dateLabel.split(' · ').pop() ?? '');
    },
    [CARD_W, CARD_H, t],
  );

  const drawBadge = useCallback(
    async (ctx: CanvasRenderingContext2D, bodyFont: string, message: string, trimmed: string, dateLabel: string) => {
      const cx = CARD_W / 2;
      const cy = CARD_H / 2;
      const outerR = 500;
      const innerR = 430;

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, CARD_W * 0.72);
      bg.addColorStop(0, '#14532d');
      bg.addColorStop(1, GREEN_DEEP);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 380, cy + Math.sin(a) * 380, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - 18, 0, Math.PI * 2);
      ctx.stroke();

      drawRingDots(ctx, cx, cy, outerR - 8, 32);

      const innerGrad = ctx.createRadialGradient(cx, cy - 40, 0, cx, cy, innerR);
      innerGrad.addColorStop(0, GREEN_TOP);
      innerGrad.addColorStop(1, GREEN_MID);
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = 'center';
      const logo = logoRef.current;
      if (logo) ctx.drawImage(logo, cx - 64, cy - 320, 128, 128);

      ctx.fillStyle = GOLD;
      ctx.font = "700 30px 'JetBrains Mono'";
      ctx.fillText(t('pledge.cardTag').toUpperCase(), cx, cy - 175);

      ctx.fillStyle = CREAM;
      ctx.font = `700 52px ${bodyFont}`;
      const lines = wrapLines(ctx, message, innerR * 1.55);
      const lineHeight = 68;
      const blockHeight = lines.length * lineHeight;
      let y = cy - blockHeight / 2 + 10;
      for (const line of lines) {
        ctx.fillText(line, cx, y);
        y += lineHeight;
      }

      if (trimmed) {
        ctx.fillStyle = WHITE;
        ctx.font = `600 40px ${bodyFont}`;
        ctx.fillText(trimmed, cx, y + 36);
        y += 36;
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy + innerR - 95);
      ctx.lineTo(cx + 140, cy + innerR - 95);
      ctx.stroke();

      ctx.fillStyle = 'rgba(240,253,244,0.85)';
      ctx.font = "600 26px 'JetBrains Mono'";
      ctx.fillText(t('pledge.cardBrand'), cx, cy + innerR - 58);
      ctx.font = "500 22px 'JetBrains Mono'";
      ctx.fillStyle = 'rgba(240,253,244,0.65)';
      ctx.fillText(dateLabel, cx, cy + innerR - 24);

      drawCheckMark(ctx, cx, cy - innerR + 42, 22);
    },
    [CARD_W, CARD_H, t],
  );

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
        document.fonts.load(`700 34px 'JetBrains Mono'`),
      ]);
    } catch { /* system font fallback */ }

    const message = messages[msgIndex] ?? messages[0] ?? '';
    const trimmed = name.trim();
    const datePart = new Date().toLocaleDateString(isML ? 'ml-IN' : 'en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    const dateLabel = `${t('pledge.datePrefix')} · ${datePart}`;

    if (format === 'story') await drawStory(ctx, bodyFont, message, trimmed, dateLabel);
    else await drawBadge(ctx, bodyFont, message, trimmed, dateLabel);
  }, [isML, msgIndex, name, messages, format, CARD_W, CARD_H, drawStory, drawBadge, t]);

  useEffect(() => {
    if (logoReady) void draw();
  }, [logoReady, draw]);

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      canvasRef.current?.toBlob((b) => resolve(b), 'image/png');
    });

  const fileName = format === 'badge' ? 'lahariundo-pledge-badge.png' : 'lahariundo-pledge-story.png';

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
      {/* Hero */}
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
        {/* Preview column — first on mobile */}
        <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
          <div className="flex gap-2 w-full max-w-[320px]">
            {(['badge', 'story'] as const).map((f) => (
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
                {f === 'badge' ? t('pledge.formatBadge') : t('pledge.formatStory')}
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
              style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}
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

        {/* Controls */}
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
                    <span className={`text-sm leading-relaxed ${selected ? 'font-bold text-primary' : 'text-secondary'}`}>
                      {m}
                    </span>
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
