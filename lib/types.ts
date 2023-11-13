import { Question } from "@prisma/client"

export interface frontendQuestion {
    title: string,
    url: string,
    slug: string,
    aggregator: Question["aggregator"],
    marketProbability: number,
    userProbability: number,
    correctionTime: Date,
    buy: string,
    marketReturn: number,
    kellyPerc: number,
    rOI: number,
    rOIOverTime: number,
}
