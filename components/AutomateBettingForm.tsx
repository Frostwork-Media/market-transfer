'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import * as calc from '../lib/probabilityCalculations';
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
        const kellyBetProportion = calc.kellyBetProportion(marketReturn, myProbability);
        const betEVreturn = calc.betEVreturn(marketWinChance, myWinChance);
        const betROI = calc.betROI(betEVreturn, marketWinChance);
        const roundedProbility = Math.round(response.probability * 1000) / 10; // 3 decimal places
        data.push({
            slug: columns[0],
            title: response.question,
            marketP: marketProbability,
            myP: myProbability,
            buy: thingToBuy ? "YES" : "NO",
            //marketWinChance: marketWinChance,
            //myWinChance: myWinChance,
            marketReturn: marketReturn,
            kellyPerc: kellyBetProportion,
            //betEVreturn: betEVreturn,
            rOI: betROI,
            button: ""
        });
    }
    sortData(data, 'betROI', 'desc')
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
    const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_MANIFOLD_API_KEY || '');
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [sortBy, setSortBy] = useState('slug');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedData, setSortedData] = useState([]);

    const handleAPIKeyChange = (event) => {
        setApiKey(event.target.value);
    };

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

    const handleBet = (slug, outcomeToBuy, amountToPay) => {
        console.log("Button clicked, attempting to place $", amountToPay, "on", outcomeToBuy, "for", slug)
        placeBetBySlug(apiKey, slug, amountToPay, outcomeToBuy);
    } 

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
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">API key</label>
                <textarea
                    id="api-key"
                    name="api-key"
                    rows={1}
                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={apiKey}
                    onChange={handleAPIKeyChange}
                ></textarea>
            </div>
            <div className="my-4">
                <label htmlFor="spreadsheet-data" className="block text-sm font-medium text-gray-700">Paste Spreadsheet Data</label>
                <textarea
                    id="spreadsheet-data"
                    name="spreadsheet-data"
                    rows={5}
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
                                    <td className="border px-4 py-2">{row.title}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.marketP)}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.myP)}</td>
                                    <td className="border px-4 py-2">{row.buy}</td>
                                    {/*<td className="border px-4 py-2">{floatToPercent(row.marketWinChance)}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.myWinChance)}</td>*/}
                                    <td className="border px-4 py-2">{round2SF(row.marketReturn)}</td>
                                    <td className="border px-4 py-2">{round2SF(row.kellyPerc)}</td>
                                    {/*<td className="border px-4 py-2">{round2SF(row.betEVreturn)}</td>*/}
                                    <td className="border px-4 py-2">{round2SF(row.rOI)}</td>
                                    <td className="border px-4 py-2"> <button onClick={() => handleBet(row.slug, row.buy, 100)} className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded">
                                        Bet M100
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}