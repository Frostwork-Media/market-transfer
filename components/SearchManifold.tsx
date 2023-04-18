import { searchMarket } from '../lib/api'
import { useState } from 'react'
import Image from 'next/image'

export default function Search({ handleSelect, selectedMarkets }) {
    const [results, setResults] = useState([])
    const [isResultsVisible, setIsResultsVisible] = useState(false);

    const handleSearch = async (e) => {
        const term = e.target.value

        try {
            const data = await searchMarket(term);
            setResults(data.slice(0, 10))
        } catch (error) {
            console.log(error)
            setResults([])
        }
    }

    return (
        <>
            <div className="relative">
            <input className='w-full border p-2' type="text" placeholder="Search" onChange={handleSearch}  onFocus={() => setIsResultsVisible(true)} onBlur={() => setTimeout(() => setIsResultsVisible(false), 200)} />
                <ul className={`w-full bg-white bg-opacity-100 text-black absolute max-w-5xl text-xs max-h-96 overflow-scroll space-y-2  ${isResultsVisible ? 'block' : 'hidden'}`}>
                    {results.map((result, index) => {
                        return (
                            <li key={index} >{
                                <>
                                    <p className='truncate cursor-pointer' onClick={() => handleSelect(result)}>{result.question}</p>
                                </>
                            }</li>
                        )
                })}
            </ul>
            </div>
        </>
    )
}