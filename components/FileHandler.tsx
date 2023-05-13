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
            const data = JSON.parse(event.target.result);
            setInputValue(data);
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