'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import * as calc from '../lib/probabilityCalculations';
import { floatToPercent, round2SF, extractSlugFromURL} from '@/lib/utils';
import LoadingButton from './LoadingButton';
import SearchManifold from './SearchManifold';


const sortData = (data, sortBy, direction) => {
    try{
        return data.sort((a, b) => {
            if(typeof a[sortBy] === 'string')
                return direction === 'asc' ? a[sortBy].localeCompare(b[sortBy]) : b[sortBy].localeCompare(a[sortBy]);
            
            if(typeof a[sortBy] === 'number')
                return direction === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
            
            return 0;
        });
    } catch (error) {
        console.log(error)
        console.log(data, sortBy, direction)
        alert('Error sorting data. Probably that there wasn\'t any data to sort.');
    }
    }


const updateParsedData = async (slug, myProbability) => {
    const response = await getMarketBySlug(slug);
    console.log("Market", response);
    const marketProbability = parseFloat(response.probability);
    const thingToBuy = calc.buyYes(response.probability, myProbability);
    const marketWinChance = calc.marketWinChance(response.probability, thingToBuy);
    const myWinChance = calc.myWinChance(myProbability, thingToBuy);
    const marketReturn = calc.marketReturn(marketWinChance);
    const kellyBetProportion = calc.kellyBetProportion(marketReturn, myProbability);
    const betEVreturn = calc.betEVreturn(marketWinChance, myWinChance);
    const betROI = calc.betROI(betEVreturn, marketWinChance);
    const roundedProbility = Math.round(response.probability * 1000) / 10; // 3 decimal places
    return {
        slug: slug,
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
        button: "",
        delete: ""
    }
}

const parseSpreadsheetData = async (text) => {
    const rows = text.trim().split('\n');
    let data = [];

    for (let row of rows) {
        const columns = row.split('\t');
        const myProbability = parseFloat(columns[1]) / 100;
        data.push(await updateParsedData(columns[0], myProbability));
    }
    console.log(data);
    sortData(data, 'betROI', 'desc');
    return data;
}

const TableHeaders = ({ data, sortFn, direction, sortBy }) => {
    const hasData = data && data.length > 0 && typeof data[0] === 'object';
    const emptyTable = [   
        {
            slug: "",
            title: "",
            marketP: 0,
            myP: 0,
            buy: "",
            //marketWinChance: marketWinChance,
            //myWinChance: myWinChance,
            marketReturn: 0,
            kellyPerc: 0,
            //betEVreturn: betEVreturn,
            rOI: 0,
            button: "",
            delete: ""
        }
    ]
    const keys = Object.keys(hasData ? data[0] : emptyTable[0]);

    return (
        <>
            {keys.map((title, i) => {
                if (sortBy === title)
                    return <th key={i} onClick={() => sortFn(title)} className="border px-4 py-2 cursor-pointer uppercase">{`${title} ${direction === 'asc' ? '▼' : '▲'} `}</th>

                return <th key={i} onClick={() => sortFn(title)} className="border px-4 py-2 cursor-pointer uppercase">{title}</th>
            })}
        </>
    )
};


