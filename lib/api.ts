export function getMarketBySlug(slug) {
    console.log(`Fetching market with slug ${slug}`);
    return fetch(`https://manifold.markets/api/v0/slug/${slug}`).then(res => res.json()); 
}

export function getIDBySlug(slug) {
    return  getMarketBySlug(slug).then(market => market.id);
}

const placeBet = (apiKey, marketID, betAmount, outcomeToBuy) => {
    return fetch('/placeBet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey, marketID, betAmount, outcomeToBuy }),
    });
  };

export async function placeBetBySlug(apiKey, slug, betAmount, outcomeToBuy) {
    const marketID = await getIDBySlug(slug);
    console.log(`marketID is ${marketID}`);
    await placeBet(apiKey, marketID, betAmount, outcomeToBuy);
}
