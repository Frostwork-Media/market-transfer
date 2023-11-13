'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import { floatToPercent, round2SF, round4SF, extractSlugFromURL } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import DebouncedPercentageInput from './DebouncedPercentageInput';
import RowDatePicker from './RowDatePicker';
import { Question } from '@prisma/client';

export default function BettingTable({tableData, setUserData, apiKey, addBetsDoneData, userData, refreshColumnAfterBet}){
    console.log("Mounting betting table with data", tableData);

    const headings = [
            "Title",
            "Aggregator",
            "Mrkt %",
            "My %",
            "Market Correction",
            "Buy",
            "Return",
            "Kelly %",
            "ROI",
            "ROI per day",
            "", // button
            "" // delete
        ];

    const handleMyPChange = async (slug, value) => {
        // Convert percentage value back to a float between 0 and 1
        const newUserProbability = parseFloat(value) / 100;
        const newRow: Partial<Question> = {
            slug: slug,
            url: tableData.find(row => row.slug === slug).url || null,
            userProbability: newUserProbability, 
            marketCorrectionTime: tableData.find(row => row.slug === slug).correctionTime,
            aggregator: tableData.find(row => row.slug === slug).aggregator, 
        };
            
        // Update the user data
        const updatedUserData = tableData.map((row) => {
            if (row.slug === slug) {
                return newRow;
            }
            return row;
        });
        setUserData(updatedUserData);
    };

    const handleDeleteRow = (slug) => {
        const updatedData = [...tableData];
        const index = updatedData.findIndex(row => row.slug === slug);
        updatedData.splice(index, 1);
        
        // Transform the data
        const transformedData = updatedData.map((item) => {
            return {
                slug: item.slug,
                userProbability: item.userProbability,
            };
        });
        console.log("Data after delete: ", transformedData);
        setUserData(transformedData);
    };

    const handleBet = async (slug, outcomeToBuy, amountToPay) => {
        await placeBetBySlug(apiKey, slug, amountToPay, outcomeToBuy)
            .then(() => {
                addBetsDoneData(slug, outcomeToBuy, amountToPay);
                console.log("Bet placed successfully on ", slug, outcomeToBuy, amountToPay);
                refreshColumnAfterBet(slug)
            })
            .catch((error) => {
                console.log(error)
                alert(`Error placing bet. ${error}`);
            });
    }

    return (
        <div style={{ overflowX: 'auto' }}>
        <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                {headings.map((heading, i) => {
                    return <th key={i} className="px-4 py-2 uppercase border">{heading}</th>
                })}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

                {tableData.map((row) => (
                    <tr key={row.slug}>
                        <td className="px-4 py-2 whitespace-normal border"><a href={row.url} target="_blank" rel="noopener noreferrer">{row.title}</a></td>
                        <td className="px-4 py-2 border">{row.aggregator}</td>
                        <td className="px-4 py-2 border">{floatToPercent(row.marketProbability)}</td>
                        <td className="w-32 px-4 py-2 border">
                            <DebouncedPercentageInput
                                slug={row.slug}
                                initialValue={row.userProbability * 100}
                                onDebouncedChange={handleMyPChange}
                            />
                        </td>
                        <td className="px-4 py-2 border">
                            <RowDatePicker
                                id={"market-correction-time"+row.slug}
                                name="correctionTime"
                                selected={row.correctionTime}
                                slug={row.slug}
                                setUserData={setUserData}
                                tableData={tableData}
                                className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </td>
                        <td className="px-4 py-2 border">{row.buy}</td>
                        {/*<td className="px-4 py-2 border">{floatToPercent(row.marketWinChance)}</td>
                        <td className="px-4 py-2 border">{floatToPercent(row.myWinChance)}</td>*/}
                        <td className="px-4 py-2 border">{round2SF(row.marketReturn)}</td>
                        <td className="px-4 py-2 border">{round2SF(row.kellyPerc)}</td>
                        {/*<td className="px-4 py-2 border">{round2SF(row.betEVreturn)}</td>*/}
                        <td className="px-4 py-2 border">{round2SF(row.rOI)}</td>
                        <td className="px-4 py-2 border">{round4SF(row.rOIOverTime)}</td>
                        <td><LoadingButton passOnClick={() => handleBet(row.slug, row.buy, 100)} buttonText={"Bet M100"} /></td>
                        <td className="px-4 py-2 border"><button onClick={() => handleDeleteRow(row.slug)} className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700">Delete</button></td>
                    </tr>
                ))}
            </tbody>

        </table>
        </div>

    )
}
