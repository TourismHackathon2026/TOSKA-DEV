import { MapPin, ExternalLink } from 'lucide-react';

function extractLocationData(text) {
  const sourceText = String(text || '');
  const googleMatch = sourceText.match(/https?:\/\/(?:www\.)?(?:maps\.google\.[a-z.]+|google\.[a-z.]+\/maps)\S+/i);

  if (googleMatch) {
    const sourceUrl = googleMatch[0].replace(/[).,;]+$/, '');
    try {
      const parsedUrl = new URL(sourceUrl);
      parsedUrl.searchParams.set('output', 'embed');
      return { sourceUrl, embedUrl: parsedUrl.toString() };
    } catch (error) {
      return { sourceUrl, embedUrl: sourceUrl };
    }
  }

  const coordinateMatch = sourceText.match(/([-+]?\d{1,3}(?:\.\d+)?)\s*,\s*([-+]?\d{1,3}(?:\.\d+)?)/);
  if (coordinateMatch) {
    const lat = coordinateMatch[1];
    const lng = coordinateMatch[2];
    const sourceUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return { sourceUrl, embedUrl: `${sourceUrl}&output=embed` };
  }

  return null;
}

export default function LocationMapPreview({ text, title = 'Shared location' }) {
  const locationData = extractLocationData(text);

  if (!locationData?.embedUrl) {
    return null;
  }

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00965E]">
          <MapPin className="h-3.5 w-3.5" />
          {title}
        </span>
        <a
          href={locationData.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00965E]"
        >
          Open map <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          title={title}
          src={locationData.embedUrl}
          className="h-36 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
