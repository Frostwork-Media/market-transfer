import react from 'react';

export default function BetsDoneTextArea({betsDoneData}) {

    return (
        <textarea
            className="w-full h-32 bg-gray-100"
            key={JSON.stringify(betsDoneData)}
            value={
                betsDoneData
                  .slice() // Create a shallow copy of the array to avoid mutation
                  .reverse() // Reverse the array to show the newest value at the top
                  .map(
                    (entry) =>
                      `On market "${entry.slug}" bought ${entry.amountToPay} of ${entry.outcomeToBuy}`
                  )
                  .join('\n')
              }
            readOnly
        />
    )
}