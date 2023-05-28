export interface databaseQuestionData {
    title: string;
    url: string;
    marketProbability: number;
    userProbability: number;
    marketCorrectionTime: Date | null;
    rOI: number;
    aggregator: string;
    broadQuestionId: string | null;
  }