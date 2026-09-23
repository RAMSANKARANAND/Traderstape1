// Test script to verify real Yahoo Finance data for sector symbols
const symbols = [
  { symbol: "^CNXAUTO", name: "AUTO" },
  { symbol: "^CNXIT", name: "IT" },
  { symbol: "^CNXPHARMA", name: "PHARMA" },
  { symbol: "^CNXFMCG", name: "FMCG" },
  { symbol: "^CNXMETAL", name: "METAL" },
  { symbol: "^CNXENERGY", name: "ENERGY" },
  { symbol: "^CNXREALTY", name: "REALTY" },
  { symbol: "^CNXPSE", name: "PSE" },
  { symbol: "^CNXMEDIA", name: "MEDIA" }
];

async function fetchQuote(symbolObj) {
  const { symbol, name } = symbolObj;
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TradersTape/1.0)",
      },
    });
    
    if (!response.ok) {
      return { symbol, name, success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    
    if (!result) {
      return { symbol, name, success: false, error: "No data in response" };
    }
    
    const meta = result.meta;
    if (!meta) {
      return { symbol, name, success: false, error: "No meta data" };
    }
    
    const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? ((change / previousClose) * 100) : 0;
    
    return { 
      symbol, 
      name, 
      success: true, 
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2))
    };
  } catch (error) {
    return { symbol, name, success: false, error: error.message };
  }
}

async function testAll() {
  console.log("=== REAL YAHOO FINANCE DATA FOR SECTOR SYMBOLS ===\n");
  
  const results = [];
  for (const symbolObj of symbols) {
    const result = await fetchQuote(symbolObj);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.symbol} (${result.name}):`);
      console.log(`   Price: ₹${result.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
      console.log(`   Change: ${result.change >= 0 ? '+' : ''}${result.change.toFixed(2)} (${result.changePercent >= 0 ? '+' : ''}${result.changePercent.toFixed(2)}%)`);
      console.log(`   Previous Close: ₹${result.previousClose.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`);
    } else {
      console.log(`❌ ${result.symbol} (${result.name}): ${result.error}\n`);
    }
    
    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  const successful = results.filter(r => r.success);
  console.log(`=== SUMMARY: ${successful.length}/${symbols.length} symbols returned valid data ===\n`);
  
  if (successful.length === symbols.length) {
    console.log("🎉 ALL SECTOR SYMBOLS RETURNING VALID DATA FROM YAHOO FINANCE");
  } else {
    console.log("⚠️  Some symbols failed - check above for details");
  }
}

testAll();