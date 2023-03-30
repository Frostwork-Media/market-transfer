export function getMarketBySlug(slug) {
    //if slug is a url then error
    return fetch(`https://manifold.markets/api/v0/slug/${slug}`).then(res => res.json()); 
}

