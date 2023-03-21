// const apiKey = proccess.env.NEXT_PUBLIC_MANIFOLD_API_KEY
// const headers = {
//     'Authorization': 'Bearer ' + apiKey,
//     'Content-Type': 'application/json'
//   };
  
// const options = {
//     'headers': headers
// };
  

export function getMarketBySlug(slug) {
    return fetch(`https://manifold.markets/api/v0/slug/${slug}`).then(res => res.json()); 
}