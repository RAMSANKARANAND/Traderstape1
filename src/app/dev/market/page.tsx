import { type MarketQuote } from "@/lib/market/types";

export const dynamic = "force-dynamic";

async function getQuotes(): Promise<MarketQuote[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/market`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = (await res.json()) as { success?: boolean; quotes?: MarketQuote[] };
  return data.quotes ?? [];
}

export default async function DevMarketPage() {
  const quotes = await getQuotes();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black uppercase mb-6">Dev Market Test</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-3 border-ink">
            <th className="py-2 px-3 font-black uppercase text-sm">Symbol</th>
            <th className="py-2 px-3 font-black uppercase text-sm">Name</th>
            <th className="py-2 px-3 font-black uppercase text-sm">Price</th>
            <th className="py-2 px-3 font-black uppercase text-sm">Change</th>
            <th className="py-2 px-3 font-black uppercase text-sm">Change %</th>
            <th className="py-2 px-3 font-black uppercase text-sm">Direction</th>
            <th className="py-2 px-3 font-black uppercase text-sm">Updated Time</th>
          </tr>
        </thead>
        <tbody>
          {quotes.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-6 font-bold opacity-60">
                No quotes available.
              </td>
            </tr>
          ) : (
            quotes.map((q) => (
              <tr key={q.symbol} className="border-b border-ink/20">
                <td className="py-2 px-3 font-black">{q.symbol}</td>
                <td className="py-2 px-3 font-bold">{q.name}</td>
                <td className="py-2 px-3 font-bold tabular-nums">{q.price}</td>
                <td className="py-2 px-3 font-bold tabular-nums">{q.change}</td>
                <td className="py-2 px-3 font-bold tabular-nums">{q.changePercent}</td>
                <td className="py-2 px-3 font-black uppercase">{q.direction}</td>
                <td className="py-2 px-3 text-xs font-bold opacity-70">{new Date(q.updatedAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}