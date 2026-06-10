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
  ctx.font = "700 18px 'JetBrains Mono'";
  const tw = ctx.measureText(label).width;
  const pw = tw + 36;
  const ph = 34;
  ctx.fillStyle = PLEDGE_COLORS.gold;
  ctx.beginPath();
  ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
  ctx.fill();
  ctx.fillStyle = PLEDGE_COLORS.deepGreen;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.toUpperCase(), cx, cy);
  ctx.textBaseline = 'alphabetic';
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

  ctx.fillStyle = C.deepGreen;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = C.darkGreen;
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 18, 0, Math.PI * 2);
  ctx.stroke();

  drawRingDots(ctx, cx, cy, outerR - 10, 24);

  const innerGrad = ctx.createRadialGradient(cx, cy - 50, 0, cx, cy, innerR);
  innerGrad.addColorStop(0, '#edf9f1');
  innerGrad.addColorStop(0.35, '#c8ecd6');
  innerGrad.addColorStop(0.75, '#8fd4a8');
  innerGrad.addColorStop(1, '#5cb87a');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fill();

  drawLandscapeSilhouette(ctx, cx, cy, innerR);

  ctx.textAlign = 'center';

  if (logo) ctx.drawImage(logo, cx - 72, cy - 355, 144, 144);

  ctx.fillStyle = C.darkGreen;
  ctx.font = "800 46px 'JetBrains Mono'";
  ctx.fillText('LAHARIUNDO', cx, cy - 195);

  ctx.font = "600 24px 'JetBrains Mono'";
  ctx.fillStyle = C.primaryGreen;
  ctx.fillText(`— ${cardTag} —`, cx, cy - 152);

  ctx.strokeStyle = C.primaryGreen;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 90, cy - 132);
  ctx.lineTo(cx + 90, cy - 132);
  ctx.stroke();

  ctx.fillStyle = C.darkGreen;
  ctx.font = `700 46px ${bodyFont}`;
  const lines = wrapMessage(ctx, message, innerR * 1.45);
  const lineHeight = 58;
  const blockHeight = lines.length * lineHeight;
  let y = cy - blockHeight / 2 - 10;
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineHeight;
  }

  if (name) {
    ctx.font = `700 38px ${bodyFont}`;
    ctx.fillStyle = C.primaryGreen;
    ctx.fillText(name, cx, y + 28);
    y += 28;
  }

  ctx.font = "600 22px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(5,77,37,0.55)';
  ctx.fillText(badgeId, cx, y + 58);

  drawAchievementPill(ctx, cx, y + 98, achievementLevel);

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, y + 158, 26, 0, Math.PI * 2);
  ctx.stroke();
  drawCheckMark(ctx, cx, y + 158, 16);

  const qrSize = 96;
  await drawQrCode(ctx, cx - qrSize / 2, cy + innerR - 148, qrSize, verifyUrl);

  ctx.fillStyle = C.white;
  ctx.font = "600 24px 'JetBrains Mono'";
  ctx.fillText(cardBrand, cx, cy + innerR - 28);
  ctx.font = "500 20px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(5,77,37,0.6)';
  ctx.fillText(dateLabel, cx, cy + innerR + 8);
}

export async function drawPledgeCard(ctx: CanvasRenderingContext2D, p: PledgeDrawProps) {
  const { w, h, logo, message, name, badgeId, ambassadorTitle, dateLabel, dateStamp, cardTag, cardBrand, cardStamp, bodyFont, verifyUrl } = p;
  const C = PLEDGE_COLORS;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#138f45');
  grad.addColorStop(0.55, '#0b8f3c');
  grad.addColorStop(1, '#0b6f34');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = C.glass;
  ctx.fillRect(0, 0, w, h);

  drawPalmSilhouette(ctx, 60, 200, 2.2);
  drawPalmSilhouette(ctx, w - 60, 200, 2.2, true);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.arc(w - 80, 220, 320, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, h - 180, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 5;
  ctx.strokeRect(44, 44, w - 88, h - 88);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(58, 58, w - 116, h - 116);

  ctx.textAlign = 'center';
  const logoY = 110;
  if (logo) ctx.drawImage(logo, w / 2 - 78, logoY, 156, 156);

  ctx.fillStyle = C.white;
  ctx.font = "800 48px 'JetBrains Mono'";
  ctx.fillText('LAHARIUNDO', w / 2, logo ? 310 : 260);

  ctx.fillStyle = C.gold;
  ctx.font = "600 26px 'JetBrains Mono'";
  ctx.fillText(`— ${cardTag} —`, w / 2, logo ? 358 : 308);

  if (name) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    const boxW = 520;
    const boxH = 100;
    const boxY = logo ? 390 : 340;
    ctx.beginPath();
    ctx.roundRect(w / 2 - boxW / 2, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(244,196,48,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = C.white;
    ctx.font = `700 44px ${bodyFont}`;
    ctx.fillText(name, w / 2, boxY + 48);
    ctx.font = `600 24px 'JetBrains Mono'`;
    ctx.fillStyle = C.lightGold;
    ctx.fillText(ambassadorTitle, w / 2, boxY + 82);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.font = "700 200px 'JetBrains Mono'";
  ctx.fillText('\u201C', 90, h / 2 - 20);
  ctx.fillText('\u201D', w - 90, h / 2 + 140);

  ctx.fillStyle = C.white;
  ctx.font = `700 56px ${bodyFont}`;
  const contentTop = name ? 520 : 420;
  const lines = wrapMessage(ctx, message, w - 180);
  const lineHeight = 76;
  const blockHeight = lines.length * lineHeight;
  let y = contentTop + (h / 2 - contentTop - blockHeight) / 2 + 40;
  for (const line of lines) {
    ctx.fillText(line, w / 2, y);
    y += lineHeight;
  }

  drawStamp(ctx, w - 170, h - 280, cardStamp, dateStamp);

  const qrSize = 110;
  const qrX = w / 2 - qrSize / 2;
  const qrY = h - 230;
  await drawQrCode(ctx, qrX, qrY, qrSize, verifyUrl);

  ctx.font = "500 18px 'JetBrains Mono'";
  ctx.fillStyle = C.mutedWhite;
  ctx.fillText(badgeId, w / 2, qrY + qrSize + 28);

  ctx.fillStyle = C.mutedWhite;
  ctx.font = "600 26px 'JetBrains Mono'";
  ctx.fillText(cardBrand, w / 2, h - 72);
  ctx.font = "500 22px 'JetBrains Mono'";
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(dateLabel, w / 2, h - 38);
}
