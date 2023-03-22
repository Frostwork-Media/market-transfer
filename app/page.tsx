'use client';
import Image from 'next/image'
import { Inter } from 'next/font/google'
import Button from '../components/Button'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Home() {
  const [questionTitle, setQuestionTitle] = useState(null)
  const [questionCloseTime, setQuestionCloseTime] = useState(new Date());
  const [questionTextDescription, setQuestionTextDescription] = useState(null)
  const [slug, setSlug] = useState('');

  const handleInputChange = (event) => {
    setSlug(event.target.value);
  };

  const handleComplete = (data) => {
    setQuestionTitle(data.question);
    setQuestionCloseTime(data.closeTime);
    setQuestionTextDescription(data.textDescription);
  }

  const handleQuestionTitleChange = (event) => {
    setQuestionTitle(event.target.value);
  };

  const handleQuestionTextDescriptionChange = (event) => {
    setQuestionTextDescription(event.target.value);
  };

  const handleCopyToClipboard = () => {
    const copyText = `${questionTitle}\n\n${questionCloseTime.toLocaleString()}\n\n${questionTextDescription}`;
    console.log(copyText);
    navigator.clipboard.writeText(copyText).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <main>
      <div className="h-screen flex justify-center bg-white">
        <div className="flex flex-col sm:w-1/3">
          <div className="relative w-full my-auto">
            <div className='inline-flex'>
              <input
                type="text"
                id="search"
                placeholder="Enter slug"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={slug}
                onChange={handleInputChange} 
              />
              <Button
                handleComplete={handleComplete}
                slug={slug}
              />
            </div>
            <div> 
              <div className="my-4">
                <label htmlFor="question-title" className="block text-sm font-medium text-gray-700">Question Title</label>
                <textarea
                  id="question-title"
                  name="question-title"
                  rows="1"
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={questionTitle || ''}
                  onChange={handleQuestionTitleChange}
                ></textarea>
              </div>
              <div className="my-4">
                <label htmlFor="question-close-time" className="block text-sm font-medium text-gray-700">Question Close Time</label>
                <DatePicker
                  id="question-close-time"
                  name="question-close-time"
                  className="block mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  selected={questionCloseTime}
                  onChange={(date) => setQuestionCloseTime(date)}
                />
              </div>
              <div className="my-4">
                <label htmlFor="question-text" className="block text-sm font-medium text-gray-700">Question Description</label>
                <textarea
                  id="question-text"
                  name="question-text"
                  rows="5"
                  className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={questionTextDescription || ''}
                  onChange={handleQuestionTextDescriptionChange}
                ></textarea>
              </div>
              <div className="my-4">
                <button onClick={handleCopyToClipboard} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}