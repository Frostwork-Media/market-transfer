'use client';
import Image from 'next/image'
import { Inter } from 'next/font/google'
import Button from '../components/Button'
import { useState } from 'react'

export default function Home() {
  const [ questionTitle, setQuestionTitle ] = useState(null)
  const [ questionCloseTime, setQuestionCloseTime ] = useState(null)
  const [ questionTextDescription, setQuestionTextDescription ] = useState(null)

  const handleComplete = (data) => {
    setQuestionTitle(data.question);
    setQuestionCloseTime(data.closeTime);
    setQuestionTextDescription(data.textDescription);
  }

  return (
    <main>
      <div className="h-screen flex flex-col justify-center items-center bg-white">
        <div className="relative w-full sm:w-1/3">
          <input
          type="text"
          id="search"
          placeholder="..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          //value={searchTerm}
          //onChange={handleInputChange} 
          />
        <Button handleComplete={handleComplete} className="mt-4 px-6 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"className="mt-4 px-6 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"/>
        <div>
          <input
            type="text"
            value={questionTitle || ''}
          />
          <input
            type="text"
            value={questionCloseTime || ''}
          />
          <input
            type="text"
            value={questionTextDescription || ''}
          />
        </div>
        </div>
      </div>
    </main>
  )
}
