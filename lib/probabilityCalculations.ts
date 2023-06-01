import { promises } from "dns";
import {userQuestion, databaseQuestion } from "./types"
import { addQuestionToDatabase, getMarketByUrl, getQuestionsFromDatabase, placeBetBySlug } from '@/lib/api';

export const buyYes = (marketProbability, myProbability ) => {
    if(typeof marketProbability !== 'number' || typeof myProbability !== 'number')
        throw 'marketProbability and myProbability must be numbers';
    
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
    const timeDifference = marketCorrectionTime - currentTime;
    const timeDifferenceInDays = timeDifference / (1000 * 60 * 60 * 24);
    return (1+betROI)^(1/timeDifferenceInDays)-1
}

const getAllDatabaseQuestionData = async (): Promise<databaseQuestion> => {
    const AllQuestions = getQuestionsFromDatabase();
    return AllQuestions
} 

const processData = async (userData: userQuestion): Promise<databaseQuestion> => {
    console.log("Processing data for", userData.url, userData.userProbability);
    // Fix this
    const currentTime = new Date;
    const response = await getMarketByUrl(userData.url);
    const marketProbability = parseFloat(response.probability);
    const thingToBuy = buyYes(response.probability, userData.userProbability);
    const marketWinChance = calcMarketWinChance(response.probability, thingToBuy);
    const myWinChance = calcMyWinChance(userData.userProbability, thingToBuy);
    const marketReturn = calcMarketReturn(marketWinChance);
    const kellyBetProportion = calcKellyBetProportion(marketReturn, myWinChance);
    const betEVreturn = calcBetEVreturn(marketWinChance, myWinChance);
    const betROI = calcBetROI(betEVreturn, marketWinChance);
    // const betROIOverTime = calcBetROIOverTime(betROI, currentTime, )
    //const roundedUserProbility = Math.round( * 1000) / 10; // 3 decimal places

    const output: databaseQuestion = {
        id: null,
        title: response.question,
        url: userData.url,
        aggregator: "MANIFOLD",
        marketProbability: marketProbability,
        userProbability: userData.userProbability,
        marketCorrectionTime: new Date(),
        buy: thingToBuy ? "YES" : "NO",
        marketReturn: marketReturn,
        kellyPerc: kellyBetProportion,
        rOI: betROI,
        rOIOverTime: 0,
        broadQuestionId: null,
    }
    console.log("Processed Data", output);

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

const sortData = (data, sortBy, direction) => {
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

const seperateData = (newData, databaseData) => {
    //compare the current user data with the stored user data
    //if they are different, process the data for each row

    //if they are the same, do nothing
    const oldDatabaseData = databaseData?.length > 0 ? databaseData : [];

    if (newData && newData.some(row => isNaN(row.userProbability) && oldDatabaseData && oldDatabaseData.some(row => isNaN(row.userProbability)))) {
        throw new Error("One or more user probabilities are NaN.");
    }

    //TODO: same for dates

    // additions and updates including changes to my probability
    const addedData = newData.filter((row) => {
        let isAdded = false;
        
        if(!oldDatabaseData.map((oldrow) => oldrow.id).includes(row.id)||!oldDatabaseData.map((oldRow) => oldRow.slug).includes(row.slug)){
            isAdded = true;
        }
        if (isAdded) return true;

        return false
    });

    const updatedData = newData.filter((row) => {
        const oldMatchingRow = oldDatabaseData.find((oldRow) => oldRow.slug === row.slug);
        if (!oldMatchingRow) return false;

        const probabilityChanged = oldMatchingRow.userProbability !== row.userProbability;
        if (probabilityChanged) return true;

        return false;
    });

    //All the data that has been removed
    const removedData = oldDatabaseData?.filter((row) => !newData.map((row) => row.slug).includes(row.slug));

    //All the data that hasn't been removed from the old processed data
    let unremovedData = oldDatabaseData.filter((row) => !removedData.map((removeRow) => removeRow.slug).includes(row.slug));

    //
    let oldDataThatCanStay = unremovedData.filter((row) => !updatedData.map((updateRow) => updateRow.slug).includes(row.slug));
    
    const allUnprocessedData = [...addedData, ...updatedData];

    return { modifiedData: allUnprocessedData, unmodifiedData: oldDataThatCanStay };
}

const updateData = () => {

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


// export const processNewAndUpdatedData = async (modifiedData, unmodifiedData) => {
//     const newProcessedData = await Promise.all(modifiedData?.map((row) => processData(row)));

//     const finalData = [...unmodifiedData, ...newProcessedData]

//     const sortedData = sortData(finalData, "rOI", "desc");

//     try {
//         window?.localStorage.setItem('processed-data', JSON.stringify(finalData));
//         const saveUserData = finalData.map((row) => ({ slug: row.slug, userProbability: row.userProbability }));
//         window?.localStorage.setItem('user-data', JSON.stringify(saveUserData));

//         // Here's where you can send the data to the API
//       /*   sortedData.forEach(async (data) => {
//             let databaseQuestionData: databaseQuestionData = {
//                 title: data.title,
//                 url: data.url,
//                 marketProbability: data.marketProbability,
//                 userProbability: data.userProbability,
//                 marketCorrectionTime: null,
//                 rOI: data.rOI,
//                 aggregator: "MANIFOLD",
//                 broadQuestionId: null,
//             }
//             await addQuestionToDatabase(databaseQuestionData);
//         }); */
//         let data = sortedData.find(() => true);  // Get the first item
//         console.log(data);
//         if (data) {
//             let databaseQuestionData: databaseQuestionData = {
//                 title: data.title,
//                 url: data.slug,
//                 marketProbability: data.marketP,
//                 userProbability: data.userProbability,
//                 marketCorrectionTime: new Date,
//                 rOI: data.rOI,
//                 aggregator: "MANIFOLD",
//                 broadQuestionId: null,
//             };
//             console.log("sending to database", databaseQuestionData);
//             await addQuestionToDatabase(databaseQuestionData);
//         }
//     } catch (error) {
//         console.log(error)
//         alert('Error parsing the pasted data. Please ensure it is in the correct format.');
//     }

// }

// export const processAllData = async (modifiedData, unmodifiedData) => {
//     const allData = [...modifiedData, ...unmodifiedData?.map((row) => ({ slug: row.slug, userProbability: row.userProbability }))];

//     const newProcessedData = await Promise.all(allData?.map((row) => processData(row)));

//     const sortedData = sortData(newProcessedData, "rOI", "desc");

//     setProcessedData(sortedData);

//     try {
//         window?.localStorage.setItem('processed-data', JSON.stringify(sortedData));
//         const saveUserData = sortedData.map((row) => ({ slug: row.slug, userProbability: row.userProbability }));
//         window?.localStorage.setItem('user-data', JSON.stringify(saveUserData));
//         sortedData.forEach( async (data) => {
//             let databaseQuestionData:databaseQuestionData = {
//                 title: data.title,
//                 url: data.url,
//                 marketProbability: data.marketProbability,
//                 userProbability: data.userProbability,
//                 marketCorrectionTime: null,
//                 rOI: data.rOI,
//                 aggregator: "MANIFOLD",
//                 broadQuestionId: null,
//             }
//             await addQuestionToDatabase(databaseQuestionData);
//     });
        
//     } catch (error) {
//         console.log(error)
//         alert('Error parsing the pasted data. Please ensure it is in the correct format.');
//     }
// }