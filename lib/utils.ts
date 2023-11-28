import { Question } from "@prisma/client"

export function objectToParams(obj) {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    // Stringify JSON values
    const strValue = typeof value === 'object' ? JSON.stringify(value) : value;

    const encodedValue = strValue.toString();
    urlParams.append(key, encodedValue);
  }
  return urlParams.toString();
}

export function floatToPercent(f: number): string {
  return `${Math.round(f * 1000) / 10}%`;
}

export function round2SF(f: number): number {
  return Math.round(f * 100) / 100;
}

export function round4SF(f: number): number {
  return Math.round(f * 10000) / 10000;
}

export function extractSlugFromURL(url) {
  console.log(url);
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export function extractMarketIdFromInsightURL(url) {
  const regex = /insightprediction\.com\/m\/(\d+)/;
  const match = url.match(regex);

  if (match) {
    return match[1];
  } else {
    throw new Error("Invalid insight URL");
  }
}

function isValidDate(date: any): boolean {
  return !isNaN((new Date(date)).getTime());
}

export function validateEntries(entries: Question[]) {
  if(!entries) return [];
  let validdatedData = entries.map(entry => {
    // Default values
    let defaultSlug = null;
    let defaultURL = null;
    let defaultUserProbability = 0.5;
    let defaultCorrectionTime = new Date();
    let defaultAggregator = "Manifold";

    // If 'slug' is not present and 'url' is present, extract the slug from URL
    if (!entry.slug && entry.url) {
      const urlParts = entry.url.split('/');
      defaultSlug = urlParts[urlParts.length - 1];
    }

    // If 'url' is not present and 'slug' is present, construct the URL from the slug
    if (!entry.url && entry.slug) {
      // TODO: dynamic based on market type
      defaultURL = `https://manifold.markets/api/v0/slug/${entry.slug}`;
    }

    let marketCorrectionTime;

    if (entry.marketCorrectionTime) {
      if (isValidDate(entry.marketCorrectionTime)) {
        console.log(`${entry.marketCorrectionTime} is a valid date.`);
        marketCorrectionTime = entry.marketCorrectionTime;
      } else {
        console.log(`${entry.marketCorrectionTime} is not a valid date.`);
        marketCorrectionTime = defaultCorrectionTime;
      }
    } else {
      console.log("No marketCorrectionTime provided in the entry object.");
      marketCorrectionTime = defaultCorrectionTime;
    }

    return {
      slug: entry.slug || defaultSlug,
      url: entry.url || defaultURL,
      userProbability: entry.userProbability || defaultUserProbability,
      marketCorrectionTime: marketCorrectionTime,
      aggregator: entry.aggregator || defaultAggregator
    };
  });
  console.log("validated data: ", validdatedData);
  return validdatedData;
}

export function mapToDatabaseQuestion (question) {
  return {
    slug: question.slug,
    url: question.url,
    userProbability: question.userProbability,
    marketCorrectionTime: question.marketCorrectionTime,
    broadQuestionId: question.broadQuestionId,
    aggregator: question.aggregator
  }
}