'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import * as calc from '../lib/probabilityCalculations';
import { floatToPercent, round2SF, extractSlugFromURL } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import SearchManifold from './SearchManifold';
import useDebounce from '../lib/hooks/useDebounce'
import BettingTable from './BettingTable';

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

    const isProcessedDataType = (data: any): data is processedDataType => {
        return (
            typeof data.slug === "string" &&
            typeof data.title === "string" &&
            typeof data.marketP === "number" &&
            typeof data.userProbability === "number" &&
            typeof data.buy === "string" &&
            typeof data.marketReturn === "number" &&
            typeof data.kellyPerc === "number" &&
            typeof data.rOI === "number"
        );
    };

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
        console.log("Market", response);
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
        console.log("Output", output);

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
        for(let i = 0 ; i < amount ; i = i + 100 ){
            console.log("Autobetting", i);
            console.log("bet", await placeBetBySlug(apiKey, processedData[0].slug, 100, processedData[0].buy));
            addBetsDoneData(processedData[0].slug, processedData[0].buy, 100);
            userData; // to trigger useEffect
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

        if (!userData || userData.length === 0){
            window.localStorage.removeItem('user-data');
            window.localStorage.removeItem('processed-data');
            setProcessedData([]);
            return;
        }

        const processDataAndUpdateState = async () => {
            //compare the current user data with the stored user data
            //if they are different, process the data for each row
            
            //if they are the same, do nothing
            console.log("User data", userData);
            const oldData = processedData?.map((row): userDataType => ({ slug: row.slug, userProbability: row.userProbability }));

            if (userData && userData.some(row => isNaN(row.userProbability) && oldData && oldData.some(row => isNaN(row.userProbability)))) {
                throw new Error("One or more user probabilities are NaN.");
            }

            // additions and updates including changes to my probability
            const addedData = userData.filter((row) => {
                const isAdded = !oldData.map((oldRow) => oldRow.slug).includes(row.slug);
                if (isAdded) return true;

                return false
            });

            const updatedData = userData.filter((row) => {
                const oldMatchingRow = oldData.find((oldRow) => oldRow.slug === row.slug);
                if (!oldMatchingRow) return false;

                const probabilityChanged = oldMatchingRow.userProbability !== row.userProbability;
                if (probabilityChanged) return true;

                return false;
            });

            const removedData = oldData?.filter((row) => !userData.map((row) => row.slug).includes(row.slug));

            let newData = oldData.filter((row) => !removedData.map((removeRow) => removeRow.slug).includes(row.slug));

            console.log("New data", newData);
            let removeUpdated = newData.filter((row) => !updatedData.map((updateRow) => updateRow.slug).includes(row.slug));
            console.log("Remove updated", removeUpdated);
            const allUnprocessedData = [...removeUpdated, ...addedData, ...updatedData];
            console.log("All unprocessed data", allUnprocessedData);
            const newProcessedData = await Promise.all(allUnprocessedData?.map((row) => processData(row)));

            const finalData = sortData(newProcessedData, "rOI", "desc");

            console.log("Final data", finalData);
            console.log("Correct type?", finalData.every((row) => isProcessedDataType(row)));
            setProcessedData(finalData);

            try {
                window?.localStorage.setItem('processed-data', JSON.stringify(finalData));

                const saveUserData = finalData.map((row) => ({ slug: row.slug, userProbability: row.userProbability }));
                window?.localStorage.setItem('user-data', JSON.stringify(saveUserData));
            } catch (error) {
                console.log(error)
                alert('Error parsing the pasted data. Please ensure it is in the correct format.');
            }
    
        }

        processDataAndUpdateState();
    }, [userData]);

    const handleSearchSelect = async (market) => {
        if (!processedData.map((m) => m.slug).includes(extractSlugFromURL(market.url))) {
            const updatedUserData =
                [{
                    slug: extractSlugFromURL(market.url),
                    userProbability: market.probability
                }
                    , ...userData];
            console.log("Search output", updatedUserData);
            setUserData(updatedUserData);
        }
    };

    const handleAPIKeyChange = (event) => {
        setApiKey(event.target.value);
    }

    return (
        <div className="w-full">
            <div className="my-4 flex justify-center">
                <div className="my-4 w-1/3">
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

                    <LoadingButton passOnClick={() => autobet(500)} buttonText={"Autobet 500"} />

                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">Bets done:</label>

                    <textarea 
                        className = "w-full h-32"
                        key={JSON.stringify(betsDoneData)}
                        value={JSON.stringify(betsDoneData)}
                        readOnly
                    />
                </div>
            </div>
            <div className="my-4">
                <BettingTable userData={userData} processedData={processedData} setUserData={setUserData} apiKey={apiKey} addBetsDoneData={addBetsDoneData}/>
            </div>
        </div>
    );
}