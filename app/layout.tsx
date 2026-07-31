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
        <header className="bg-[#F4F5F6] border-b-[4px] border-black sticky top-0 z-40 h-[72px] flex items-center">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" aria-label="Main navigation">
            <div className="flex items-center justify-between h-full">
              <Link href="/" className="font-black text-2xl uppercase tracking-tighter brutal-border px-3 py-1 bg-white hover:bg-ink hover:text-white transition-colors duration-100">
                TradersTape
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
                <summary className="list-none cursor-pointer brutal-border px-3 py-2 bg-bg font-black uppercase text-sm">
                  Menu
                </summary>
                <div className="absolute right-0 top-full mt-1 w-48 bg-bg brutal-border brutal-shadow z-50 flex flex-col">
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
                <h3 className="font-black text-lg uppercase mb-3 text-accent-yellow">TradersTape</h3>
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
      className="relative px-1 py-2 font-black uppercase text-sm text-ink transition-colors duration-200 group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-full h-1 bg-ink transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
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
