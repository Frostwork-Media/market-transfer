import React, { useState } from 'react';
import ApiKeyInput from './ApiKeyInput';

export default function Component() {
  const [question, setQuestion] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [resolutionCriteria, setResolutionCriteria] = useState();
  const [closeTime, setCloseTime] = useState();

  const handleInputChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = () => {
    // Implement your search functionality here
    // For demonstration purposes, I'll provide dummy data
    const dummyOutput = {
      resolution: 'Resolution criteria example',
      closeDate: '2025-12-31',
    };
    //setOutput(dummyOutput);
  };

  const handleApiChange = (key) => {
    setApiKey(key);
  }

  return (
    <div className="relative w-full">
      <div className="inline-flex">
        <input
          type="text"
          id="question"
          placeholder="How much solar energy will be produced in 2025?"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={question}
          onChange={handleInputChange}
        />
        <button
          onClick={handleSubmit}
          className="ml-2 p-2 bg-blue-500  rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          🔍
        </button>
      </div>

      <ApiKeyInput defaultKey={apiKey} onChange={handleApiChange} keyName="alphaiota-api-key" />

      <div className="mt-4">
        <h3>Resolution Criteria:</h3>
        <p>{resolutionCriteria}</p>
        <h3>Close Date:</h3>
        <p>{closeTime}</p>
      </div>
    </div>
  );
}