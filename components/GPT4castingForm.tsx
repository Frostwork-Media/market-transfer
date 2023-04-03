'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
//import calc from '@/lib/probabilityCalculations';
//import { floatToPercent, round2SF} from '@/lib/utils';

//Get 5 markets from Technical timelines
//Get 5 markets from Geopolitical

export default function SpreadsheetForm() {

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