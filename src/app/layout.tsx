import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-accent-yellow focus:text-ink focus:p-3 focus:font-black focus:brutal-border"
        >
          Skip to main content
        </a>

        {/* Disclaimer Banner */}
        <div className="bg-accent-coral text-white text-center px-4 py-3 brutal-border-b border-b-3 border-ink">
          <p className="text-xs sm:text-sm font-black uppercase tracking-wide">
            ⚠ TradersTape is for educational purposes only. Nothing on this site is financial advice.
          </p>
        </div>

        {/* Navigation */}
        <header className="bg-accent-yellow brutal-border-b border-b-3 border-ink sticky top-0 z-40">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="font-black text-2xl uppercase tracking-tighter brutal-border px-3 py-1 bg-bg">
                TradersTape
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/stocks">Stocks</NavLink>
                <NavLink href="/crypto">Crypto</NavLink>
                <NavLink href="/forex">Forex</NavLink>
                <NavLink href="/news">News</NavLink>
                <NavLink href="/about">About</NavLink>
              </div>

              {/* Mobile Nav Toggle */}
              <details className="md:hidden relative">
                <summary className="list-none cursor-pointer brutal-border px-3 py-2 bg-bg font-black uppercase text-sm">
                  Menu
                </summary>
                <div className="absolute right-0 top-full mt-1 w-48 bg-bg brutal-border brutal-shadow z-50 flex flex-col">
                  <MobileNavLink href="/stocks">Stocks</MobileNavLink>
                  <MobileNavLink href="/crypto">Crypto</MobileNavLink>
                  <MobileNavLink href="/forex">Forex</MobileNavLink>
                  <MobileNavLink href="/news">News</MobileNavLink>
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
                <h3 className="font-black text-lg uppercase mb-3 text-accent-yellow">TradersTape</h3>
                <p className="text-sm font-bold opacity-80">
                  Market levels, forex rates, and trading news for educational purposes.
                </p>
              </div>
              <div>
                <h3 className="font-black text-lg uppercase mb-3 text-accent-yellow">Quick Links</h3>
                <ul className="space-y-2">
                  <li><FooterLink href="/stocks">Stocks & F&O</FooterLink></li>
                  <li><FooterLink href="/crypto">Crypto</FooterLink></li>
                  <li><FooterLink href="/forex">Forex</FooterLink></li>
                  <li><FooterLink href="/news">News</FooterLink></li>
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
                &copy; {new Date().getFullYear()} TradersTape. For educational purposes only.
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
      className="px-3 py-2 font-black uppercase text-sm hover:bg-ink hover:text-bg transition-colors duration-100"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 font-black uppercase text-sm brutal-border-b border-b-3 border-ink last:border-b-0 hover:bg-accent-yellow"
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
