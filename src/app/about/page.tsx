import { SectionTitle } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "TradersTape provides market levels, forex rates, and trading news for educational purposes. Learn more about our mission.",
  openGraph: {
    title: "About TradersTape",
    description: "TradersTape provides market levels, forex rates, and trading news for educational purposes.",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-8" style={{ color: 'var(--color-text)' }}>About TradersTape</SectionTitle>

      <div className="space-y-8">
        {/* Mission */}
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-6">
  <h2 className="text-2xl font-black uppercase mb-4" style={{ color: 'var(--color-text)' }}>Our Mission</h2>
  <p className="text-lg font-bold leading-relaxed" style={{ color: 'var(--color-text)' }}>
    TradersTape exists to make market information clear, structured, and genuinely useful for learning — not to sell signals or promise returns. We bring together live market levels, curated financial news, and educational market commentary in one place, so traders and market enthusiasts can build real understanding of how markets move, without noise or hype.
  </p>
  <p className="mt-4 font-bold text-sm uppercase tracking-wide" style={{ color: 'var(--color-neutral-600)' }}>
    Tracking 30+ instruments across Indian and global markets, updated live.
  </p>
</div>

        {/* What We Cover */}
        <div>
          <h2 className="text-xl font-black uppercase mb-4" style={{ color: 'var(--color-text)' }}>What We Cover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-5">
  <h3 className="font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>📈 Stocks & F&O</h3>
  <p className="text-sm font-bold" style={{ color: 'var(--color-neutral-600)' }}>
    Support/resistance levels for Nifty, Bank Nifty, and major stocks. Futures and options data explained for learning purposes.
  </p>
</div>
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-5">
  <h3 className="font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>💱 Forex</h3>
  <p className="text-sm font-bold" style={{ color: 'var(--color-neutral-600)' }}>
    Key currency pair levels including EUR/USD, GBP/USD, USD/JPY, and more, with technical context for educational study.
  </p>
</div>
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-5">
  <h3 className="font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>🪙 Metals</h3>
  <p className="text-sm font-bold" style={{ color: 'var(--color-neutral-600)' }}>
    Gold and Silver price levels and trends, tracked for educational commodity market analysis.
  </p>
</div>
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-5">
  <h3 className="font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>₿ Crypto</h3>
  <p className="text-sm font-bold" style={{ color: 'var(--color-neutral-600)' }}>
    Bitcoin, Ethereum, and altcoin market data and analysis, tracking volatile crypto markets for informational purposes.
  </p>
</div>
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-5">
  <h3 className="font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>🌍 Geopolitical News</h3>
  <p className="text-sm font-bold" style={{ color: 'var(--color-neutral-600)' }}>
    Curated coverage of global events that move markets, helping you understand the "why" behind price action.
  </p>
</div>
          </div>
        </div>

        {/* How It Works */}
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-6">
  <h2 className="text-2xl font-black uppercase mb-4" style={{ color: 'var(--color-text)' }}>How It Works</h2>
  <p className="text-lg font-bold leading-relaxed" style={{ color: 'var(--color-text)' }}>
    Our market data is sourced from live financial APIs including Yahoo Finance and CoinGecko, updated continuously throughout the trading day. Our news coverage combines curated official releases from sources like the Reserve Bank of India, SEBI, the U.S. Federal Reserve, and the European Central Bank — summarized with AI assistance to keep you informed quickly, while always linking back to original sources for full context.
  </p>
</div>

        {/* Disclaimer */}
<div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-8">
  <h2 className="text-2xl font-black uppercase mb-4" style={{ color: 'var(--color-text)' }}>⚠ Important Disclaimer</h2>
  <div className="space-y-4 font-bold" style={{ color: 'var(--color-text)' }}>
    <p>
      TradersTape is for <strong>educational purposes only</strong>. Nothing on this site
      constitutes financial advice, investment recommendation, or solicitation to trade.
    </p>
    <p>
      All content, including market levels, analysis, and news, is provided for informational
      and educational purposes. We do not guarantee the accuracy, completeness, or timeliness
      of any information presented.
    </p>
    <p>
      Trading in financial markets involves substantial risk of loss. Past performance is not
      indicative of future results. Always conduct your own research and consult with a
      licensed financial advisor before making any investment decisions.
    </p>
    <p className="text-lg font-black uppercase">
      Never trade with money you cannot afford to lose.
    </p>
  </div>
</div>

        {/* Contact */}
<div className="text-center py-8">
  <h2 className="text-xl font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>Get In Touch</h2>
  <p className="font-bold opacity-70" style={{ color: 'var(--color-neutral-600)' }}>
    Have questions or feedback? Reach out to us at{" "}
    <a href="mailto:hello@traderstape.com" className="underline hover:text-[var(--color-accent-700)] transition-colors duration-100" style={{ color: 'var(--color-accent-700)' }}>
      hello@traderstape.com
    </a>
  </p>
</div>
      </div>
    </div>
  );
}
