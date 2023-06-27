export interface userQuestion {
    slug: string,
    url: string | null, 
    userProbability: number,
    correctionTime: Date,
    aggregator: "MANIFOLD" | "AIRTABLE" | "METACULUS" | "PERSONAL" | "STOCK",
}

export interface frontendQuestion {
    title: string,
    url: string,
    slug: string,
    aggregator: "MANIFOLD" | "AIRTABLE" | "METACULUS" | "PERSONAL" | "STOCK",
    marketProbability: number,
    userProbability: number,
    correctionTime: Date,
    buy: string,
    marketReturn: number,
    kellyPerc: number,
    rOI: number,
    rOIOverTime: number,
}
