import { Question } from "@prisma/client";

export type MarketProbabilities = {
  buyYes: number;
  // On the backend buyYes and buyNo really mean those things. But on the frontend we'll flip buy no to "Sell yes". This won't work for Smarkets
  buyNo: number;
};

// TODO: Use Question as base type? rename to 'QuestionWithMarketData'?
export interface frontendQuestion {
  title: string;
  url: string;
  slug: string;
  aggregator: Question["aggregator"];
  marketProbabilities: MarketProbabilities;
  userProbability: number;
  marketCorrectionTime: Date;
  buy: string;
  marketReturn: number;
  kellyPerc: number;
  maxKellyBet: number;
  singleBetCurrentInvestment: number;
  betAction: string;
  rOI: number;
  rOIOverTime: number;
}

export interface UserQuestionDatum
  extends Omit<Question, "id" | "createdAt" | "updatedAt"> {}

export const frontendQuestionToUserQuestionDatum = (
  frontendQuestion: frontendQuestion
): UserQuestionDatum => ({
  slug: frontendQuestion.slug,
  url: frontendQuestion.url,
  userProbability: frontendQuestion.userProbability,
  marketCorrectionTime: frontendQuestion.marketCorrectionTime,
  amountInvested: frontendQuestion.singleBetCurrentInvestment,
  aggregator: frontendQuestion.aggregator,
  broadQuestionId: null, // TODO: frontendQuestion doesn't define broadQuestionId, so this is always null. We should probably define it in frontendQuestion
});
