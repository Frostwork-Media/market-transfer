import { promises } from "dns";
import {frontendQuestion} from "./types"
import { Question } from "@prisma/client"
import { getMarketBySlug, getMarketByUrl, getQuestionsFromDatabase, placeBetBySlug } from '@/lib/api';

export const buyYes = (marketProbability: number, myProbability: number) => {
    return marketProbability <= myProbability;
}

export const calcMarketWinChance = (marketProbability, buyYes) => {
    if(buyYes)  {
        return marketProbability;
    } else {
        return 1 - marketProbability;
    }
}

export const calcMyWinChance = (myProbability, buyYes) => {
    if(buyYes) {
        return myProbability;
    } else {
        return 1 - myProbability;
    }
}   

export const calcMarketReturn = (marketWinChance) => {
    return (1 - marketWinChance)/marketWinChance;
}

export const calcKellyBetProportion = (marketReturn, myWinChance) => {
    return myWinChance - (1 - myWinChance)/marketReturn;
}

export const calcKellyBet = (myBalance, kellyBetProportion) => {
    return myBalance * kellyBetProportion;
}

export const calcBetEVreturn = (marketWinChance, myWinChance) => {
    return myWinChance - marketWinChance
}

export const calcBetROI = (betEVreturn, marketWinChance) => {
    return betEVreturn/marketWinChance;
}

export const calcBetROIOverTime = (betROI, currentTime, marketCorrectionTime) => {
    const timeDifference = marketCorrectionTime.getTime() - currentTime.getTime();
    const timeDifferenceInDays = timeDifference / (1000 * 60 * 60 * 24);
    return (1+betROI)**(1/timeDifferenceInDays)-1;
}

export const calculateBettingStatisticsFromUserAndMarketData = (userData: Question, marketProbability: number, marketTitle: string) => {
    const currentTime = new Date;
    const correctionTime = new Date(userData.marketCorrectionTime) || new Date;
    const thingToBuy = buyYes(marketProbability, userData.userProbability);
    const marketWinChance = calcMarketWinChance(marketProbability, thingToBuy);
    const myWinChance = calcMyWinChance(userData.userProbability, thingToBuy);
    const marketReturn = calcMarketReturn(marketWinChance);
    const kellyBetProportion = calcKellyBetProportion(marketReturn, myWinChance);
    const betEVreturn = calcBetEVreturn(marketWinChance, myWinChance);
    const betROI = calcBetROI(betEVreturn, marketWinChance);
    const betROIOverTime = calcBetROIOverTime(betROI, currentTime, correctionTime);
    
    const output:frontendQuestion = {
        title: marketTitle,
        slug: userData.slug,
        url: userData.url,
        aggregator: userData.aggregator,
        marketProbability: marketProbability,
        userProbability: userData.userProbability,
        correctionTime: correctionTime,
        buy: thingToBuy ? "YES" : "NO",
        marketReturn: marketReturn,
        kellyPerc: kellyBetProportion,
        rOI: betROI,
        rOIOverTime: betROIOverTime,
    }

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
            if (typeof a[sortBy] === 'string')
                return direction === 'asc' ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy]);

            if (typeof a[sortBy] === 'number')
                return direction === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];

            return 0;
        });
    } catch (error) {
        console.log(error)
        console.log(data, sortBy, direction)
        alert('Error sorting data. Probably that there wasn\'t any data to sort.');
    }
}

export const seperateData = (userData, processedData) => {
    //compare the current user data with the stored user data
    //if they are different, process the data for each row

    //if they are the same, do nothing
    const oldProcessedData = processedData?.length > 0 ? processedData : [];

    if (userData && userData.some(row => isNaN(row.userProbability) && oldProcessedData && oldProcessedData.some(row => isNaN(row.userProbability)))) {
        throw new Error("One or more user probabilities are NaN.");
    }

    //TODO: same for dates

    // additions and updates including changes to my probability
    const addedData = userData.filter((row) => {
        let isAdded = false;
        
        if(!oldProcessedData.map((oldRow) => oldRow.slug).includes(row.slug)){
            isAdded = true;
        }
        if (isAdded) return true;

        return false
    });

    const updatedData = userData.filter((row) => {
        const oldMatchingRow = oldProcessedData.find((oldRow) => oldRow.slug === row.slug);
        if (!oldMatchingRow) return false;

        const probabilityChanged = oldMatchingRow.userProbability !== row.userProbability;
        if (probabilityChanged) return true;

        const marketCorrectionTimeChanged = oldMatchingRow.marketCorrectionTime !== row.marketCorrectionTime;
        if (marketCorrectionTimeChanged) return true;

        return false;
    });

    console.log("updated Data", updatedData);

    //All the data that has been removed
    const removedData = oldProcessedData?.filter((row) => !userData.map((row) => row.slug).includes(row.slug));

    //All the data that hasn't been removed from the old processed data
    let unremovedData = oldProcessedData.filter((row) => !removedData.map((removeRow) => removeRow.slug).includes(row.slug));

    //
    let oldDataThatCanStay = unremovedData.filter((row) => !updatedData.map((updateRow) => updateRow.slug).includes(row.slug));
    
    const allUnprocessedData = [...addedData, ...updatedData];

    console.log("allUnprocessedData",allUnprocessedData);

    return { modifiedData: allUnprocessedData, unmodifiedData: oldDataThatCanStay };
}

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