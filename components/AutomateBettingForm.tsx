'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import * as calc from '../lib/probabilityCalculations';
import { extractSlugFromURL } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import SearchManifold from './SearchManifold';
import BettingTable from './BettingTable';
import BetsDoneTextArea from './BetsDoneTextArea';
import Link from 'next/link'

export default function SpreadsheetForm() {
    const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_MANIFOLD_API_KEY || '');
    const [betsDoneData, setBetsDoneData] = useState([]);

    // data
    type userDataType = {
        slug: string,
        userProbability: number
    }; // array of probability
    const [userData, setUserData] = useState<userDataType[]>([]);

    type processedDataType = {
        slug: string,
        title: string,
        marketP: number,
        userProbability: number,
        buy: string,
        marketReturn: number,
        kellyPerc: number,
        rOI: number,
    }; // array of probability
    const [processedData, setProcessedData] = useState<processedDataType[]>([]);

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

    const processData = async ({ slug, userProbability }: userDataType): Promise<processedDataType> => {
        console.log("Processing data for", slug, userProbability);
        const response = await getMarketBySlug(slug);
        const marketProbability = parseFloat(response.probability);
        const thingToBuy = calc.buyYes(response.probability, userProbability);
        const marketWinChance = calc.marketWinChance(response.probability, thingToBuy);
        const myWinChance = calc.myWinChance(userProbability, thingToBuy);
        const marketReturn = calc.marketReturn(marketWinChance);
        const kellyBetProportion = calc.kellyBetProportion(marketReturn, myWinChance);
        const betEVreturn = calc.betEVreturn(marketWinChance, myWinChance);
        const betROI = calc.betROI(betEVreturn, marketWinChance);
        //const roundedUserProbility = Math.round( * 1000) / 10; // 3 decimal places

        const output = {
            slug: slug,
            title: response.question,
            marketP: marketProbability,
            userProbability: userProbability,
            buy: thingToBuy ? "YES" : "NO",
            marketReturn: marketReturn,
            kellyPerc: kellyBetProportion,
            rOI: betROI,
        }
        console.log("Processed Data", output);

        return output;

    };

    const addBetsDoneData = (slug, outcomeToBuy, amountToPay) => {
        const nextRow = {
            slug: slug,
            outcomeToBuy: outcomeToBuy,
            amountToPay: amountToPay,
        }
        setBetsDoneData([...betsDoneData, nextRow]);
    }

    const autobet = async (amount) => {
        console.log("Autobetting", amount);
        let localBetsDoneData = [...betsDoneData];
        for (let i = 0; i < amount; i = i + 100) {
            console.log("Bet at", i);

            await placeBetBySlug(apiKey, processedData[0].slug, 100, processedData[0].buy)
                .then(() => {
                    addBetsDoneData(processedData[0].slug, processedData[0].buy, 100);
                    console.log("Bet placed successfully on ", processedData[0].slug, 100, processedData[0].buy);
                    refreshColumnAfterBet(processedData[0].slug);
                })
                .catch((error) => {
                    console.log(error)
                    alert(`Error placing bet. ${error}`);
                });
        }
    }

    const seperateData = (userData, processedData) => {
        //compare the current user data with the stored user data
        //if they are different, process the data for each row

        //if they are the same, do nothing
        const oldProcessedData = processedData?.length > 0 ? processedData : [];

        if (userData && userData.some(row => isNaN(row.userProbability) && oldProcessedData && oldProcessedData.some(row => isNaN(row.userProbability)))) {
            throw new Error("One or more user probabilities are NaN.");
        }

        // additions and updates including changes to my probability
        const addedData = userData.filter((row) => {
            const isAdded = !oldProcessedData.map((oldRow) => oldRow.slug).includes(row.slug);
            if (isAdded) return true;

            return false
        });

        const updatedData = userData.filter((row) => {
            const oldMatchingRow = oldProcessedData.find((oldRow) => oldRow.slug === row.slug);
            if (!oldMatchingRow) return false;

            const probabilityChanged = oldMatchingRow.userProbability !== row.userProbability;
            if (probabilityChanged) return true;

            return false;
        });

        //All the data that has been removed
        const removedData = oldProcessedData?.filter((row) => !userData.map((row) => row.slug).includes(row.slug));

        //All the data that hasn't been removed from the old processed data
        let unremovedData = oldProcessedData.filter((row) => !removedData.map((removeRow) => removeRow.slug).includes(row.slug));

        //
        let oldDataThatCanStay = unremovedData.filter((row) => !updatedData.map((updateRow) => updateRow.slug).includes(row.slug));
        ;
        const allUnprocessedData = [...addedData, ...updatedData];

        return { modifiedData: allUnprocessedData, unmodifiedData: oldDataThatCanStay };
    }


    const processNewAndUpdatedData = async (modifiedData, unmodifiedData) => {
        const newProcessedData = await Promise.all(modifiedData?.map((row) => processData(row)));

        const finalData = [...unmodifiedData, ...newProcessedData]

        const sortedData = sortData(finalData, "rOI", "desc");

        setProcessedData(sortedData);

        try {
            window?.localStorage.setItem('processed-data', JSON.stringify(finalData));
            const saveUserData = finalData.map((row) => ({ slug: row.slug, userProbability: row.userProbability }));
            window?.localStorage.setItem('user-data', JSON.stringify(saveUserData));
        } catch (error) {
            console.log(error)
            alert('Error parsing the pasted data. Please ensure it is in the correct format.');
        }

    }

    const processAllData = async (modifiedData, unmodifiedData) => {
        const allData = [...modifiedData, ...unmodifiedData?.map((row) => ({ slug: row.slug, userProbability: row.userProbability }))];

        const newProcessedData = await Promise.all(allData?.map((row) => processData(row)));

        const sortedData = sortData(newProcessedData, "rOI", "desc");

        setProcessedData(sortedData);

        try {
            window?.localStorage.setItem('processed-data', JSON.stringify(sortedData));

            const saveUserData = sortedData.map((row) => ({ slug: row.slug, userProbability: row.userProbability }));
            window?.localStorage.setItem('user-data', JSON.stringify(saveUserData));
        } catch (error) {
            console.log(error)
            alert('Error parsing the pasted data. Please ensure it is in the correct format.');
        }
    }

    useEffect(() => {
        console.log("Getting stored data")
        const storedUserData = JSON.parse(window.localStorage.getItem('user-data'));
        const storedProcessedData = JSON.parse(window.localStorage.getItem('processed-data'));

        if (storedUserData) {
            setUserData(storedUserData);
        } else if (storedProcessedData) {
            setProcessedData(storedProcessedData);
        }
    }, []);

    // processed data handler
    useEffect(() => {
        console.log("Processing data");

        if (!userData || userData.length === 0) {
            window.localStorage.removeItem('user-data');
            window.localStorage.removeItem('processed-data');
            setProcessedData([]);
            return;
        }
        const seperatedData = seperateData(userData, processedData); 
        console.log("seperateData", seperatedData)
        processNewAndUpdatedData(seperatedData.modifiedData, seperatedData.unmodifiedData);
    }, [userData]);

    const refreshColumnAfterBet = async (slug) => {
        const updatedProcessedData = await Promise.all(
          processedData.map(async (row) => {
            if (row.slug === slug) {
              return await processData({ slug: row.slug, userProbability: row.userProbability });
            } else {
              return row;
            }
          })
        );
        console.log("Refreshed data", updatedProcessedData);
        const sortedProcessedData = sortData(updatedProcessedData, 'rOI', 'desc');
        setProcessedData(sortedProcessedData);
        console.log("processedData", processedData);
      };

    const handleRefreshData = async () => {
        const { modifiedData, unmodifiedData } = seperateData(userData, processedData);
       await processAllData(unmodifiedData, modifiedData);
    }

    const handleSearchSelect = async (market) => {
        if (!processedData.map((m) => m.slug).includes(extractSlugFromURL(market.url))) {
            const updatedUserData =
                [{
                    slug: extractSlugFromURL(market.url),
                    userProbability: market.probability
                }
                    , ...userData];
            setUserData(updatedUserData);
        }
    };

    const handleAPIKeyChange = (event) => {
        setApiKey(event.target.value);
    }

    return (
        <div className="w-full">
            <div className="my-4 flex justify-center">
                <div className="my-4 w-1/2">
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">Click entries to add them to the table:</label>

                    <SearchManifold handleSelect={handleSearchSelect} />

                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">API key (for auto betting)</label>

                    <input
                        id="api-key"
                        name="api-key"
                        type="password"
                        className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={apiKey}
                        onChange={handleAPIKeyChange}
                    />

                    <LoadingButton passOnClick={() => autobet(500)} buttonText={"Autobet 500"} /><LoadingButton passOnClick={handleRefreshData} buttonText={"Refresh table"} />

                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">Bets done:</label>

                    <BetsDoneTextArea betsDoneData={betsDoneData} />

                    <Link href="https://github.com/Nathan-Tom/market-transfer" target='_blank' className="mx-2 my-2 bg-green-500 hover:bg-green-700  font-bold py-2 px-4 rounded-full mt-8">GitHub Repo (Feel free to make issues)</Link>
                    <Link href="https://chat.whatsapp.com/DKKQ5wESCOHGeN5nCFVotI" target='_blank' className="mx-2 my-2 bg-green-500 hover:bg-green-700  font-bold py-2 px-4 rounded-full mt-8">Say hi👋 or report bugs🐛 (whatsapp chat)</Link>

                </div>
            </div>
            <div className="my-4">
                <BettingTable userData={userData} processedData={processedData} setUserData={setUserData} apiKey={apiKey} addBetsDoneData={addBetsDoneData} refreshColumnAfterBet={refreshColumnAfterBet}/>
            </div>
        </div>
    );
}