'use client';

import React, { useState } from 'react';
import { getManifoldMarketBySlug } from '../lib/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { objectToParams } from '../lib/utils'

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
        let value;
        
        const isUrl = /^(?:https?:\/\/)?(?:www\.)?[^\s]+\.[^\s]+$/
        
        if (isUrl.test(slug)) {
            value = slug.split('/').pop();
        } else {
            value = slug;
        }

        if(!value) return alert('Please enter a slug or url')
        //get data from search
        const data = await getManifoldMarketBySlug(value);
        const closeTime = new Date(data.closeTime);
        let output = {
            question: data.question,
            closeTime: closeTime,
            textDescription: data.textDescription
        }
        handleComplete(output)
    }

    return (

                <div className="relative w-full">
                    <div className='inline-flex'>
                        <input
                            type="text"
                            id="search"
                            placeholder="Enter slug or url"
                            className="block w-full py-2 pl-10 pr-3 leading-5 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={slug}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleSubmit} className="p-2 ml-2 bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >🔍</button>

                    </div>
                    <div>
                        <div className="my-4">
                            <label htmlFor="question-title" className="block text-sm font-medium text-gray-700 ">Question Title</label>
                            <textarea
                                id="question-title"
                                name="question-title"
                                rows={1}
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
                                rows={1}
                                className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={questionTextDescription || ''}
                                onChange={handleQuestionTextDescriptionChange}
                            ></textarea>
                        </div>
                        <div className="my-4">
                            <button onClick={handleCopyToClipboard} className="px-4 py-2 mt-4 font-bold bg-blue-500 rounded hover:bg-blue-700">
                                Copy to Clipboard
                            </button>
                            <button
                                className="px-4 py-2 mt-4 font-bold bg-blue-500 rounded hover:bg-blue-700"
                                onClick={() => {
                                    const manifoldParams = objectToParams({
                                        q: questionTitle,
                                        description: {
                                            content: [
                                                {
                                                    type: "paragraph",
                                                    content: [
                                                      {
                                                        type: "text",
                                                        text: questionTextDescription
                                                      }
                                                    ]
                                                }
                                            ],
                                            type: 'doc',
                                        },
                                        outcomeType: 'BINARY',
                                        visibility: 'public'
                                    })
                                    const url = `https://manifold.markets/create?${manifoldParams}`;
                                    window.open(url, "_blank");
                                }}
                            >
                                Post to Manifold
                            </button>
                        </div>
                    </div>
                </div>
 
    )
}