import { userQuestion } from '@/lib/types';
import React, { useState } from 'react';

export default function FileHandler({ dataToSave, loadDataEndpoint }) {
    const [inputValue, setInputValue] = useState("");
   
    const handleSave = (userData) => {
        const blob = new Blob([JSON.stringify(userData)], {type: "application/json"});
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'automateBettingDataBackup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target.result === "string") {
                const data = JSON.parse(event.target.result);
                const filledInData = data.map((row: userQuestion) => {
                    // If marketCorrectionTime doesn't exist or isn't a valid Date, create a new one
                    if (!row.marketCorrectionTime || isNaN(new Date(row.marketCorrectionTime).getTime())) {
                      row.marketCorrectionTime = new Date();
                    }
                    return row;
                  });
                setInputValue(filledInData);
            }
        }
        reader.readAsText(file);
    }

    const handleLoadData = () => {
        loadDataEndpoint(inputValue);
    }

    return (
        <div className="p-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => {handleSave(dataToSave)}}>Save to File</button>
            <input className="mt-2" type="file" onChange={handleFileChange} /> 
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleLoadData}>Load from file</button>
        </div>
    );
}