export function getMarketBySlug(slug) {
  console.log(`Fetching market with slug ${slug}`);
  return fetch(`https://manifold.markets/api/v0/slug/${slug}`).then(res => res.json());
}

export function getIDBySlug(slug) {
  return getMarketBySlug(slug).then(market => market.id);
}

export function placeBet(apiKey, marketID, betAmount, outcomeToBuy){
  return fetch('/api/placeBet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey, marketID, betAmount, outcomeToBuy }),
  });
};

// place bet specifically by slug

export async function placeBetBySlug(apiKey, slug, betAmount, outcomeToBuy) {
  const marketID = await getIDBySlug(slug);
  console.log(`marketID is ${marketID}`);
  await placeBet(apiKey, marketID, betAmount, outcomeToBuy);
}

// place bet by other things

export function getGroupBySlug(slug) {
  return fetch(`https://manifold.markets/api/v0/group/${slug}`).then(res => res.json()).then(group => group.id);
}

export function getMarketsByGroupID(groupID) {
  return fetch(`https://manifold.markets/api/v0/group/${groupID}`).then(res => res.json());
}

