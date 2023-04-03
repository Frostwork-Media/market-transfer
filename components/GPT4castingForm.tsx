'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
//import calc from '@/lib/probabilityCalculations';
//import { floatToPercent, round2SF} from '@/lib/utils';

const getNumberOfMarketsByGroupSlug = async (groupSlug: string, number: integer) => {
    const groupID = await getGroupIDbySlug(groupSlug);
    const markets = await getMarketsByGroupID(groupID);
    //randomize markets
    const randomMarkets = markets.sort(() => Math.random() - 0.5);
    //return first numbrer markets
    return randomMarkets.slice(0, number);
};

//Get 5 markets from Technical timelines
//Get 5 markets from Geopolitical

export default function Compontent() {
    const worldGroup = 'world-default';
    const technicalAITimelinesGroup = 'technical-ai-timelines';



    return (
        <div className="w-full">
            <button className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded">
                Generate list
            </button>
            <div>

            </div>
        </div>
    );
}