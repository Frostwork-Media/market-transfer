export function getMarketBySlug(slug) {
  console.log(`Fetching market with slug ${slug}`);
  return fetch(`https://manifold.markets/api/v0/slug/${slug}`).then(res => res.json());
}

export function getIDBySlug(slug) {
  return getMarketBySlug(slug).then(market => market.id);
}

export function placeBet(apiKey, marketID, betAmount, outcomeToBuy) {
  return fetch('https://manifold.markets/api/v0/bet', {
    cache: 'no-store',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify({
      amount: betAmount,
      outcome: outcomeToBuy,
      contractId: marketID,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(`Error placing bet: ${res.status} ${res.statusText} - ${text}`);
        });
      }
      return res.json();
    })
    .then((data) => {
      const sendTime = Date.now();

      if ('fills' in data) {
        const betTimestamp = data.fills[0].timestamp;

        // Check if the bet's timestamp is before sendTime
        if (betTimestamp < sendTime) {
          console.error('Error: Bet timestamp is before sendTime');
          console.log(data);
          throw new Error('Bet timestamp is before sendTime');
        }
      } else {
        throw new Error('No fill');
      }

      console.log('Bet response', data);

      return data;
    
    })
    .catch((error) => {
      console.error('Error placing bet:', error.message);
      throw error;
    });
}

// place bet specifically by slug

export async function placeBetBySlug(apiKey, slug, betAmount, outcomeToBuy) {
  try {
    const marketID = await getIDBySlug(slug);
    console.log(`Placing bet with on market ${marketID}`);
    await placeBet(apiKey, marketID, betAmount, outcomeToBuy);
  } catch (error) {
    console.error('Error placing bet:', error);
  }
}

const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};

export function searchMarket(searchTerm) {
  // Split search terms by space and filter out any empty strings
  const searchTerms = searchTerm.split(' ').filter(term => term.trim() !== '');

  // Check if there are multiple search terms
  const isMultipleTerms = searchTerms.length > 1;

  // Use 'term' for single term and 'terms' for multiple terms
  const queryParamKey = isMultipleTerms ? 'terms' : 'term';

  return fetch(`https://manifold.markets/api/v0/search-markets?${queryParamKey}=${searchTerm}`)
    .then(handleErrors)
    .then(res => res.json());
}

// place bet by other things

export function getGroupIDbySlug(slug) {
  return fetch(`https://manifold.markets/api/v0/group/${slug}`).then(res => res.json()).then(group => group.id);
}

export function getMarketsByGroupID(groupID) {
  return fetch(`https://manifold.markets/api/v0/group/${groupID}`).then(res => res.json());
}

