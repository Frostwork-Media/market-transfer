import { ACTION } from "next/dist/client/components/app-router-headers";
import {
  frontendQuestion,
  UserQuestionDatum,
  MarketProbabilities,
} from "./types";


enum BetType {
  BuyYes,
  BuyNo,
  NoBet,
}

enum BetAction {
  BuyPosition,
  SellPosition,
  HoldPosition,
  Problem,
}

const getBetType = (
  marketProbability: MarketProbabilities,
  userProbability: number
): BetType => {
  if (marketProbability.buyYes < userProbability) {
    return BetType.BuyYes;
  } else if ((1 - marketProbability.buyNo) > userProbability) {
    return BetType.BuyNo;
    // Todo No option
  } else {
    return BetType.NoBet;
  }
};

const NO_BET = null;

const calcMarketWinChance = (
  marketProbability: MarketProbabilities,
  betType: BetType
): number | typeof NO_BET => {
  if (betType === BetType.BuyYes) {
    return marketProbability.buyYes;
  } else if (betType === BetType.BuyNo) {
    return marketProbability.buyNo;
  } else {
    return NO_BET;
  }
};

const calcMyWinChance = (
  myProbability: number,
  betType: BetType
): number | typeof NO_BET => {
  if (betType === BetType.BuyYes) {
    return myProbability;
  } else if (betType === BetType.BuyNo) {
    return 1 - myProbability;
  } else {
    return NO_BET;
  }
};

const calcMarketReturn = (
  marketWinChance: number,
  betType: BetType
): number => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return (1 - marketWinChance) / marketWinChance;
};

const calcKellyBetProportion = (
  marketReturn: number,
  myWinChance: number,
  betType: BetType
): number => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return myWinChance - (1 - myWinChance) / marketReturn;
};

const calcMaxKellyBet = (
  totalAmountInvested: number,
  kellyBetProportion: number,
) => {
  return totalAmountInvested * kellyBetProportion;
};

const calcBetEVreturn = (
  marketWinChance: number,
  myWinChance: number,
  betType: BetType
) => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return myWinChance - marketWinChance;
};

const calcBetROI = (
  betEVreturn: number,
  marketWinChance: number,
  betType: BetType
) => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return betEVreturn / marketWinChance;
};

const calcBetROIOverTime = (
  betROI: number,
  marketCorrectionTime: Date,
  betType: BetType
) => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  const timeDifference = marketCorrectionTime.getTime() - new Date().getTime();
  const timeDifferenceInDays = timeDifference / (1000 * 60 * 60 * 24);
  return (1 + betROI) ** (1 / timeDifferenceInDays) - 1;
};

const calcBetAction = (
  betType: BetType,
  maxBet: number,
  singleBetCurrentInvestment: number,
) => {
  console.log(betType, maxBet, singleBetCurrentInvestment)
  if (betType !== BetType.NoBet){
    if (singleBetCurrentInvestment < maxBet){
      return BetAction.BuyPosition;
    } else if(singleBetCurrentInvestment > maxBet){
      return BetAction.SellPosition;
    } else {
      return BetAction.HoldPosition;
    }
  } else if (betType === BetType.NoBet){
    if(singleBetCurrentInvestment <= maxBet){
      return BetAction.HoldPosition
    } else if (singleBetCurrentInvestment > maxBet){
      return BetAction.Problem;
    } else {
      throw new Error('Current investment and max bet incomparable');
    }
  }
}

