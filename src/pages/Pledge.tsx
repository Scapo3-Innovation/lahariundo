import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHeart, Download, Share2, Check } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/ToastProvider';

const CARD_W = 1080;
const CARD_H = 1350;

// Brand greens (palette is requested explicitly; canvas can't read CSS vars).
const GREEN_TOP = '#15803d';
const GREEN_BOTTOM = '#0f5132';
const CREAM = '#f0fdf4';

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

export function Pledge() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { showStatus } = useToast();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = useState(false);

  // Name lives ONLY in component state — never persisted, never sent anywhere.
  const [name, setName] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  const messages = t('pledge.messages', { returnObjects: true }) as string[];

  // Load the logo once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoRef.current = img; setLogoReady(true); };
    img.onerror = () => { setLogoReady(true); }; // draw without logo if it fails
    img.src = '/logo-opt.png';
  }, []);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bodyFont = isML ? "'Noto Sans Malayalam'" : "'JetBrains Mono'";
    // Make sure web fonts are available before painting text to the bitmap.
    try {
      await Promise.all([
        document.fonts.load(`700 64px ${bodyFont}`),
        document.fonts.load(`700 40px 'JetBrains Mono'`),
      ]);
    } catch { /* fall back to system font */ }

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
    grad.addColorStop(0, GREEN_TOP);
    grad.addColorStop(1, GREEN_BOTTOM);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Soft decorative circle
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.arc(CARD_W - 120, 220, 320, 0, Math.PI * 2);
    ctx.fill();

    // Inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, CARD_W - 120, CARD_H - 120);

    ctx.textAlign = 'center';

    // Logo
    const logo = logoRef.current;
    if (logo) {
      const size = 150;
      ctx.drawImage(logo, CARD_W / 2 - size / 2, 150, size, size);
    }

    // Tag
    ctx.fillStyle = 'rgba(240,253,244,0.85)';
    ctx.font = `700 36px 'JetBrains Mono'`;
    ctx.fillText(t('pledge.cardTag').toUpperCase(), CARD_W / 2, logo ? 360 : 300);

    // Message (wrapped)
    ctx.fillStyle = CREAM;
    ctx.font = `700 68px ${bodyFont}`;
    const message = messages[msgIndex] ?? messages[0] ?? '';
    const lines = wrapLines(ctx, message, CARD_W - 220);
    const lineHeight = 92;
    const blockHeight = lines.length * lineHeight;
    let y = CARD_H / 2 - blockHeight / 2 + 40;
    for (const line of lines) {
      ctx.fillText(line, CARD_W / 2, y);
      y += lineHeight;
    }

    // Name
    const trimmed = name.trim();
    if (trimmed) {
      ctx.fillStyle = 'rgba(240,253,244,0.92)';
      ctx.font = `500 48px ${bodyFont}`;
      ctx.fillText(`— ${trimmed}`, CARD_W / 2, y + 40);
    }

    // Brand footer
    ctx.fillStyle = 'rgba(240,253,244,0.7)';
    ctx.font = `600 32px 'JetBrains Mono'`;
    ctx.fillText(t('pledge.cardBrand'), CARD_W / 2, CARD_H - 130);
  }, [isML, msgIndex, name, messages, t]);

  useEffect(() => {
    if (logoReady) void draw();
  }, [logoReady, draw]);

  const getBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lahariundo-pledge.png';
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
    const file = new File([blob], 'lahariundo-pledge.png', { type: 'image/png' });
    const shareData = { files: [file], title: t('pledge.shareTitle'), text: t('pledge.shareText') };

    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to download
      }
    }
    await handleDownload();
    showStatus('info', t('pledge.shareFailed'));
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<HandHeart size={18} className="text-emerald-600" />}
        title={t('pledge.heading')}
        subtitle={t('pledge.intro')}
        isML={isML}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Controls */}
        <div className="flex flex-col gap-4">
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
            <legend className={`ui-label mb-1.5 ${isML ? 'ml-text' : ''}`}>{t('pledge.messageLabel')}</legend>
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => {
                const selected = msgIndex === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMsgIndex(i)}
                    aria-pressed={selected}
                    className={`text-left p-3 rounded-card border text-sm transition-all ${
                      selected
                        ? 'tone-teal border ring-2 ring-accent/30 text-primary font-semibold'
                        : 'bg-surface border-border text-secondary hover:border-border-strong'
                    } ${isML ? 'ml-text' : ''}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownload} className="btn-primary">
              {downloaded ? <Check size={14} /> : <Download size={14} />}
              {t('pledge.download')}
            </button>
            <button onClick={handleShare} className="btn-ghost">
              <Share2 size={14} />
              {t('pledge.share')}
            </button>
          </div>

          <p className={`text-[11px] text-muted leading-relaxed ${isML ? 'ml-text' : ''}`}>
            {t('pledge.privacy')}
          </p>
        </div>

        {/* Preview */}
        <div>
          <p className={`ui-label mb-1.5 ${isML ? 'ml-text' : ''}`}>{t('pledge.previewHeading')}</p>
          <canvas
            ref={canvasRef}
            width={CARD_W}
            height={CARD_H}
            className="w-full max-w-[300px] mx-auto rounded-card border border-border shadow-elevated"
            role="img"
            aria-label={`${t('pledge.cardTag')}: ${messages[msgIndex] ?? ''}${name.trim() ? ` — ${name.trim()}` : ''}`}
          />
        </div>
      </div>
    </div>
  );
}
