export interface userQuestion {
    url: string,
    userProbability: number,
    marketCorrectionDate: number,
}

export interface databaseQuestion {
    id: number | null,
    title: string;
    url: string;
    aggregator: string;
    marketProbability: number;
    userProbability: number;
    marketCorrectionTime: Date | null;
    buy: string,
    marketReturn: number,
    kellyPerc: number,
    rOI: number,
    rOIOverTime: number,
    broadQuestionId: string | null;
  }

export interface frontendQuestion {
    title: string,
    url: string,
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
