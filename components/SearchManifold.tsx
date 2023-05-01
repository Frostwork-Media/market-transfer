import { searchMarket } from '../lib/api'
import { useEffect, useState } from 'react'
import useDebounce from '../lib/hooks/useDebounce'
import Image from 'next/image'

export default function Search({ handleSelect }) {
    const [results, setResults] = useState([])
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedValue = useDebounce(searchTerm, 300);

    const handleSearch = async (search) => {
        try {
            const data = await searchMarket(search);
            const validMarkets = data.filter(market => market.outcomeType == "BINARY" && !market.isResolved);
            setResults(validMarkets.slice(0, 10));
        } catch (error) {
            console.log(error);
            setResults([]);
        }
    };

    const handleChange = (e) => {
        setSearchTerm(e.target.value)
    }

    useEffect(() => {
        if (debouncedValue) {
            handleSearch(debouncedValue)
        } else {
            setResults([])
        }
    }, [debouncedValue])

    return (
        <>
            <div className="relative">
            <input className='w-full border p-2' type="text" placeholder="Search" onChange={handleChange}  onFocus={() => setIsResultsVisible(true)} onBlur={() => setTimeout(() => setIsResultsVisible(false), 200)} />
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