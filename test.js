import yahooFinance from "yahoo-finance2"; // ESM
yahooFinance.suppressNotices(['yahooSurvey']);

async function run() {
  // ===== Get Screeners =====
  const gainers = await yahooFinance.screener({ scrIds: "day_gainers", count: 5 });
  const losers = await yahooFinance.screener({ scrIds: "day_losers", count: 5 });
  const actives = await yahooFinance.screener({ scrIds: "most_actives", count: 5 });

  console.log("\n=== Top Gainers ===");
  console.table(gainers.quotes.map(q => ({
    Symbol: q.symbol,
    Price: q.regularMarketPrice,
    "% Change": q.regularMarketChangePercent
  })));

  console.log("\n=== Top Losers ===");
  console.table(losers.quotes.map(q => ({
    Symbol: q.symbol,
    Price: q.regularMarketPrice,
    "% Change": q.regularMarketChangePercent
  })));

  console.log("\n=== Most Active ===");
  console.table(actives.quotes.map(q => ({
    Symbol: q.symbol,
    Price: q.regularMarketPrice,
    Volume: q.regularMarketVolume
  })));

  // ===== Related News =====
  console.log("\n=== Related News ===");

  async function printNews(symbol, label) {
    const result = await yahooFinance.search(symbol); // returns news too
    if (result.news?.length) {
      console.log(`\n${label}: ${symbol}`);
      result.news.slice(0, 3).forEach((n, i) => {
        console.log(`${i + 1}. ${n.title}`);
        if (n.publisher) console.log(`   Source: ${n.publisher}`);
        if (n.summary) console.log(`   Summary: ${n.summary}`);
        console.log(`   Link: ${n.link}\n`);
      });
    } else {
      console.log(`\n${label}: ${symbol} (no news found)`);
    }
  }

  const topGainer = gainers.quotes[0]?.symbol;
  const topLoser = losers.quotes[0]?.symbol;
  const topActive = actives.quotes[0]?.symbol;

  if (topGainer) await printNews(topGainer, "Top Gainer");
  if (topLoser) await printNews(topLoser, "Top Loser");
  if (topActive) await printNews(topActive, "Most Active");
}

run();
