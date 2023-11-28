'use client';

import React, { useEffect, useState } from 'react';
import { placeBetBySlug, getGroupIDbySlug, getMarketsByGroupID } from '@/lib/api';
//import calc from '@/lib/probabilityCalculations';
//import { floatToPercent, round2SF} from '@/lib/utils';

const getNumberOfMarketsByGroupSlug = async (groupSlug: string, number: number) => {
    const groupID = await getGroupIDbySlug(groupSlug);
    const markets = await getMarketsByGroupID(groupID);
    //randomize markets
    const randomMarkets = markets.sort(() => Math.random() - 0.5);
    //return first numbrer markets
    return randomMarkets.slice(0, number);
};

//Get 5 markets from Technical timelines
//Get 5 markets from Geopolitical

export default function Component() {
    const worldGroup = 'world-default';
    const technicalAITimelinesGroup = 'technical-ai-timelines';

    const [markets, setMarkets] = useState([]);

    const handleClick = async () => {
        const worldMarkets = await getNumberOfMarketsByGroupSlug(worldGroup, 5);
        const aiTimelinesMarkets = await getNumberOfMarketsByGroupSlug(technicalAITimelinesGroup, 5);
        setMarkets([...worldMarkets, ...aiTimelinesMarkets]);
    };

    return (
        <div className="w-full">
            <button
                className="px-4 py-2 font-bold bg-blue-500 rounded hover:bg-blue-700"
                onClick={handleClick}
            >
                Generate list
            </button>
            <div>
                {markets.map((market, index) => (
                    <p key={index}>{market.name}</p>
                ))}
            </div>
        </div>
    );
}