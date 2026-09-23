interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const shareTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-5 md:p-6 mb-6 md:mb-8">
      <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4" style={{ color: 'var(--color-text)' }}>Share Analysis</h2>
      <div className="flex flex-wrap gap-2 md:gap-3">
        <a
          href={`https://wa.me/?text=${shareTitle}%20-%20${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs border border-[#cccccc] rounded hover:bg-[var(--color-accent-100)] transition-colors"
          style={{ color: 'var(--color-text)' }}
        >
          WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs border border-[#cccccc] rounded hover:bg-[var(--color-accent-100)] transition-colors"
          style={{ color: 'var(--color-text)' }}
        >
          Facebook
        </a>
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs border border-[#cccccc] rounded hover:bg-[var(--color-accent-100)] transition-colors"
          style={{ color: 'var(--color-text)' }}
        >
          X / Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs border border-[#cccccc] rounded hover:bg-[var(--color-accent-100)] transition-colors"
          style={{ color: 'var(--color-text)' }}
        >
          LinkedIn
        </a>
        <a
          href="https://www.instagram.com/traderstape"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs border border-[#cccccc] rounded hover:bg-[var(--color-accent-100)] transition-colors"
          style={{ color: 'var(--color-text)' }}
        >
          Instagram
        </a>
      </div>
    </div>
  );
}
