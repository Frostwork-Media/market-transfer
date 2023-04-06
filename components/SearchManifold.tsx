import { searchMarket } from '../lib/api'
import { useState } from 'react'
import Image from 'next/image'
export default function Search({ handleSelect, selectedMarkets }) {
    const [results, setResults] = useState([])
    const [isResultsVisible, setIsResultsVisible] = useState(false);

    const handleSearch = async (e) => {
        const term = e.target.value
        try {
            const results = await searchMarket(term)
            console.log(results)
            setResults(results.slice(0, 10))
        } catch (error) {
            alert(`error: ${error}`)
        }
    }

    return (
        <>
            <div className="relative">
            <input className='w-full border p-2' type="text" placeholder="Search" onChange={handleSearch}  onFocus={() => setIsResultsVisible(true)} onBlur={() => setTimeout(() => setIsResultsVisible(false), 200)} />
                <ul className={`w-full bg-gray-500 bg-opacity-50 text-black absolute max-w-5xl text-xs max-h-96 overflow-scroll space-y-2 bg-opacity-100  ${isResultsVisible ? 'block' : 'hidden'}`}>
                    {results.map((result, index) => {
                        return (
                            <li key={index} >{
                                <>
                                    <p className='truncate cursor-pointer' onClick={() => handleSelect(result)}>Question: {result.question}</p>
                                </>
                            }</li>
                        )
                })}
            </ul>
            </div>
        </>
    )
}