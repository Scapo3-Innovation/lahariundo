import QRCode from 'qrcode';

export const PLEDGE_COLORS = {
  primaryGreen: '#0b8f3c',
  darkGreen: '#054d25',
  deepGreen: '#032f17',
  gold: '#f4c430',
  lightGold: '#ffd95a',
  white: '#ffffff',
  mutedWhite: 'rgba(255,255,255,0.75)',
  glass: 'rgba(255,255,255,0.08)',
  cream: '#e0f2e9',
} as const;

export function generateBadgeId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, '0');
  return `LU-${year}-${num}`;
}

export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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

export function wrapMessage(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const p of paragraphs) {
    if (p.trim()) lines.push(...wrapLines(ctx, p.trim(), maxWidth));
  }
  return lines;
}

export function drawCheckMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.strokeStyle = PLEDGE_COLORS.gold;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.35, cy);
  ctx.lineTo(cx - size * 0.05, cy + size * 0.3);
  ctx.lineTo(cx + size * 0.4, cy - size * 0.35);
  ctx.stroke();
}

export function drawRingDots(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    ctx.fillStyle = PLEDGE_COLORS.white;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  sub: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.18);
  ctx.strokeStyle = 'rgba(244,196,48,0.9)';
  ctx.fillStyle = 'rgba(3,47,23,0.6)';
  ctx.lineWidth = 4;
  const w = 240;
  const h = 80;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PLEDGE_COLORS.gold;
  ctx.font = "800 30px 'JetBrains Mono'";
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, -6);
  ctx.font = "600 20px 'JetBrains Mono'";
  ctx.fillStyle = PLEDGE_COLORS.mutedWhite;
  ctx.fillText(sub, 0, 24);
  ctx.restore();
}

export function drawAchievementPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
) {
  ctx.font = "800 20px 'JetBrains Mono'";
  const tw = ctx.measureText(label).width;
  const pw = tw + 44;
  const ph = 38;
  const grad = ctx.createLinearGradient(cx - pw / 2, cy, cx + pw / 2, cy);
  grad.addColorStop(0, PLEDGE_COLORS.lightGold);
  grad.addColorStop(0.5, PLEDGE_COLORS.gold);
  grad.addColorStop(1, '#d4a017');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PLEDGE_COLORS.deepGreen;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.toUpperCase(), cx, cy + 1);
  ctx.textBaseline = 'alphabetic';
}

/** Subtle starburst behind the medallion. */
export function drawStarburst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rays: number,
  color: string,
) {
  for (let i = 0; i < rays; i++) {
    const a1 = (i / rays) * Math.PI * 2;
    const a2 = ((i + 0.5) / rays) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius);
    ctx.lineTo(cx + Math.cos(a2) * radius * 0.35, cy + Math.sin(a2) * radius * 0.35);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/** Curved ribbon banner across the top of the inner circle. */
export function drawTopRibbon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  width: number,
  label: string,
) {
  const h = 52;
  const w = width;
  ctx.save();
  const grad = ctx.createLinearGradient(cx - w / 2, topY, cx + w / 2, topY);
  grad.addColorStop(0, '#d4a017');
  grad.addColorStop(0.5, PLEDGE_COLORS.gold);
  grad.addColorStop(1, '#d4a017');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, topY + h);
  ctx.lineTo(cx - w / 2 + 18, topY);
  ctx.lineTo(cx + w / 2 - 18, topY);
  ctx.lineTo(cx + w / 2, topY + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PLEDGE_COLORS.deepGreen;
  ctx.font = "800 22px 'JetBrains Mono'";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.toUpperCase(), cx, topY + h / 2 + 2);
  ctx.restore();
}

export function drawConfetti(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const colors = [PLEDGE_COLORS.gold, PLEDGE_COLORS.white, '#4ade80', '#86efac'];
  for (let i = 0; i < 36; i++) {
    const x = ((seed * (i + 1) * 7919) % 1000) / 1000 * w;
    const y = ((seed * (i + 3) * 6271) % 1000) / 1000 * h;
    const size = 4 + (i % 5);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.12 + (i % 3) * 0.06;
    ctx.beginPath();
    if (i % 2 === 0) {
      ctx.arc(x, y, size, 0, Math.PI * 2);
    } else {
      ctx.fillRect(x, y, size * 2, size);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawMedalSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const C = PLEDGE_COLORS;
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  grad.addColorStop(0, C.lightGold);
  grad.addColorStop(0.6, C.gold);
  grad.addColorStop(1, '#b8860b');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.white;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = C.deepGreen;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2);
  ctx.stroke();
  drawCheckMark(ctx, cx, cy + 2, r * 0.45);
}

function drawPalmSilhouette(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(3,47,23,0.12)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-30 * scale, -80 * scale, -60 * scale, -120 * scale);
  ctx.quadraticCurveTo(-20 * scale, -100 * scale, 0, -140 * scale);
  ctx.quadraticCurveTo(20 * scale, -100 * scale, 60 * scale, -120 * scale);
  ctx.quadraticCurveTo(30 * scale, -80 * scale, 0, 0);
  ctx.fill();
  ctx.restore();
}

