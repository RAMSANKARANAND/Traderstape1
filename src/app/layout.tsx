import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import WelcomeDisclaimerModal from "@/components/WelcomeDisclaimerModal";

export const metadata: Metadata = {
  title: {
    default: "TradersTape — Market Levels & Trading News",
    template: "%s | TradersTape",
  },
  description:
    "TradersTape covers stock F&O levels, forex levels, and geopolitical trading news. For educational purposes only.",
  openGraph: {
    title: "TradersTape — Market Levels & Trading News",
    description:
      "TradersTape covers stock F&O levels, forex levels, and geopolitical trading news. For educational purposes only.",
    siteName: "TradersTape",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradersTape — Market Levels & Trading News",
    description:
      "TradersTape covers stock F&O levels, forex levels, and geopolitical trading news. For educational purposes only.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-180.png",
    apple: "/favicon-180.png",
    other: {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      url: "/favicon-192.png",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-accent-yellow focus:text-ink focus:p-3 focus:font-black focus:brutal-border"
        >
          Skip to main content
        </a>

        <WelcomeDisclaimerModal />

        {/* Navigation */}
        <header className="border-b-[3px] border-[var(--ng-gold)] sticky top-0 z-40 h-[72px] flex items-center" style={{ background: 'var(--ng-navy)' }}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" aria-label="Main navigation">
            <div className="flex items-center justify-between h-full">
              <Link href="/" className="px-3 py-1 transition-colors duration-100 focus:outline-none" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 500 }}>
                    <span style={{ color: '#ffffff' }}>trader</span>
                    <span style={{ color: 'var(--ng-gold)' }}>stape</span>
                  </span>
                  <span style={{ color: '#e8c766', fontSize: '13px', fontWeight: 500 }}>™</span>
                </span>
                <div className="logo-candles" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
                  <div className="candle-1" style={{ width: '3px', borderRadius: '1px', background: '#4ade80' }}></div>
                  <div className="candle-2" style={{ width: '3px', borderRadius: '1px', background: '#f87171' }}></div>
                  <div className="candle-3" style={{ width: '3px', borderRadius: '1px', background: '#4ade80' }}></div>
                  <div className="candle-4" style={{ width: '3px', borderRadius: '1px', background: '#f87171' }}></div>
                </div>
                <div style={{ position: 'relative', width: '12px', height: '14px' }}>
                  <span className="logo-arrow-up" style={{ position: 'absolute', inset: 0, color: '#4ade80', fontSize: '12px' }}>▲</span>
                  <span className="logo-arrow-down" style={{ position: 'absolute', inset: 0, color: '#f87171', fontSize: '12px' }}>▼</span>
                </div>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-6">
                <NavLink href="/the-tape">The Tape</NavLink>
                <NavLink href="/news">News</NavLink>
                <NavLink href="/tape-views">Tape Views</NavLink>
                <NavLink href="/about">About</NavLink>
              </div>

              {/* Mobile Nav Toggle */}
              <details className="md:hidden relative">
                <summary className="list-none cursor-pointer brutal-border px-3 py-2 font-black uppercase text-sm text-white" style={{ background: 'var(--ng-navy)' }}>
                  Menu
                </summary>
                <div className="absolute right-0 top-full mt-1 w-48 brutal-border brutal-shadow z-50 flex flex-col" style={{ background: 'var(--ng-navy)', borderColor: 'var(--ng-gold)' }}>
                  <MobileNavLink href="/the-tape">The Tape</MobileNavLink>
                  <MobileNavLink href="/news">News</MobileNavLink>
                  <MobileNavLink href="/tape-views">Tape Views</MobileNavLink>
                  <MobileNavLink href="/about">About</MobileNavLink>
                </div>
              </details>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-ink text-bg brutal-border-t border-t-3 border-ink mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-black text-lg uppercase mb-3" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 500 }}>
                      <span style={{ color: '#ffffff' }}>trader</span>
                      <span style={{ color: 'var(--ng-gold)' }}>stape</span>
                    </span>
                    <span style={{ color: '#e8c766', fontSize: '13px', fontWeight: 500 }}>™</span>
                  </span>
                  <div className="logo-candles" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
                    <div className="candle-1" style={{ width: '3px', borderRadius: '1px', background: '#4ade80' }}></div>
                    <div className="candle-2" style={{ width: '3px', borderRadius: '1px', background: '#f87171' }}></div>
                    <div className="candle-3" style={{ width: '3px', borderRadius: '1px', background: '#4ade80' }}></div>
                    <div className="candle-4" style={{ width: '3px', borderRadius: '1px', background: '#f87171' }}></div>
                  </div>
                  <div style={{ position: 'relative', width: '12px', height: '14px' }}>
                    <span className="logo-arrow-up" style={{ position: 'absolute', inset: 0, color: '#4ade80', fontSize: '12px' }}>▲</span>
                    <span className="logo-arrow-down" style={{ position: 'absolute', inset: 0, color: '#f87171', fontSize: '12px' }}>▼</span>
                  </div>
                </h3>
                <p className="text-sm font-bold opacity-80">
                  Market levels, forex rates, and trading news for educational purposes.
                </p>
              </div>
              <div>
                <h3 className="font-black text-lg uppercase mb-3 text-accent-yellow">Quick Links</h3>
                <ul className="space-y-2">
                  <li><FooterLink href="/the-tape">The Tape</FooterLink></li>
                  <li><FooterLink href="/news">News</FooterLink></li>
                  <li><FooterLink href="/tape-views">Tape Views</FooterLink></li>
                  <li><FooterLink href="/about">About</FooterLink></li>
                </ul>
              </div>
              <div>
                <h3 className="font-black text-lg uppercase mb-3 text-accent-yellow">Disclaimer</h3>
                <p className="text-xs font-bold opacity-80 leading-relaxed">
                  TradersTape is for educational purposes only. Nothing on this site is financial advice.
                  Always do your own research before making investment decisions. Past performance is not
                  indicative of future results.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 brutal-border-t border-t-3 border-bg/20 text-center">
              <p className="text-xs font-bold opacity-60">
                &copy; 2026 TradersTape. For educational purposes only.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative px-1 py-2 font-black uppercase text-sm text-white transition-colors duration-200 group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-full h-1 bg-[var(--ng-gold)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 font-black uppercase text-sm brutal-border-b border-b-3 border-[var(--ng-gold)] last:border-b-0 text-white hover:bg-[var(--ng-gold)] hover:text-[var(--ng-navy)]"
    >
      {children}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-bold hover:text-accent-yellow transition-colors duration-100"
    >
      {children}
    </Link>
  );
}
