import { useState } from 'react';
import { Play, Film } from 'lucide-react';

interface Props {
 videoId: string;  // VERIFY_VIDEO_* = placeholder slot; real YouTube ID = facade embed
 title: string;
}

export function VideoEmbed({ videoId, title }: Props) {
 const [loaded, setLoaded] = useState(false);
 const isPlaceholder = videoId.startsWith('VERIFY_');

 // ── Placeholder slot (awaiting official video ID) ───────────────────────────
 if (isPlaceholder) {
  return (
   <div className="rounded-card border-2 border-dashed border-slate-300 bg-surface-2 p-6 text-center">
    <div className="w-12 h-12 bg-slate-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
     <Film size={22} className="text-muted" />
    </div>
    <p className="text-sm font-semibold text-secondary mb-1">{title}</p>
    <p className="text-xs text-muted leading-relaxed">
     Video slot — add official Kerala Police / Vimukthi video ID before publishing
    </p>
    <code className="mt-2 block text-[11px] font-mono text-muted bg-surface-2 rounded px-2 py-1 break-all">
     {videoId}
    </code>
   </div>
  );
 }

 // ── Pre-load facade (thumbnail + play button, no cookies) ───────────────────
 if (!loaded) {
  return (
   <div
    className="relative rounded-card overflow-hidden cursor-pointer group aspect-video bg-slate-900"
    onClick={() => setLoaded(true)}
    role="button"
    tabIndex={0}
    aria-label={`Play video: ${title}`}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLoaded(true); }}
   >
    <img
     src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
     alt={title}
     className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
    />
    {/* Play button */}
    <div className="absolute inset-0 flex items-center justify-center">
     <div className="w-16 h-16 rounded-full bg-surface/90 flex items-center justify-center group-hover:scale-105 transition-transform">
      <Play size={26} className="text-teal-700 ml-1" fill="#0f766e" />
     </div>
    </div>
    {/* Bottom gradient with title + privacy note */}
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
     <p className="text-white text-sm font-semibold leading-snug">{title}</p>
     <p className="text-white/60 text-[11px] mt-0.5">
      No tracking cookies until you click play · youtube-nocookie.com
     </p>
    </div>
   </div>
  );
 }

 // ── Loaded iframe (nocookie) ────────────────────────────────────────────────
 return (
  <div className="rounded-card overflow-hidden aspect-video bg-slate-900">
   <iframe
    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
    title={title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full"
   />
  </div>
 );
}
