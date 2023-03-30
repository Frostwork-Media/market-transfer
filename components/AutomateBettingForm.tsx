'use client';

import React, { useState } from 'react';
import { getMarketBySlug } from '@/lib/api';
import { buy, myWinChance } from '@/lib/probabilityCalculations';";

const parseSpreadsheetData = async (text) => {
    const rows = text.trim().split('\n');
    let data = [];

    for ( let row of rows ) {
        const columns = row.split('\t');
        const response = await getMarketBySlug(columns[0]);
        console.log(data);
        const roundedProbility = Math.round(response.probability * 1000) / 10; // 3 decimal places
        const buy = buy(respose.probability, myProbability);   
        data.push({
            slug: columns[0],
            questionTitle: response.question,
            marketProbability: `${roundedProbility}%`,
            buy: buy,
            myProbability: columns[1],
        });
    }
 
    return data;
}

export default function SpreadsheetForm() {
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState([]);

    const handleTextareaChange = (event) => {
        setRawData(event.target.value);
    };

    const handleParseData = async () => {
        try {
            const data = await parseSpreadsheetData(rawData);
            setParsedData(data);
        } catch (error) {
            console.log(error)
            alert('Error parsing the pasted data. Please ensure it is in the correct format.');
        }
    };

    return (
        <div className="w-full">
            <div className="my-4">
                <label htmlFor="spreadsheet-data" className="block text-sm font-medium text-gray-700">Paste Spreadsheet Data</label>
                <textarea
                    id="spreadsheet-data"
                    name="spreadsheet-data"
                    rows="5"
                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={rawData}
                    onChange={handleTextareaChange}
                ></textarea>
            </div>
            <div className="my-4">
                <button onClick={handleParseData} className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded">
                    Parse Data
                </button>
            </div>
            {parsedData.length > 0 && (
                <div className="my-4">
                    <h3 className="text-xl font-semibold">Parsed Data</h3>
                    <ul className="list-disc pl-5">
                        {parsedData.map((row, index) => (
                            <li key={index}>
                                {row.slug} - {row.questionTitle} - {row.marketProbability} - {row.myProbability}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}