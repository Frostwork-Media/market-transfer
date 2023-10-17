import { getMarketBySlug } from "./api";
import { userQuestion } from "./types";

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

function isValidDate(date: any): boolean {
  return !isNaN((new Date(date)).getTime());
}

export function validateEntries(entries: userQuestion[]) {
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
      const market = getMarketBySlug(entry.slug);
      console.log(market);
      defaultURL = market.url;;
    }

    let correctionTime;

    if (entry.correctionTime) {
      if (isValidDate(entry.correctionTime)) {
        console.log(`${entry.correctionTime} is a valid date.`);
        correctionTime = entry.correctionTime;
      } else {
        console.log(`${entry.correctionTime} is not a valid date.`);
        correctionTime = defaultCorrectionTime;
      }
    } else {
      console.log("No correctionTime provided in the entry object.");
      correctionTime = defaultCorrectionTime;
    }

    return {
      slug: entry.slug || defaultSlug,
      url: entry.url || defaultURL,
      userProbability: entry.userProbability || defaultUserProbability,
      correctionTime: correctionTime,
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
    correctionTime: question.correctionTime,
    broadQuestionId: question.broadQuestionId,
    aggregator: question.aggregator
  }
}