function drawLandscapeSilhouette(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerR: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(5,77,37,0.08)';
  ctx.beginPath();
  ctx.moveTo(cx - innerR, cy + innerR * 0.55);
  ctx.quadraticCurveTo(cx - innerR * 0.3, cy + innerR * 0.15, cx, cy + innerR * 0.35);
  ctx.quadraticCurveTo(cx + innerR * 0.4, cy + innerR * 0.1, cx + innerR, cy + innerR * 0.5);
  ctx.lineTo(cx + innerR, cy + innerR);
  ctx.lineTo(cx - innerR, cy + innerR);
  ctx.closePath();
  ctx.fill();
  drawPalmSilhouette(ctx, cx - innerR * 0.55, cy + innerR * 0.35, 1.2);
  drawPalmSilhouette(ctx, cx + innerR * 0.55, cy + innerR * 0.35, 1.2, true);
  ctx.restore();
}

const qrCache = new Map<string, HTMLImageElement>();

export async function drawQrCode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  data: string,
) {
  let img = qrCache.get(data);
  if (!img) {
    const url = await QRCode.toDataURL(data, {
      margin: 1,
      width: size * 2,
      color: { dark: PLEDGE_COLORS.deepGreen, light: PLEDGE_COLORS.white },
    });
    img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    qrCache.set(data, img);
  }
  ctx.save();
  ctx.fillStyle = PLEDGE_COLORS.white;
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 6, size + 12, size + 12, 8);
  ctx.fill();
  ctx.strokeStyle = PLEDGE_COLORS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

export interface PledgeDrawProps {
  w: number;
  h: number;
  logo: HTMLImageElement | null;
  message: string;
  name: string;
  badgeId: string;
  achievementLevel: string;
  ambassadorTitle: string;
  dateLabel: string;
  dateStamp: string;
  cardTag: string;
  cardBrand: string;
  cardStamp: string;
  bodyFont: string;
  verifyUrl: string;
}

