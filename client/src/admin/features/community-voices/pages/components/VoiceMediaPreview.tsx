import { adminApi } from '@/admin/api/adminApi';

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (host.endsWith('youtube.com')) {
      const watchId = parsed.searchParams.get('v');
      if (watchId) return `https://www.youtube.com/embed/${watchId}`;

      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'shorts' || parts[0] === 'embed') {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isVideoAsset(path: string) {
  return /\/videos\//.test(path) || /\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(path);
}

type VoiceMediaPreviewProps = {
  alt: string;
  className: string;
  path: string;
};

export default function VoiceMediaPreview({ alt, className, path }: VoiceMediaPreviewProps) {
  const source = adminApi.publicAssetUrl(path);
  const embedUrl = youtubeEmbedUrl(source);

  if (embedUrl) {
    return (
      <iframe
        className={className}
        src={embedUrl}
        title={alt}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isVideoAsset(path)) {
    return <video className={className} src={source} muted playsInline preload="metadata" />;
  }

  return <img className={className} src={source} alt={alt} />;
}
