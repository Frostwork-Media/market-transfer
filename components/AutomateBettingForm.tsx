'use client';

import React, { useState } from 'react';

function parseSpreadsheetData(text) {
    const rows = text.trim().split('\n');
    const data = rows.map(row => {
        const columns = row.split('\t');
        return {
            column1: columns[0],
            column2: columns[1]
        };
    });
    return data;
}

export default function SpreadsheetForm() {
    const [rawData, setRawData] = useState('');
    const [parsedData, setParsedData] = useState([]);

    const handleTextareaChange = (event) => {
        setRawData(event.target.value);
    };

    const handleParseData = () => {
        try {
            const data = parseSpreadsheetData(rawData);
            setParsedData(data);
        } catch (error) {
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
                                {row.column1} - {row.column2}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}