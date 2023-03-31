'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug } from '@/lib/api';
import calc from '@/lib/probabilityCalculations';
import { floatToPercent, round2SF} from '@/lib/utils';

const sortData = (data, sortBy, direction) => {
    return data.sort((a, b) => {
        if(typeof a[sortBy] === 'string')
            return direction === 'asc' ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy]);
        
        if(typeof a[sortBy] === 'number')
            return direction === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
        
        return 0;
    });
};


const parseSpreadsheetData = async (text) => {
    const rows = text.trim().split('\n');
    let data = [];

    for ( let row of rows ) {
        const columns = row.split('\t');
        const response = await getMarketBySlug(columns[0]);
        const myProbability = parseFloat(columns[1])/100;
        const marketProbability = parseFloat(response.probability);
        const thingToBuy = calc.buyYes(response.probability, myProbability);   
        const marketWinChance = calc.marketWinChance(response.probability, thingToBuy);
        const myWinChance = calc.myWinChance(myProbability, thingToBuy);
        const marketReturn = calc.marketReturn(marketWinChance);
        const kellyBetProportion = calc.kellyBetProportion(marketReturn, myProbability, thingToBuy);
        const betEVreturn = calc.betEVreturn(marketWinChance, myWinChance);
        const betROI = calc.betROI(betEVreturn, marketWinChance);
        const roundedProbility = Math.round(response.probability * 1000) / 10; // 3 decimal places
        data.push({
            slug: columns[0],
            questionTitle: response.question,
            marketProbability: marketProbability,
            myProbability: myProbability,
            thingToBuy: thingToBuy ? "Yes" : "No",
            marketWinChance: marketWinChance,
            myWinChance: myWinChance,
            marketReturn: marketReturn,
            kellyBetProportion: kellyBetProportion,
            betEVreturn: betEVreturn,
            betROI: betROI,
        });
    }
    return data;
}

const TableHeaders = ({data, sortFn, direction, sortBy}) => {
    const keys = Object.keys(data[0])

    return (
        <>
            {keys.map((title, i) => {
                if(sortBy === title)
                    return <th key={i} onClick={() => sortFn(title)} className="border px-4 py-2 cursor-pointer uppercase">{`${title} ${direction === 'asc' ? '▲' : '▼'} `}</th>
                
                return <th key={i} onClick={() => sortFn(title)} className="border px-4 py-2 cursor-pointer uppercase">{title}</th>
            })}
        </>
    )
}

export default function SpreadsheetForm() {
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [sortBy, setSortBy] = useState('slug');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedData, setSortedData] = useState([]);

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

    const handleSort = (sortBy) => {
        setSortBy(sortBy);
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    useEffect(() => {
        const sorted = sortData(parsedData, sortBy, sortDirection);
        setSortedData(sorted);
    },[parsedData, sortBy, sortDirection])

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
            {sortedData.length > 0 && (
                <div className="my-4 overflow-scroll w-full max-w-5xl"> 
                    <h3 className="text-xl font-semibold">Parsed Data</h3>
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <TableHeaders data={parsedData} sortFn={handleSort} direction={sortDirection} sortBy={sortBy}/>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{row.slug}</td>
                                    <td className="border px-4 py-2">{row.questionTitle}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.marketProbability)}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.myProbability)}</td>
                                    <td className="border px-4 py-2">{row.thingToBuy}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.marketWinChance)}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.myWinChance)}</td>
                                    <td className="border px-4 py-2">{round2SF(row.marketReturn)}</td>
                                    <td className="border px-4 py-2">{round2SF(row.kellyBetProportion)}</td>
                                    <td className="border px-4 py-2">{round2SF(row.betEVreturn)}</td>
                                    <td className="border px-4 py-2">{round2SF(row.betROI)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}