export async function drawPledgeBadge(ctx: CanvasRenderingContext2D, p: PledgeDrawProps) {
  const { w, h, logo, message, name, badgeId, achievementLevel, dateLabel, cardTag, cardBrand, bodyFont, verifyUrl } = p;
  const cx = w / 2;
  const cy = h / 2;
  const outerR = 500;
  const innerR = 430;
  const C = PLEDGE_COLORS;

  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.75);
  bgGrad.addColorStop(0, '#0d5c2e');
  bgGrad.addColorStop(1, C.deepGreen);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  drawConfetti(ctx, w, h, badgeId.length);

  drawStarburst(ctx, cx, cy, outerR + 40, 16, 'rgba(244,196,48,0.08)');

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(244,196,48,${0.15 - i * 0.04})`;
    ctx.lineWidth = 14 - i * 4;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 20 - i * 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 20, 0, Math.PI * 2);
  ctx.stroke();

  drawRingDots(ctx, cx, cy, outerR - 12, 32);

  const innerGrad = ctx.createRadialGradient(cx, cy - 80, 0, cx, cy, innerR);
  innerGrad.addColorStop(0, '#ffffff');
  innerGrad.addColorStop(0.25, '#edf9f1');
  innerGrad.addColorStop(0.6, '#b8e6c8');
  innerGrad.addColorStop(1, '#6ecf8a');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(11,143,60,0.25)';
  ctx.lineWidth = 3;
  ctx.stroke();

  drawLandscapeSilhouette(ctx, cx, cy, innerR);

  ctx.textAlign = 'center';

  drawTopRibbon(ctx, cx, cy - innerR + 38, innerR * 1.1, achievementLevel);

  if (logo) ctx.drawImage(logo, cx - 68, cy - 300, 136, 136);

  ctx.fillStyle = C.darkGreen;
  ctx.font = "800 42px 'JetBrains Mono'";
  ctx.fillText('LAHARIUNDO', cx, cy - 175);

  ctx.font = "600 22px 'JetBrains Mono'";
  ctx.fillStyle = C.primaryGreen;
  ctx.fillText(`— ${cardTag} —`, cx, cy - 138);

  ctx.fillStyle = C.darkGreen;
  ctx.font = `800 44px ${bodyFont}`;
  const lines = wrapMessage(ctx, message, innerR * 1.42);
  const lineHeight = 56;
  const blockHeight = lines.length * lineHeight;
  let y = cy - blockHeight / 2 + 5;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }

  if (name) {
    ctx.font = `700 36px ${bodyFont}`;
    ctx.fillStyle = C.primaryGreen;
    ctx.fillText(name, cx, y + 32);
    y += 32;
  }

  drawMedalSeal(ctx, cx, y + 78, 32);

  const qrSize = 100;
  await drawQrCode(ctx, cx - qrSize / 2, cy + innerR - 155, qrSize, verifyUrl);

  ctx.font = "600 20px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(5,77,37,0.5)';
  ctx.fillText(badgeId, cx, cy + innerR - 38);

  ctx.fillStyle = C.white;
  ctx.font = "700 26px 'JetBrains Mono'";
  ctx.fillText(cardBrand, cx, cy + innerR - 8);
  ctx.font = "500 18px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(dateLabel, cx, cy + innerR + 22);
}

export async function drawPledgeCard(ctx: CanvasRenderingContext2D, p: PledgeDrawProps) {
  const { w, h, logo, message, name, badgeId, achievementLevel, ambassadorTitle, dateLabel, dateStamp, cardTag, cardBrand, cardStamp, bodyFont, verifyUrl } = p;
  const C = PLEDGE_COLORS;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1a9f4f');
  grad.addColorStop(0.4, '#0b8f3c');
  grad.addColorStop(1, '#054d25');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawConfetti(ctx, w, h, badgeId.charCodeAt(0));

  drawStarburst(ctx, w / 2, h * 0.38, 420, 12, 'rgba(255,255,255,0.06)');

  ctx.fillStyle = C.glass;
  ctx.fillRect(0, 0, w, h);

  drawPalmSilhouette(ctx, 60, 200, 2.2);
  drawPalmSilhouette(ctx, w - 60, 200, 2.2, true);

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, w - 80, h - 80);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, w - 112, h - 112);

  ctx.textAlign = 'center';
  const logoY = 100;
  if (logo) ctx.drawImage(logo, w / 2 - 80, logoY, 160, 160);

  drawTopRibbon(ctx, w / 2, 72, 420, achievementLevel);

  ctx.fillStyle = C.white;
  ctx.font = "800 50px 'JetBrains Mono'";
  ctx.fillText('LAHARIUNDO', w / 2, logo ? 305 : 255);

  ctx.fillStyle = C.gold;
  ctx.font = "600 28px 'JetBrains Mono'";
  ctx.fillText(`— ${cardTag} —`, w / 2, logo ? 352 : 302);

  if (name) {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    const boxW = 540;
    const boxH = 108;
    const boxY = logo ? 378 : 328;
    ctx.beginPath();
    ctx.roundRect(w / 2 - boxW / 2, boxY, boxW, boxH, 18);
    ctx.fill();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = C.white;
    ctx.font = `700 46px ${bodyFont}`;
    ctx.fillText(name, w / 2, boxY + 50);
    ctx.font = `600 26px 'JetBrains Mono'`;
    ctx.fillStyle = C.lightGold;
    ctx.fillText(ambassadorTitle, w / 2, boxY + 88);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.font = "700 220px 'JetBrains Mono'";
  ctx.fillText('\u201C', 80, h / 2 - 10);
  ctx.fillText('\u201D', w - 80, h / 2 + 150);

  ctx.fillStyle = C.white;
  ctx.font = `800 54px ${bodyFont}`;
  const contentTop = name ? 510 : 400;
  const lines = wrapMessage(ctx, message, w - 160);
  const lineHeight = 72;
  const blockHeight = lines.length * lineHeight;
  let y = contentTop + Math.max(20, (h / 2 - contentTop - blockHeight) / 2);
  for (const line of lines) {
    ctx.fillText(line, w / 2, y);
    y += lineHeight;
  }

  drawMedalSeal(ctx, w / 2, y + 70, 36);

  drawStamp(ctx, w - 175, h - 300, cardStamp, dateStamp);

  const qrSize = 118;
  const qrY = h - 248;
  await drawQrCode(ctx, w / 2 - qrSize / 2, qrY, qrSize, verifyUrl);

  ctx.font = "600 20px 'JetBrains Mono'";
  ctx.fillStyle = C.mutedWhite;
  ctx.fillText(badgeId, w / 2, qrY + qrSize + 30);

  ctx.fillStyle = C.mutedWhite;
  ctx.font = "700 28px 'JetBrains Mono'";
  ctx.fillText(cardBrand, w / 2, h - 68);
  ctx.font = "500 22px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(dateLabel, w / 2, h - 34);
}
