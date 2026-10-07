type P = { className?: string; style?: React.CSSProperties };

export function InstagramIcon({ className, style }: P) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon({ className, style }: P) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.3.1-.2 0-.3 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1 2.8c.2.1 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

export function FacebookIcon({ className, style }: P) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V12H7.5v3H10v7h3v-7h2.6l.4-3h-3V9.7c0-.4.3-.7.5-.7z" />
    </svg>
  );
}
