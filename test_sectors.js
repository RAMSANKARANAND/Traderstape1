const symbols = [
  // First set: CNX prefixed
  { symbol: "^CNXAUTO", name: "AUTO" },
  { symbol: "^CNXIT", name: "IT" },
  { symbol: "^CNXPHARMA", name: "PHARMA" },
  { symbol: "^CNXFMCG", name: "FMCG" },
  { symbol: "^CNXMETAL", name: "METAL" },
  { symbol: "^CNXENERGY", name: "ENERGY" },
  { symbol: "^CNXREALTY", name: "REALTY" },
  { symbol: "^CNXPSE", name: "PSE" },
  { symbol: "^CNXMEDIA", name: "MEDIA" },
  { symbol: "^CNXBANK", name: "BANK" },
  
  // Second set: NIFTY prefixed
  { symbol: "^NIFTYAUTO", name: "NIFTY AUTO" },
  { symbol: "^NIFTYIT", name: "NIFTY IT" },
  { symbol: "^NIFTYPHARMA", name: "NIFTY PHARMA" },
  { symbol: "^NIFTYFMCG", name: "NIFTY FMCG" },
  { symbol: "^NIFTYMETAL", name: "NIFTY METAL" },
  { symbol: "^NIFTYENERGY", name: "NIFTY ENERGY" },
  { symbol: "^NIFTYREALTY", name: "NIFTY REALTY" },
  { symbol: "^NIFTYMEDIA", name: "NIFTY MEDIA" },
  { symbol: "^NIFTYPSUBANK", name: "NIFTY PSU BANK" },
  { symbol: "^NIFTYBANK", name: "NIFTY BANK" } // This might duplicate ^NSEBANK
];

async function testSymbol(symbolObj) {
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
    if (price === 0) {
      return { symbol, name, success: false, error: "Price is 0" };
    }
    
    return { 
      symbol, 
      name, 
      success: true, 
      price: Number(price.toFixed(2)),
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: meta.previousClose !== 0 ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 : 0
    };
  } catch (error) {
    return { symbol, name, success: false, error: error.message };
  }
}

async function testAllSymbols() {
  console.log("Testing sector symbols...\n");
  
  const results = [];
  for (const symbolObj of symbols) {
    const result = await testSymbol(symbolObj);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.symbol} (${result.name}): $${result.price.toFixed(2)} (${result.changePercent >= 0 ? '+' : ''}${result.changePercent.toFixed(2)}%)`);
    } else {
      console.log(`❌ ${result.symbol} (${result.name}): ${result.error}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Successful: ${successful.length}/${symbols.length}`);
  console.log(`Failed: ${failed.length}/${symbols.length}`);
  
  if (successful.length > 0) {
    console.log(`\nSuccessful symbols:`);
    successful.forEach(s => {
      console.log(`  ${s.symbol} (${s.name})`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\nFailed symbols:`);
    failed.forEach(f => {
      console.log(`  ${f.symbol} (${f.name}): ${f.error}`);
    });
  }
}

testAllSymbols();