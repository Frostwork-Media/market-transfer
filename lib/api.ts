import { Question, Question_aggregator } from "@prisma/client";
import { validateEntries } from "./utils";
import { UserQuestionDatum } from "./types";

export type Market = {
  aggregator: Question_aggregator;
  externalId: string;
  slugOrId: string;
  title: string;
  url: string;
  buyYes: number;
  buyNo: number;
}

export async function getManifoldMarketBySlug(userSlug: string): Promise<Market> {
  const manifoldData = await (await fetch(`https://manifold.markets/api/v0/slug/${userSlug}`)).json()
  const { id, slug, question, url, probability } = manifoldData;
  return {
    aggregator: Question_aggregator.MANIFOLD,
    externalId: id,
    slugOrId: slug,
    title: question,
    url,
    buyYes: probability,
    buyNo: 1 - probability,
  };
}

export async function getInsightMarketByMarketId(marketId): Promise<Market> {
  const chartData = await fetch(`/api/insight-markets`, {
    method: 'POST',
    body: JSON.stringify({ marketId }),
  })
  if (!chartData.ok) {
    throw new Error(`Error fetching chart data: ${chartData.status} ${chartData.statusText}`);
  }

  const { title, buyYes, buyNo } = await chartData.json();
  
  // get the order book for this (market,choice,NO) triple
  
  return {
    aggregator: Question_aggregator.INSIGHT,
    externalId: marketId,
    slugOrId: marketId,
    title,
    url: `https://insightprediction.com/m/${marketId}`,
    buyYes,
    buyNo,
  };
}

export async function getPolymarketMarketByMarketSlug(conditionId: string): Promise<Market> {
  const marketData = await fetch(`/api/polymarket`, {
    method: 'POST',
    body: JSON.stringify({ conditionId }),
  })
  if (!marketData.ok) {
    throw new Error(`Error fetching chart data: ${marketData.status} ${marketData.statusText}`);
  }

  const { title, slug, buyYes, buyNo } = await marketData.json();
    
  return {
    aggregator: Question_aggregator.POLYMARKET,
    externalId: conditionId,
    slugOrId: slug,
    title,
    url: `https://polymarket.com/event/${slug}`,
    buyYes,
    buyNo,
  };
}

export function getMarketByUrl(url) {
  console.log(`Fetching market with url ${url}`);
  return getManifoldMarketBySlug(url.split('/').pop());
}

export function getIDBySlug(slug) {
  return getManifoldMarketBySlug(slug).then(market => market.externalId);
}

export function placeBet(apiKey, marketID, betAmount, outcomeToBuy) {
  return fetch('/api/placeBet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey, marketID, betAmount, outcomeToBuy }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(`Error placing bet: ${res.status} ${res.statusText} - ${text}`);
        });
      }
      return res.json();
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

export async function sendQuestionsToDatabase(questionData: UserQuestionDatum[]) {
  return fetch('/api/add-to-db',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  })
    .then((res) => {
      return res.json();
    })
    .catch((error) => {
      console.error('Error adding question to database:', error.message);
      throw error;
    });
}

export function getQuestionsFromDatabase() {
  console.log('Getting questions from database');
  return fetch('/api/get-from-db', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(res => {
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    //parse this json
    return res;
  })
  .catch(error => {
    console.error('Error fetching questions from database:', error.message);
    throw error;
  });
}

export async function setManifoldApiKey(apiKey: string){
  if(typeof window === 'undefined') return console.error('No window object found')
  return window.localStorage.setItem('manifold-api-key', apiKey)
}

export function getManifoldApiKey(){
  if(typeof window === 'undefined') return console.error('No window object found')
  return window.localStorage.getItem('manifold-api-key')
}

export function setProcessedDataStore(data){
  if(typeof window === 'undefined') return console.error('No window object found')

  // do validation here

  return window.localStorage.setItem('processed-data', JSON.stringify(data))
}

export function getProcessedDataStore(){
  if(typeof window === 'undefined') return console.error('No window object found')
  let data = JSON.parse(window.localStorage.getItem('processed-data'))

  // do validation here

  return data
}

export function deleteProcessedDataStore(){
  if(typeof window === 'undefined') return console.error('No window object found')
  return window.localStorage.removeItem('processed-data')
}

export function setUserDataStore(data){
  if(typeof window === 'undefined') return console.error('No window object found') 

  return window.localStorage.setItem('user-data', JSON.stringify(data))
}

export function getUserDataStore(){
  if(typeof window === 'undefined') return console.error('No window object found')
  const data = JSON.parse(window.localStorage.getItem('user-data'))

  const validatedData = validateEntries(data);

  console.log("validated data:", validatedData);

  return validatedData;
}

export function deleteUserDataStore(){
  if(typeof window === 'undefined') return console.error('No window object found')
  return window.localStorage.removeItem('user-data')
}