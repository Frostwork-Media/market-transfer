'use client';

import React, { useEffect, useState } from 'react';
import {addQuestionToDatabase, placeBetBySlug } from '@/lib/api';
import { extractSlugFromURL } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import SearchManifold from './SearchManifold';
import BettingTable from './BettingTable';
import BetsDoneTextArea from './BetsDoneTextArea';
import Link from 'next/link'
import FileHandler from './FileHandler';
import ApiKeyInput from './ApiKeyInput';
import { userQuestion, frontendQuestion } from '@/lib/types';
import DatePicker from 'react-datepicker';
import {seperateData, processNewAndUpdatedData } from '../lib/probabilityCalculations';
import 'react-datepicker/dist/react-datepicker.css';

export default function SpreadsheetForm() {

    const manifoldApiKey = process.env.NEXT_NEXT_PUBLIC_MANIFOLD_API_KEY;
    const databaseApiKey =  process.env.DATABASE_URL;
    const [betsDoneData, setBetsDoneData] = useState([]);
    const [marketSlug, setMarketSlug] = useState("");
    const [prob, setMarketProb] = useState(50);
    const [userData, setUserData] = useState<userQuestion[]>([]);
    const [processedData, setProcessedData] = useState<frontendQuestion[]>([]);

    const [correctionTime, setCorrectionTime] = useState(new Date());

    const handleMarketCorrectionTimeChange = (date) => {
        setCorrectionTime(date);
    };

    const addBetsDoneData = async (slug, outcomeToBuy, amountToPay) => {
        const nextRow = {
            slug: slug,
            outcomeToBuy: outcomeToBuy,
            amountToPay: amountToPay,
        }
        console.log("Adding row to bets done data", nextRow);
        setBetsDoneData(prevBetsDoneData => [...prevBetsDoneData, nextRow]);
        console.log("Bets done data", betsDoneData);
    }

    const autobet = async (amount) => {
        console.log("Autobetting", amount);
        for (let i = 0; i < amount; i = i + 100) {
            console.log("Bet at", i);

            await placeBetBySlug(manifoldApiKey, processedData[0].slug, 100, processedData[0].buy)
                .then(async () => {
                    await addBetsDoneData(processedData[0].slug, processedData[0].buy, 100);
                    console.log("Bet placed successfully on ", processedData[0].slug, 100, processedData[0].buy);
                    //await refreshColumnAfterBet(processedData[0].slug);
                })
                .catch((error) => {
                    console.log(error)
                    alert(`Error placing bet. ${error}`);
                });
        }
    }

   
    const handleSearchSelect = async (market) => {
        setMarketSlug(extractSlugFromURL(market.url));
        setMarketProb(market.probability*100);
    };

    useEffect(() => {
        console.log("Getting stored data")
        const storedUserData = JSON.parse(window.localStorage.getItem('user-data'));
        console.log("Stored user data", storedUserData);
        const storedProcessedData = JSON.parse(window.localStorage.getItem('processed-data'));
        if (storedUserData) {
            setUserData(storedUserData);
        } else if (storedProcessedData) {
            setProcessedData(storedProcessedData);
        }
    }, []);

    useEffect(() => {
        console.log("userData useEffect called");
        if (!userData || userData.length === 0) {
            window.localStorage.removeItem('user-data');
            window.localStorage.removeItem('processed-data');
            setProcessedData([]);
            return;
        }
        const seperatedData = seperateData(userData, processedData);
        console.log("Processing data. Modified data: ", seperatedData.modifiedData, "Unmodified data: ", seperatedData.unmodifiedData);
        processNewAndUpdatedData(seperatedData.modifiedData, seperatedData.unmodifiedData, setProcessedData);
    }, [userData]);

    const addToTable = (event) => {

        if (!processedData.map((m) => m.slug).includes(marketSlug)) {
            const updatedUserData: userQuestion[] =
                [{
                    slug: marketSlug,
                    url: null,
                    userProbability: +prob / 100,
                    correctionTime: correctionTime,
                }
                    , ...userData];
            setUserData(updatedUserData);
        }
    }

    const handleSlugInput = (event) => {
        setMarketSlug(event.target.value)
    }

    const handleProbInput = (event) => {
        setMarketProb(event.target.value)
    }

    const handleRefreshData = async () => {
        console.log("Refreshing data");
    }

    const refreshColumnAfterBet = async (slug) => {
        console.log("Refreshing column after bet", slug);
        const updatedUserData: userQuestion[] = userData.filter((m) => m.url !== slug);
        setUserData(updatedUserData);
    }

    useEffect(() => {
        console.log("Getting stored data")
        const storedUserData = JSON.parse(window.localStorage.getItem('user-data'));
        const storedtableData = JSON.parse(window.localStorage.getItem('processed-data'));
    
        if (storedUserData) {
            setUserData(storedUserData);
        } else if (storedtableData) {
            setProcessedData(storedtableData);
        }
    }, []);

    const saveToDatabase = async () => {
        console.log("Saving to database");

        for(const data of userData) {
            const dataToSave = {
                id: null,
                slug: data.slug,
                url: data.url,
                userProbability: data.userProbability,  
                correctionTime: data.correctionTime,
                aggregator: "manifold",
                broadQuestionId : 1,
            }
            addQuestionToDatabase(dataToSave);
        }
    }

    return (
        <div className="w-full">
            <div className="my-4 flex justify-center">
                <div className="my-4 w-1/2">
                    <FileHandler dataToSave={userData} loadDataEndpoint={setUserData} />
                    
                    <label htmlFor="market-search" className="block text-sm font-medium text-gray-700">Save to database:</label>

                    <LoadingButton passOnClick={saveToDatabase} buttonText={"Save to database"} />

                    <label htmlFor="market-search" className="block text-sm font-medium text-gray-700">Search markets to autofill:</label>

                    <SearchManifold handleSelect={handleSearchSelect} processedData={processedData} />

                    <label htmlFor="market_slug" className="block text-sm font-medium text-gray-700">Slug:</label>

                    <input
                        id="market_slug"
                        name="market_slug"
                        className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={marketSlug}
                        onChange={handleSlugInput}
                    />

                    <label htmlFor="market_slug" className="block text-sm font-medium text-gray-700">Probability (percentage):</label>

                    <input
                        id="market_prob"
                        name="market_prob"
                        className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={prob}
                        onChange={handleProbInput}
                    />

                    <label htmlFor="market-correction-date" className="block text-sm font-medium text-gray-700">Market correction date:</label>

                    <DatePicker
                        id="market-correction-time"
                        name="correctionTime"
                        selected={correctionTime}
                        onChange={handleMarketCorrectionTimeChange}
                        className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />

                    <LoadingButton passOnClick={addToTable} buttonText={"Add to table"} />

                    <LoadingButton passOnClick={() => autobet(500)} buttonText={"Autobet 500"} /><LoadingButton passOnClick={handleRefreshData} buttonText={"Refresh table"} />

                    <label htmlFor="bets-done" className="block text-sm font-medium text-gray-700">Bets done:</label>

                    <BetsDoneTextArea betsDoneData={betsDoneData} />

                    <div className='flex flex-wrap gap-2 m-2 mt-8'>
                        <Link href="https://github.com/Nathan-Tom/market-transfer" target='_blank' className="bg-green-500 hover:bg-green-700 font-bold py-2 px-4 rounded-full">GitHub Repo (Feel free to make issues)</Link>
                        <Link href="https://chat.whatsapp.com/DKKQ5wESCOHGeN5nCFVotI" target='_blank' className="bg-green-500 hover:bg-green-700 font-bold py-2 px-4 rounded-full">Say hi👋 or report bugs🐛 (whatsapp chat)</Link>
                    </div>
                </div>
            </div>
            <div className="my-4">
                <BettingTable userData={userData} tableData={processedData} setTableData={setProcessedData} setUserData={setUserData} apiKey={manifoldApiKey} addBetsDoneData={addBetsDoneData} refreshColumnAfterBet={refreshColumnAfterBet}/>
            </div>
        </div>
    );
}