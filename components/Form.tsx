'use client';

import React, { useState } from 'react';
import { getMarketBySlug } from '../lib/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Component() {
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

    const handleSubmit = async () => {
        if (slug.includes('http') || slug.includes('https')) {
            return alert('Please enter a slug, not a URL')
        }
        //get data from search
        const data = await getMarketBySlug(slug);
        const closeTime = new Date(data.closeTime);
        let output = {
            question: data.question,
            closeTime: closeTime,
            textDescription: data.textDescription
        }
        handleComplete(output)
    }

    return (
        <div className="h-screen flex justify-center">
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
                        <button onClick={handleSubmit} className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >🔍</button>

                    </div>
                    <div>
                        <div className="my-4">
                            <label htmlFor="question-title" className="block text-sm font-medium text-gray-700 ">Question Title</label>
                            <textarea
                                id="question-title"
                                name="question-title"
                                rows="1"
                                className="block w-full mt-1 border border-gray-200 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={questionTitle || ''}
                                onChange={handleQuestionTitleChange}
                            ></textarea>
                        </div>
                        <div className="my-4">
                            <label htmlFor="question-close-time" className="block text-sm font-medium text-gray-700">Question Close Time</label>
                            <DatePicker
                                id="question-close-time"
                                name="question-close-time"
                                className="block mt-1 border border-gray-200 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                className="block w-full mt-1 border border-gray-200 text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
    )
}