export default function SpreadsheetForm() {
    const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_MANIFOLD_API_KEY || '');
    function MyTable() {}
    const [rows, setRows] = useState([]);
    const storedRawData = typeof window !== "undefined" ? window.localStorage.getItem('raw-data') : null;
    const storedParsedData =  typeof window !== "undefined" ? JSON.parse(window?.localStorage.getItem('parsed-data')) : null;
    const storedChosenMarkets = typeof window !== "undefined" ? JSON.parse(window?.localStorage.getItem('chosen-markets')) : null;
    const [rawData, setRawData] = useState(storedRawData || '');
    const [chosenMarkets, setChosenMarkets] = useState(storedChosenMarkets || []);
    const [parsedData, setParsedData] = useState(storedParsedData || []);
    const [sortBy, setSortBy] = useState('rOI');
    const [sortDirection, setSortDirection] = useState('desc');
    const [sortedData, setSortedData] = useState([]);

    const [selectedMarkets, setSelectedMarkets] = useState([]);

    const handleSelect = async (market) => {
        console.log("Selected market", market.url);
        if (parsedData.map((m) => m.slug).includes(extractSlugFromURL(market.url))) {
            console.log("Already added this market", market)
        } else {
            console.log("Adding this market", market)
            const updatedData = [await updateParsedData(extractSlugFromURL(market.url), 0), ...parsedData];
            console.log("Updating parsed data", extractSlugFromURL(market.url), 0);
            setParsedData(updatedData);
        }
    }; 


    const handleAPIKeyChange = (event) => {
        setApiKey(event.target.value);
    };

    function addRow() {
        const newRow = {
          id: rows.length + 1,
          name: `New row ${rows.length + 1}`,
          age: Math.floor(Math.random() * 100),
        };
        setRows([...rows, newRow]);
    }

    const handleDeleteRow = (index) => {
        const updatedData = [...parsedData];
        updatedData.splice(index, 1);
        setParsedData(updatedData);
        window?.localStorage.setItem('parsed-data', JSON.stringify(updatedData));
    };

    const handleTextareaChange = (event) => {
        setRawData(event.target.value);
        window?.localStorage.setItem('raw-data', event.target.value)
    };

    const handleParseData = async () => {
        try {
            const data = await parseSpreadsheetData(rawData);
            setParsedData(data);
            window?.localStorage.setItem('parsed-data', JSON.stringify(data))
        } catch (error) {
            console.log(error)
            alert('Error parsing the pasted data. Please ensure it is in the correct format.');
        }
    };

    const handleBet = (slug, outcomeToBuy, amountToPay) => {
        return placeBetBySlug(apiKey, slug, amountToPay, outcomeToBuy)
            .then(() => {
                alert(`Bet placed successfully!`);
                // then get updated probability and update the table
            })
            .catch((error) => {
                console.log(error)
                alert(`Error placing bet. ${error}`);
            });
    }

    const handleMyPChange = async (index, value) => {
        // Convert percentage value back to a float between 0 and 1
        const newMyProbability = parseFloat(value) / 100;
        const slug = parsedData[index].slug;
      
        // Call the updateParsedData function to get the updated row data
        const updatedRowData = await updateParsedData(slug, newMyProbability);
       
        setParsedData((oldData) => {
          const newRowData = [...oldData];
          
          // Update the row with the new data
          newRowData[index] = updatedRowData;
          
          return newRowData;
        });
        // Call handleSort to sort the data after updating parsedData
        const sorted = sortData(parsedData, "ROI", "desc");
        setSortedData(sorted);

      };

    const handleSort = (sortBy) => {
        setSortBy(sortBy);
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    useEffect(() =>{
        const sorted = sortData(parsedData, sortBy, sortDirection);
        setSortedData(sorted);
    }, [parsedData, sortBy, sortDirection])

    return (
        <div className="w-full">
            <div className="my-4">
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">Click entries to add them to the table:</label>
                <SearchManifold handleSelect={handleSelect} selectedMarket={selectedMarkets} />
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">API key (for auto betting)</label>
                <input
                    id="api-key"
                    name="api-key"
                    type="password"
                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={apiKey}
                    onChange={handleAPIKeyChange}
                />
                <LoadingButton onClick={handleParseData} className="my-4" buttonText={"Autobet 1000"} />
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">Bets done:</label>
                <textarea></textarea>

                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                           <TableHeaders data={parsedData} sortFn={handleSort} direction={sortDirection} sortBy={sortBy} />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">

                        {sortedData.map((row, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{row.slug}</td>
                                <td className="border px-4 py-2">{row.title}</td>
                                <td className="border px-4 py-2">{floatToPercent(row.marketP)}</td>
                                <td className="border px-4 py-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full text-center"
                                        value={row.myP * 100}
                                        onChange={(e) => handleMyPChange(index, e.target.value)}
                                    />
                                </td>
                                <td className="border px-4 py-2">{row.buy}</td>
                                {/*<td className="border px-4 py-2">{floatToPercent(row.marketWinChance)}</td>
                                    <td className="border px-4 py-2">{floatToPercent(row.myWinChance)}</td>*/}
                                <td className="border px-4 py-2">{round2SF(row.marketReturn)}</td>
                                <td className="border px-4 py-2">{round2SF(row.kellyPerc)}</td>
                                {/*<td className="border px-4 py-2">{round2SF(row.betEVreturn)}</td>*/}
                                <td className="border px-4 py-2">{round2SF(row.rOI)}</td>
                                <td><LoadingButton passOnClick={() => handleBet(row.slug, row.buy, 100)} classNames="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded" buttonText={"Bet M100"} /></td>
                                <td className="border px-4 py-2"><button onClick={() => handleDeleteRow(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button></td>
                            </tr>
                        ))}
                    </tbody>

                </table>
  
                <label htmlFor="spreadsheet-data" className="block text-sm font-medium text-gray-700">Paste Spreadsheet Data ([MM slug] then [probability in percent]) </label>
                <textarea
                    id="spreadsheet-data"
                    name="spreadsheet-data"
                    rows={5}
                    className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={rawData}
                    onChange={handleTextareaChange}
                ></textarea>


                <LoadingButton passOnClick={handleParseData} classNames="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded" buttonText={"Add spreadsheet data to table"} />
        </div>
        </div>
    );
}