import { promises } from "dns";
import {
  frontendQuestion,
  UserQuestionDatum,
  MarketProbabilities,
} from "./types";
import { Question } from "@prisma/client";
import {
  getMarketByUrl,
  getQuestionsFromDatabase,
  placeBetBySlug,
} from "@/lib/api";

enum BetType {
  BuyYes,
  BuyNo,
  NoBet,
}

export const getBetType = (
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

export const NO_BET = null;

export const calcMarketWinChance = (
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

export const calcMyWinChance = (
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

export const calcMarketReturn = (
  marketWinChance: number,
  betType: BetType
): number => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return (1 - marketWinChance) / marketWinChance;
};

export const calcKellyBetProportion = (
  marketReturn: number,
  myWinChance: number,
  betType: BetType
): number => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return myWinChance - (1 - myWinChance) / marketReturn;
};

export const calcKellyBet = (
  myBalance: number,
  kellyBetProportion: number,
  betType: BetType
) => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return myBalance * kellyBetProportion;
};

export const calcBetEVreturn = (
  marketWinChance: number,
  myWinChance: number,
  betType: BetType
) => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return myWinChance - marketWinChance;
};

export const calcBetROI = (
  betEVreturn: number,
  marketWinChance: number,
  betType: BetType
) => {
  if (betType === BetType.NoBet) {
    return 0;
  }
  return betEVreturn / marketWinChance;
};

export const calcBetROIOverTime = (
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

export const calculateBettingStatisticsFromUserAndMarketData = (
  userData: UserQuestionDatum,
  // TODO think about manifold
  marketProbabilities: MarketProbabilities,
  marketTitle: string
) => {
  const correctionTime = new Date(userData.marketCorrectionTime) || new Date();
  const predictedBet = getBetType(
    marketProbabilities,
    userData.userProbability
  );
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
    correctionTime,
    predictedBet
  );

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

  const output: frontendQuestion = {
    title: marketTitle,
    slug: userData.slug,
    url: userData.url,
    aggregator: userData.aggregator,
    marketProbabilities: marketProbabilities,
    userProbability: userData.userProbability,
    correctionTime: correctionTime,
    buy: buy,
    marketReturn: marketReturn,
    kellyPerc: kellyBetProportion,
    rOI: betROI,
    rOIOverTime: betROIOverTime,
  };

  return output;
};

//Adding to

//I guess we compare slugs or ids?

//if no ID add if no id
// Check

// if ID update

//Reading whole database

//Sort data

//Todo: read from the database?

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

// const refreshColumnAfterBet = async (slug) => {
//     const updatedProcessedData = await Promise.all(
//       processedData.map(async (row) => {
//         if (row.slug === slug) {
//           return await processData({ slug: row.slug, userProbability: row.userProbability });
//         } else {
//           return row;
//         }
//       })
//     );
//     console.log("Refreshed data", updatedProcessedData);
//     const sortedProcessedData = sortData(updatedProcessedData, 'rOI', 'desc');
//     setProcessedData(sortedProcessedData);
//     console.log("processedData", processedData);
//   };

// const handleRefreshData = async (userData,setTableData) => {
//     const processedData = getAllDatabaseQuestionData();
//     const { modifiedData, unmodifiedData } = seperateData(userData, processedData);
//     const refreshedData = await processAllData(unmodifiedData, modifiedData);
//     setTableData(refreshedData);
// }

// export const processNewAndUpdatedData = async (modifiedData, unmodifiedData, setProcessedData) => {
//     const newProcessedData = await Promise.all(modifiedData?.map((row) => processData(row)));

//     const finalData = [...unmodifiedData, ...newProcessedData]

//     const sortedData = sortData(finalData, "rOIOverTime", "desc");

//     setProcessedData(sortedData);

//     try {
//         window?.localStorage.setItem('processed-data', JSON.stringify(finalData));
//         const saveUserData:userQuestion[] = finalData.map((row) => ({ slug: row.slug, url: null, userProbability: row.userProbability, marketCorrectionTime: row.marketCorrectionTime || new Date,}));
//         console.log(saveUserData);
//         window?.localStorage.setItem('user-data', JSON.stringify(saveUserData));
//     } catch (error) {
//         console.log(error)
//         alert('Error processing data. Please ensure it is in the correct format.');
//     }
// }
