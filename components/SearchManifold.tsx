import { searchMarket } from '../lib/api'
import { useState, useRef } from 'react' // <-- Import useRef

export default function Search({ handleSelect, selectedMarkets }) {
    const [results, setResults] = useState([])
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const inputRef = useRef(null); // <-- Add a ref to track the input element

    const debounce = (func, wait) => {
        let timeout;
    
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
    
        try {
            const data = await searchMarket(term);
            const filteredData = data.filter((market) => !market.isResolved);
            setResults(filteredData.slice(0, 10));
        } catch (error) {
            console.log(error);
            setResults([]);
        }
    };

    const debouncedHandleSearch = debounce(handleSearch, 300); // Adjust the wait time (300ms) as needed

    const handleBlur = () => {
        // Check if the input element is focused before hiding the results
        if (!inputRef.current || !inputRef.current.contains(document.activeElement)) {
            setIsResultsVisible(false);
        }
    };

    return (
        <>
            <div className="relative">
                <input
                    ref={inputRef} // <-- Attach the ref to the input element
                    className='w-full border p-2'
                    type="text"
                    placeholder="Search"
                    onChange={(e) => debouncedHandleSearch(e)}
                    onFocus={() => setIsResultsVisible(true)}
                    onBlur={() => setTimeout(handleBlur, 200)} // <-- Call handleBlur instead of setting the state directly
                />
                <ul className={`w-full bg-white bg-opacity-100 text-black absolute max-w-5xl text-xs max-h-96 overflow-scroll space-y-2  ${isResultsVisible ? 'block' : 'hidden'}`}>
                    {results.map((result, index) => {
                        return (
                            <li key={index}>
                                <p className='truncate cursor-pointer' onClick={() => handleSelect(result)}>{result.question}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}