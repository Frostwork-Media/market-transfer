import { searchMarket } from '../lib/api'
import { useState } from 'react'
import Image from 'next/image'
export default function Search({ handleSelect, selectedMarkets }) {
    const [results, setResults] = useState([])

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
            <input className='w-full border p-2' type="text" placeholder="Search" onChange={handleSearch} />
            <ul className='w-full max-w-5xl text-xs max-h-96 overflow-scroll space-y-2'>
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

        </>
    )
}