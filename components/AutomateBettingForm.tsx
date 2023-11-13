'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getQuestionsFromDatabase, getMarketBySlug } from '@/lib/api';
import { extractSlugFromURL} from '@/lib/utils';
import LoadingButton from './LoadingButton';
import SearchManifold from './SearchManifold';
import BettingTable from './BettingTable';
import BetsDoneTextArea from './BetsDoneTextArea';
import Link from 'next/link'
import ApiKeyInput from './ApiKeyInput';
import { frontendQuestion } from '@/lib/types';
import { Question } from '@prisma/client';
import DatePicker from 'react-datepicker';
import { calculateBettingStatisticsFromUserAndMarketData, sortData} from '../lib/probabilityCalculations';
import 'react-datepicker/dist/react-datepicker.css';

export default function SpreadsheetForm() {
    const [apiKey, setApiKey] = useState("");
    const [betsDoneData, setBetsDoneData] = useState([]);
    const [marketSlug, setMarketSlug] = useState("");
    const [prob, setMarketProb] = useState(50);
    const [userData, setUserData] = useState<Question[]>([]);
    const [activeTab, setActiveTab] = useState('manifold');
    const [correctionTime, setCorrectionTime] = useState(new Date());

    const handleCorrectionTimeChange = (date) => {
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
   
    const handleSearchSelect = async (market) => {
        setMarketSlug(extractSlugFromURL(market.url));
        setMarketProb(market.probability*100);
    };

    // On page load, get the questions from the database and set them to userData.
    // Also fetch the api key from localStorage and set it to apiKey.
    
    useEffect(() => {
        console.log("Getting stored data");
        const fetchData = async () => {
            let response = await getQuestionsFromDatabase();
            const results = await response.json();
            return results;
        }
        fetchData().then(data => data ? setUserData(data) : null );
        const storedApiKey = window.localStorage.getItem('api-key');

        if (storedApiKey) {
            setApiKey(storedApiKey);
        }
    
    }, []);

    // For every slug in userData, get each market. `markets` is then a map from
    // slug to market.

    const slugs = useMemo(() => userData.map((m) => m.slug), [userData]);

    const [markets, setMarkets] = useState<Record<string, { probability: number; question: string; }>>({});

    useEffect(() => {
        if (!slugs || slugs.length === 0) {
            return;
        }

        (async () => {
            const slugToMarketMap = {};

            for (const slug of slugs) {
                const market = await getMarketBySlug(slug);
                slugToMarketMap[slug] = market;
            }

            setMarkets(
                slugToMarketMap
            )
        })()
    }, [slugs]);

    // Now we have the user data and the market data, we can calculate the processed data.

    const processedData = useMemo<frontendQuestion[]>(() => {
        let processedData = [];
        for (const data of userData) {
            const market = markets[data.slug];
            if (!market) {
                continue;
            }
            processedData.push(calculateBettingStatisticsFromUserAndMarketData(data, market.probability, market.question))
        }

        const sortedProcessedData = sortData(processedData, "rOIOverTime", "desc");

        return sortedProcessedData;
    }, [userData, markets]);

    // two more things missing:
    //  - sending updated data to database

    const addToTable = (event) => {

        if (!processedData.map((m) => m.slug).includes(marketSlug)) {
            const updatedUserData: Partial<Question>[] =
                [{
                    slug: marketSlug,
                    url: null,
                    userProbability: +prob / 100,
                    marketCorrectionTime: correctionTime,
                    aggregator: "MANIFOLD",
                }
                    , ...userData];
            
            // TODO: add new row to database
            //setUserData(updatedUserData);
        }
    }

    const handleSlugInput = (event) => {
        setMarketSlug(event.target.value)
    }

    const handleProbInput = (event) => {
        setMarketProb(event.target.value)
    }

    const handleApiChange = (key) => {
      setApiKey(key);
    }

    const handleRefreshData = async () => {
        console.log("Refreshing data");
    }

    const refreshColumnAfterBet = async (slug) => {
        console.log("Refreshing column after bet", slug);
        const updatedUserData: Question[] = userData.filter((m) => m.url !== slug);
        setUserData(updatedUserData);
    }

    return (
        <div className="w-full">
            <div className="flex justify-center my-4">
                <div className="w-1/2 my-4">
                    <div className="w-full">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('manifold')}
                                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'manifold' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >    Manifold
                                </button>
                            </nav>
                        </div>
                        
                        {activeTab === 'advanced' && (
                            <div className="p-4">
                                <label htmlFor="market-search" className="block text-sm font-medium text-gray-700">
                                    Search markets to autofill:
                                </label>

                                <SearchManifold handleSelect={handleSearchSelect} processedData={processedData} />

                                <label htmlFor="market_slug" className="block text-sm font-medium text-gray-700">
                                    Slug:
                                </label>

                                <input
                                    id="market_slug"
                                    name="market_slug"
                                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={marketSlug}
                                    onChange={handleSlugInput}
                                />
                                <label htmlFor="market_prob" className="block text-sm font-medium text-gray-700">
                                    Probability (percentage):
                                </label>

                                <input
                                    id="market_prob"
                                    name="market_prob"
                                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={prob}
                                    onChange={handleProbInput}
                                />

                                <label htmlFor="correction-time" className="block text-sm font-medium text-gray-700">
                                    User Estimate of Market Correction Time:
                                </label>

                                <DatePicker
                                    id="correction-time"
                                    name="correctionTime"
                                    selected={correctionTime}
                                    onChange={handleCorrectionTimeChange}
                                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />

                                <LoadingButton passOnClick={addToTable} buttonText={"Add to table"} />
                            </div>
                        )}
                        
                    </div>

                    <ApiKeyInput onChange={handleApiChange} keyName="manifold" />
                    
                    <LoadingButton passOnClick={handleRefreshData} buttonText={"Refresh table"} />

                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">Bets done:</label>

                    <BetsDoneTextArea betsDoneData={betsDoneData} />

                    <div className='flex flex-wrap gap-2 m-2 mt-8'>
                        <Link href="https://github.com/Nathan-Tom/market-transfer" target='_blank' className="px-4 py-2 font-bold bg-green-500 rounded-full hover:bg-green-700">GitHub Repo (Feel free to make issues)</Link>
                        <Link href="https://chat.whatsapp.com/DKKQ5wESCOHGeN5nCFVotI" target='_blank' className="px-4 py-2 font-bold bg-green-500 rounded-full hover:bg-green-700">Say hi👋 or report bugs🐛 (whatsapp chat)</Link>
                    </div>
                </div>
            </div>
            <div className="my-4">
                <BettingTable userData={userData} tableData={processedData} setUserData={setUserData} apiKey={apiKey} addBetsDoneData={addBetsDoneData} refreshColumnAfterBet={refreshColumnAfterBet}/>
            </div>
        </div>
    );
}