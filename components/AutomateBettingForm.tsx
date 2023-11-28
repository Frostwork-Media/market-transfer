"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getQuestionsFromDatabase,
  getManifoldMarketBySlug,
  sendQuestionsToDatabase,
  getInsightMarketByMarketId,
  Market,
} from "@/lib/api";
import { extractMarketIdFromInsightURL, extractSlugFromURL } from "@/lib/utils";
import LoadingButton from "./LoadingButton";
import SearchManifold from "./SearchManifold";
import BettingTable from "./BettingTable";
import BetsDoneTextArea from "./BetsDoneTextArea";
import Link from "next/link";
import ApiKeyInput from "./ApiKeyInput";
import { UserQuestionDatum, frontendQuestion } from "@/lib/types";
import { Question_aggregator } from "@prisma/client";
import DatePicker from "react-datepicker";
import {
  calculateBettingStatisticsFromUserAndMarketData,
  sortData,
} from "../lib/probabilityCalculations";
import "react-datepicker/dist/react-datepicker.css";

export default function AutomateBettingForm() {
  const [apiKey, setApiKey] = useState("");
  const [betsDoneData, setBetsDoneData] = useState([]);
  const [aggregator, setAggregator] = useState<Question_aggregator>("MANIFOLD");
  const [marketURL, setMarketURL] = useState("");
  const [prob, setMarketProb] = useState(50);
  const [userData, setUserData] = useState<UserQuestionDatum[]>([]);
  const [activeTab, setActiveTab] = useState("manifold");
  const [correctionTime, setCorrectionTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleCorrectionTimeChange = (date) => {
    setCorrectionTime(date);
  };

  const addBetsDoneData = async (slug, outcomeToBuy, amountToPay) => {
    const nextRow = {
      slug: slug,
      outcomeToBuy: outcomeToBuy,
      amountToPay: amountToPay,
    };
    console.log("Adding row to bets done data", nextRow);
    setBetsDoneData((prevBetsDoneData) => [...prevBetsDoneData, nextRow]);
    console.log("Bets done data", betsDoneData);
  };

  const handleSearchSelect = async (market) => {
    setMarketURL(market.url);
    setMarketProb(market.probability * 100);
  };

  // On page load, get the questions from the database and set them to userData.
  // Also fetch the api key from localStorage and set it to apiKey.

  useEffect(() => {
    console.log("Getting stored data");
    const fetchData = async () => {
      let response = await getQuestionsFromDatabase();
      const results = await response.json();
      return results;
    };
    fetchData().then((data) => (data ? setUserData(data) : null));
    const storedApiKey = window.localStorage.getItem("api-key");

    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // For every slug / market ID in userData, get each market. `markets` is then a map from
  // `aggregator-slug/id` to market.

  const slugsByAggregator = useMemo<Record<Question_aggregator, string[]>>(
    () =>
      userData.reduce((arr, m) => {
        if (arr[m.aggregator]) {
          arr[m.aggregator].push(m.slug);
        } else {
          arr[m.aggregator] = [m.slug];
        }
        return arr;
      }, {} as Record<Question_aggregator, string[]>),
    [userData]
  );

  const [markets, setMarkets] = useState<Record<string, Market>>({});

  useEffect(() => {
    if (Object.keys(slugsByAggregator).length === 0) {
      return;
    }

    setIsLoading(true);

    (async () => {
      const AGGREGATOR_LOAD_ORDER: any[] = [Question_aggregator.MANIFOLD, Question_aggregator.INSIGHT];
      const sortedAggregatorKeys = Object.keys(slugsByAggregator).sort(
        (a, b) => AGGREGATOR_LOAD_ORDER.indexOf(a as Question_aggregator) - AGGREGATOR_LOAD_ORDER.indexOf(b as Question_aggregator)
      );

      for (const aggregator of sortedAggregatorKeys) {
        const slugs = slugsByAggregator[aggregator as Question_aggregator];
        for (const slug of slugs) {
          if (aggregator === Question_aggregator.MANIFOLD) {
            const market = await getManifoldMarketBySlug(slug);
            setMarkets((markets) => ({
              ...markets,
              [`${aggregator}-${slug}`]: market,
            }));
          } else if (aggregator === Question_aggregator.INSIGHT) {
            const market = await getInsightMarketByMarketId(slug);
            setMarkets((markets) => ({
              ...markets,
              [`${aggregator}-${slug}`]: market,
            }));
          } else {
            throw new Error("Unknown aggregator");
          }
        }
      }

      setIsLoading(false);
    })();
  }, [slugsByAggregator]);

  // Now we have the user data and the market data, we can calculate the processed data.

  const processedData = useMemo<frontendQuestion[]>(() => {
    let processedData = [];
    for (const data of userData) {
      const market = markets[`${data.aggregator}-${data.slug}`];
      if (!market) {
        continue;
      }
      processedData.push(
        calculateBettingStatisticsFromUserAndMarketData(
          data,
          { buyYes: market.buyYes, buyNo: market.buyNo },
          market.title
        )
      );
    }

    const sortedProcessedData = sortData(processedData, "rOIOverTime", "desc");

    return sortedProcessedData;
  }, [userData, markets]);

  // two more things missing:
  //  - sending updated data to database

  const setUserDataAndPersist = useCallback(
    async (newQuestions: UserQuestionDatum[]) => {
      setUserData(newQuestions);
      await sendQuestionsToDatabase(newQuestions);
    },
    []
  );

  const addToTable = (event) => {
    let marketSlugOrId: string;
    if (aggregator === Question_aggregator.MANIFOLD) {
      marketSlugOrId = extractSlugFromURL(marketURL);
    } else if (aggregator === Question_aggregator.INSIGHT) {
      marketSlugOrId = extractMarketIdFromInsightURL(marketURL);
    } else {
      marketSlugOrId = marketURL;
    }
    if (!processedData.map((m) => m.slug).includes(marketSlugOrId)) {
      const updatedUserData: UserQuestionDatum[] = [
        {
          slug: marketSlugOrId,
          url: marketURL,
          userProbability: +prob / 100,
          marketCorrectionTime: correctionTime,
          aggregator: aggregator,
          broadQuestionId: null,
        },
        ...userData,
      ];

      setUserDataAndPersist(updatedUserData);
    }
  };

  const handleAggregatorChange = (event) => {
    setAggregator(event.target.value);
  };

  const handleURLInput = (event) => {
    setMarketURL(event.target.value);
  };

  const handleProbInput = (event) => {
    setMarketProb(event.target.value);
  };

  const handleApiChange = (key) => {
    setApiKey(key);
  };

  const handleRefreshData = async () => {
    console.log("Refreshing data");
  };

  const refreshColumnAfterBet = async (slug) => {
    console.log("Refreshing column after bet", slug);
    const updatedUserData: UserQuestionDatum[] = userData.filter(
      (m) => m.url !== slug
    );
    setUserData(updatedUserData);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center my-4">
        <div className="w-1/2 my-4">
          <div className="w-full">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("manifold")}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === "manifold"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {" "}
                  Manifold Bets
                </button>
                <button
                  onClick={() => setActiveTab("add-market")}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === "add-market"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {" "}
                  Add Market
                </button>
              </nav>
            </div>
            {activeTab === "manifold" && (
              <div className="p-4">
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bets done:
                </label>

                <BetsDoneTextArea betsDoneData={betsDoneData} />
              </div>
            )}
            {activeTab === "add-market" && (
              <div className="p-4">
                <label
                  htmlFor="market-search"
                  className="block text-sm font-medium text-gray-700"
                >
                  Search markets to autofill:
                </label>

                <SearchManifold
                  handleSelect={handleSearchSelect}
                  processedData={processedData}
                />

                <label
                  htmlFor="aggregator"
                  className="block text-sm font-medium text-gray-700"
                >
                  Aggregator:
                </label>

                <select
                  id="aggregator"
                  name="aggregator"
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={aggregator}
                  onChange={handleAggregatorChange}
                >
                  <option value="MANIFOLD">MANIFOLD</option>
                  <option value="INSIGHT">INSIGHT</option>
                </select>

                {/* market selection dropdown */}

                <label
                  htmlFor="market_URL"
                  className="block text-sm font-medium text-gray-700"
                >
                  Market URL:
                </label>

                <input
                  id="market_URL"
                  name="market_URL"
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={marketURL}
                  onChange={handleURLInput}
                />

                <label
                  htmlFor="market_prob"
                  className="block text-sm font-medium text-gray-700"
                >
                  Probability (percentage):
                </label>

                <input
                  id="market_prob"
                  name="market_prob"
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={prob}
                  onChange={handleProbInput}
                />

                <label
                  htmlFor="correction-time"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Estimate of Market Correction Time:
                </label>

                <DatePicker
                  id="correction-time"
                  name="correctionTime"
                  selected={correctionTime}
                  onChange={handleCorrectionTimeChange}
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

                <LoadingButton
                  passOnClick={addToTable}
                  buttonText={"Add to table"}
                />
              </div>
            )}
          </div>

          <ApiKeyInput onChange={handleApiChange} keyName="manifold" />

          <LoadingButton
            passOnClick={handleRefreshData}
            buttonText={"Refresh table"}
          />

          <div className="flex flex-wrap gap-2 m-2 mt-8">
            <Link
              href="https://github.com/Nathan-Tom/market-transfer"
              target="_blank"
              className="px-4 py-2 font-bold bg-green-500 rounded-full hover:bg-green-700"
            >
              GitHub Repo (Feel free to make issues)
            </Link>
            <Link
              href="https://chat.whatsapp.com/DKKQ5wESCOHGeN5nCFVotI"
              target="_blank"
              className="px-4 py-2 font-bold bg-green-500 rounded-full hover:bg-green-700"
            >
              Say hi👋 or report bugs🐛 (whatsapp chat)
            </Link>
          </div>
        </div>
      </div>
      <div className="my-4">
        <BettingTable
          userData={userData}
          tableData={processedData}
          setUserData={setUserDataAndPersist}
          apiKey={apiKey}
          addBetsDoneData={addBetsDoneData}
          refreshColumnAfterBet={refreshColumnAfterBet}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
