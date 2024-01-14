import React from "react";
import { placeBetBySlug } from "@/lib/api";
import { floatToPercent, round2SF, round4SF } from "@/lib/utils";
import LoadingButton from "./LoadingButton";
import DebouncedInput from "./DebouncedInput";
import RowDatePicker from "./RowDatePicker";
import { Question_aggregator } from "@prisma/client";
import {
  frontendQuestion,
  frontendQuestionToUserQuestionDatum,
  UserQuestionDatum,
} from "@/lib/types";

export default function BettingTable({
  tableData,
  setUserData,
  apiKey,
  addBetsDoneData,
  refreshColumnAfterBet,
  isLoading,
}: {
  tableData: frontendQuestion[];
  setUserData: (userData: UserQuestionDatum[]) => Promise<void>;
  apiKey: any;
  addBetsDoneData: any;
  refreshColumnAfterBet: any;
  isLoading: boolean;
}) {
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
    "Max bet",
    "Amount Invested",
    "Action",
    "ROI",
    "ROI per day",
    "", // button
    "", // delete
  ];

  const handleMyPChange = async (slug, value) => {
    // Convert percentage value back to a float between 0 and 1
    const newUserProbability = parseFloat(value) / 100;
    const updatedUserData = tableData.map((row) => {
      if (row.slug === slug) {
        return {
          ...row,
          userProbability: newUserProbability,
        };
      }
      return row;
    });
    setUserData(updatedUserData.map(frontendQuestionToUserQuestionDatum));
  }

  const handleDateChange = async (slug, newDate) => {
    console.log("Date change table data");
    console.log(tableData);
    const updatedUserData = tableData.map((row) => {
      if (row.slug === slug) {
        return {
          ...row,
          marketCorrectionTime: newDate,
        };
      }
      console.log("Row", row);
      return row;
    });
    setUserData(updatedUserData.map(frontendQuestionToUserQuestionDatum));
  };

  const handleAmountInvestedChange = async (slug, value) => {
    console.log("Amount invests data", tableData);
    const updatedData = tableData.map((row) => {
      if (row.slug === slug) {
        return {
          ...row,
          singleBetCurrentInvestment: parseFloat(value),
          };
        }
        return row;
      }
    );
    console.log("Amount invested change", updatedData);
    setUserData(updatedData.map(frontendQuestionToUserQuestionDatum));
  }

  const handleDeleteRow = (slug) => {
    console.log("Deleting row", slug);
    const updatedData = [...tableData];
    const index = updatedData.findIndex((row) => row.slug === slug);
    updatedData.splice(index, 1);

    setUserData(updatedData.map(frontendQuestionToUserQuestionDatum));
  };

  const handleBet = async (slug, outcomeToBuy, amountToPay) => {
    await placeBetBySlug(apiKey, slug, amountToPay, outcomeToBuy)
      .then(() => {
        addBetsDoneData(slug, outcomeToBuy, amountToPay);
        console.log(
          "Bet placed successfully on ",
          slug,
          outcomeToBuy,
          amountToPay
        );
        refreshColumnAfterBet(slug);
      })
      .catch((error) => {
        console.log(error);
        alert(`Error placing bet. ${error}`);
      });
  };

  console.log("Rendering betting table with data", tableData);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headings.map((heading, i) => {
              return (
                <th key={i} className="px-4 py-2 uppercase border">
                  {heading}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((row) => (
            <tr key={row.slug}>
              <td className="px-4 py-2 whitespace-normal border">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {row.title}
                </a>
              </td>
              <td className="px-4 py-2 border">{row.aggregator}</td>
              <td className="px-4 py-2 border">
                {row.aggregator === Question_aggregator.MANIFOLD ? (
                  floatToPercent(row.marketProbabilities.buyYes)
                ) : (
                  <>
                    {floatToPercent(row.marketProbabilities.buyYes)} /{" "}
                    {floatToPercent(1 - row.marketProbabilities.buyNo)}
                  </>
                )}
              </td>
              <td className="w-32 px-4 py-2 border">
                <DebouncedInput
                  slug={row.slug}
                  initialValue={Number((row.userProbability * 100).toFixed(2))}
                  onDebouncedChange={handleMyPChange}
                />
              </td>
              <td className="px-4 py-2 border">
                <RowDatePicker
                  name="correctionTime"
                  selected={row.marketCorrectionTime}
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onChange={(newDate) => handleDateChange(row.slug, newDate)}
                />
              </td>
              <td className="px-4 py-2 border">{row.buy}</td>
              <td className="px-4 py-2 border">{round2SF(row.marketReturn)}</td>
              <td className="px-4 py-2 border">{round2SF(row.kellyPerc)}</td>
              <td className="px-4 py-2 border">{round2SF(row.maxKellyBet)}</td>
              <td className="w-32 px-4 py-2 border">
                <DebouncedInput
                  slug={row.slug}
                  initialValue={round2SF(row.singleBetCurrentInvestment)}
                  onDebouncedChange={handleAmountInvestedChange}
                />
              </td>
              <td className="px-4 py-2 border">{row.betAction}</td>
              <td className="px-4 py-2 border">{round2SF(row.rOI)}</td>
              <td className="px-4 py-2 border">{round4SF(row.rOIOverTime)}</td>
              <td>
                <LoadingButton
                  passOnClick={() => handleBet(row.slug, row.buy, 100)}
                  buttonText={"Bet M100"}
                />
              </td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleDeleteRow(row.slug)}
                  className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {isLoading && (
            <tr>
              <td className="p-4" colSpan={headings.length}>
                Loading...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
