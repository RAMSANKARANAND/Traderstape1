const symbols = [
  // First set: CNX prefixed
  { symbol: "^CNXAUTO", name: "AUTO" },
  { symbol: "^CNXIT", name: "IT" },
  { symbol: "^CNXPHARMA", name: "PHARMA" },
];

async function testSymbolDetailed(symbolObj) {
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
    // Return raw data for inspection
    return { 
      symbol, 
      name, 
      success: true, 
      raw: data 
    };
  } catch (error) {
    return { symbol, name, success: false, error: error.message };
  }
}

async function testDetailed() {
  console.log("Testing sector symbols in detail...\n");
  
  for (const symbolObj of symbols) {
    const result = await testSymbolDetailed(symbolObj);
    
    if (result.success) {
      console.log(`=== ${result.symbol} (${result.name}) ===`);
      console.log(JSON.stringify(result.raw, null, 2));
      console.log('\n');
    } else {
      console.log(`❌ ${result.symbol} (${result.name}): ${result.error}\n`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testDetailed();