'use client';

import React, { useEffect, useState } from 'react';
import { getMarketBySlug, placeBetBySlug } from '@/lib/api';
import { floatToPercent, round2SF, extractSlugFromURL } from '@/lib/utils';
import LoadingButton from './LoadingButton';
import DebouncedPercentageInput from './DebouncedPercentageInput';

export default function BettingTable({processedData, setUserData, apiKey, addBetsDoneData, userData}){

    console.log('Mounting betting table')

    const headings = [
            "Slug",
            "Title",
            "Market P",
            "My P",
            "Buy",
            "Market return",
            "Kelly %",
            "ROI",
            "", // button
            "" // delete
        ];

    const handleMyPChange = async (slug, value) => {
        // Convert percentage value back to a float between 0 and 1
        console.log("handleMyPChange: ", slug, value);
        const newUserProbability = parseFloat(value) / 100;
        const newRow = { slug: slug, userProbability: newUserProbability };
        // Update the user data
        const updatedUserData = processedData.map((row) => {
            if (row.slug === slug) {
                return newRow;
            }
            return row;
        });
        setUserData(updatedUserData);
    };

    const handleDeleteRow = (slug) => {
        const updatedData = [...processedData];
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

    const handleBet = (slug, outcomeToBuy, amountToPay) => {
        return placeBetBySlug(apiKey, slug, amountToPay, outcomeToBuy)
            .then(() => {
                addBetsDoneData(slug, outcomeToBuy, amountToPay);
                userData; //for UseEffect
            })
            .catch((error) => {
                console.log(error)
                alert(`Error placing bet. ${error}`);
            });
    }

    return (
        <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                {headings.map((heading, i) => {
                    return <th key={i} className="border px-4 py-2 uppercase">{heading}</th>
                })}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

                {processedData.map((row) => (
                    <tr key={row.slug}>
                        <td className="border px-4 py-2">{row.slug}</td>
                        <td className="border px-4 py-2">{row.title}</td>
                        <td className="border px-4 py-2">{floatToPercent(row.marketP)}</td>
                        <td className="border px-4 py-2">
                            <DebouncedPercentageInput
                                slug={row.slug}
                                initialValue={row.userProbability * 100}
                                onDebouncedChange={handleMyPChange}
                            />
                        </td>
                        <td className="border px-4 py-2">{row.buy}</td>
                        {/*<td className="border px-4 py-2">{floatToPercent(row.marketWinChance)}</td>
                        <td className="border px-4 py-2">{floatToPercent(row.myWinChance)}</td>*/}
                        <td className="border px-4 py-2">{round2SF(row.marketReturn)}</td>
                        <td className="border px-4 py-2">{round2SF(row.kellyPerc)}</td>
                        {/*<td className="border px-4 py-2">{round2SF(row.betEVreturn)}</td>*/}
                        <td className="border px-4 py-2">{round2SF(row.rOI)}</td>
                        <td><LoadingButton passOnClick={() => handleBet(row.slug, row.buy, 100)} buttonText={"Bet M100"} /></td>
                        <td className="border px-4 py-2"><button onClick={() => handleDeleteRow(row.slug)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button></td>
                    </tr>
                ))}
            </tbody>

        </table>

    )
}