export const calculateBettingStatisticsFromUserAndMarketData = (
  userData: UserQuestionDatum,
  totalAmountInvested: number,
  marketProbabilities: MarketProbabilities,
  marketTitle: string
) => {
  console.log(userData);
  console.log(marketProbabilities);
  const marketCorrectionTime = new Date(userData.marketCorrectionTime) || new Date();
  // TODO: predicted bet is a terrible name
  const predictedBet = getBetType(
    marketProbabilities,
    userData.userProbability
  );
  console.log(predictedBet);
  const marketWinChance = calcMarketWinChance(
    marketProbabilities,
    predictedBet
  );
  const myWinChance = calcMyWinChance(userData.userProbability, predictedBet);
  const marketReturn = calcMarketReturn(marketWinChance, predictedBet);
  const kellyBetProportion = calcKellyBetProportion(
    marketReturn,
    myWinChance,
    predictedBet
  );
  const betEVreturn = calcBetEVreturn(
    marketWinChance,
    myWinChance,
    predictedBet
  );
  const betROI = calcBetROI(betEVreturn, marketWinChance, predictedBet);
  const betROIOverTime = calcBetROIOverTime(
    betROI,
    marketCorrectionTime,
    predictedBet
  );

  let betActionString: string;
  let maxKellyBet: number;

  console.log("Total invested", totalAmountInvested, kellyBetProportion)

  if(totalAmountInvested > 0){
    maxKellyBet = calcMaxKellyBet(kellyBetProportion, totalAmountInvested)
    console.log(maxKellyBet)
    const betAction = calcBetAction(predictedBet, maxKellyBet, userData.amountInvested)
    switch (betAction) {
      case BetAction.BuyPosition:
        betActionString = "Buy";
        break;
      case BetAction.SellPosition:
        betActionString = "Sell";
        break;
      case BetAction.HoldPosition:
        betActionString = "Hold"
        break;
      case BetAction.Problem:
        betActionString = "Think"
        break
      default:
        throw new Error("Bet action not recognised");
        break;
    }
  } else {
    maxKellyBet = 0;
    betActionString = "No investments"
  }

  let buy: string;
  switch (predictedBet) {
    case BetType.BuyYes:
      buy = "YES";
      break;
    case BetType.BuyNo:
      buy = "NO";
      break;
    case BetType.NoBet:
      buy = "N/A";
      break;
    default:
      throw new Error("Bet type not recognised");
      break;
  }

  //Todo change name of bet action above so that it doens't change from being an enum to a string
  const output: frontendQuestion = {
    title: marketTitle,
    slug: userData.slug,
    url: userData.url,
    aggregator: userData.aggregator,
    marketProbabilities: marketProbabilities,
    userProbability: userData.userProbability,
    marketCorrectionTime: marketCorrectionTime,
    buy: buy,
    marketReturn: marketReturn,
    kellyPerc: kellyBetProportion,
    maxKellyBet: maxKellyBet,
    singleBetCurrentInvestment: userData.amountInvested,
    betAction: betActionString,
    rOI: betROI,
    rOIOverTime: betROIOverTime,
  };

  return output;
};

export const sortData = (data, sortBy, direction) => {
  try {
    return data.sort((a, b) => {
      if (typeof a[sortBy] === "string")
        return direction === "asc"
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);

      if (typeof a[sortBy] === "number")
        return direction === "asc"
          ? a[sortBy] - b[sortBy]
          : b[sortBy] - a[sortBy];

      return 0;
    });
  } catch (error) {
    console.log(error);
    console.log(data, sortBy, direction);
    alert("Error sorting data. Probably that there wasn't any data to sort.");
  }
};

export const seperateData = (userData, processedData) => {
  //compare the current user data with the stored user data
  //if they are different, process the data for each row

  //if they are the same, do nothing
  const oldProcessedData = processedData?.length > 0 ? processedData : [];

  if (
    userData &&
    userData.some(
      (row) =>
        isNaN(row.userProbability) &&
        oldProcessedData &&
        oldProcessedData.some((row) => isNaN(row.userProbability))
    )
  ) {
    throw new Error("One or more user probabilities are NaN.");
  }

  //TODO: same for dates

  // additions and updates including changes to my probability
  const addedData = userData.filter((row) => {
    let isAdded = false;

    if (!oldProcessedData.map((oldRow) => oldRow.slug).includes(row.slug)) {
      isAdded = true;
    }
    if (isAdded) return true;

    return false;
  });

  const updatedData = userData.filter((row) => {
    const oldMatchingRow = oldProcessedData.find(
      (oldRow) => oldRow.slug === row.slug
    );
    if (!oldMatchingRow) return false;

    const probabilityChanged =
      oldMatchingRow.userProbability !== row.userProbability;
    if (probabilityChanged) return true;

    const marketCorrectionTimeChanged =
      oldMatchingRow.marketCorrectionTime !== row.marketCorrectionTime;
    if (marketCorrectionTimeChanged) return true;

    return false;
  });

  console.log("updated Data", updatedData);

  //All the data that has been removed
  const removedData = oldProcessedData?.filter(
    (row) => !userData.map((row) => row.slug).includes(row.slug)
  );

  //All the data that hasn't been removed from the old processed data
  let unremovedData = oldProcessedData.filter(
    (row) => !removedData.map((removeRow) => removeRow.slug).includes(row.slug)
  );

  //
  let oldDataThatCanStay = unremovedData.filter(
    (row) => !updatedData.map((updateRow) => updateRow.slug).includes(row.slug)
  );

  const allUnprocessedData = [...addedData, ...updatedData];

  console.log("allUnprocessedData", allUnprocessedData);

  return {
    modifiedData: allUnprocessedData,
    unmodifiedData: oldDataThatCanStay,
  };
};
