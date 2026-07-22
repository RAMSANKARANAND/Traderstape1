import { SectionTitle, Panel, Card } from "@/components/ui";
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
      <SectionTitle className="mb-8">About TradersTape</SectionTitle>

      <div className="space-y-8">
        {/* Mission */}
        <Panel accent="pink">
          <h2 className="text-2xl font-black uppercase mb-4">Our Mission</h2>
          <p className="text-lg font-bold leading-relaxed">
            TradersTape was created to provide traders and market enthusiasts with a clean,
            no-nonsense view of key market levels across stocks, F&O, forex, and crypto.
            We curate geopolitical news that moves markets, all in one place.
          </p>
        </Panel>

        {/* What We Cover */}
        <div>
          <h2 className="text-xl font-black uppercase mb-4">What We Cover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card accent="blue">
              <h3 className="font-black uppercase mb-2">📈 Stocks & F&O</h3>
              <p className="text-sm font-bold">
                Key support and resistance levels for Nifty, Bank Nifty, and major stocks.
                Futures and options data for educational analysis.
              </p>
            </Card>
            <Card accent="teal">
              <h3 className="font-black uppercase mb-2">💱 Forex</h3>
              <p className="text-sm font-bold">
                Major currency pair levels including EUR/USD, GBP/USD, USD/JPY, and more.
                Technical analysis for educational purposes.
              </p>
            </Card>
            <Card accent="yellow">
              <h3 className="font-black uppercase mb-2">₿ Crypto</h3>
              <p className="text-sm font-bold">
                Bitcoin, Ethereum, and altcoin market levels and analysis.
                Track the volatile crypto markets.
              </p>
            </Card>
            <Card accent="coral">
              <h3 className="font-black uppercase mb-2">🌍 Geopolitical News</h3>
              <p className="text-sm font-bold">
                Curated news on geopolitical events that impact global markets.
                Stay informed on what moves the markets.
              </p>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-accent-coral brutal-border brutal-shadow p-8">
          <h2 className="text-2xl font-black uppercase mb-4 text-white">⚠ Important Disclaimer</h2>
          <div className="space-y-4 text-white font-bold">
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
          <h2 className="text-xl font-black uppercase mb-2">Get In Touch</h2>
          <p className="font-bold opacity-70">
            Have questions or feedback? Reach out to us at{" "}
            <a href="mailto:hello@traderstape.com" className="underline hover:text-accent-coral">
              hello@traderstape.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}