export interface userQuestion {
    slug: string,
    url: string | null, 
    userProbability: number,
    correctionTime: Date,
}

export interface databaseQuestion {
    id: number | null,
    url: string,
    slug: string,
    userProbability: number,
    correctionTime: Date,
    aggregator: string,
    broadQuestionId: number | null;
  }

export interface frontendQuestion {
    title: string,
    url: string,
    slug: string,
    aggregator: "MANIFOLD" | "AIRTABLE" | "METACULUS",
    marketProbabily: number,
    userProbability: number,
    marketCorrectionDate: Date,
    buy: string,
    marketReturn: number,
    kellyPerc: number,
    rOI: number,
    rOIOverTime: number,
}
