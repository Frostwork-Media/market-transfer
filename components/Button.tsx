'use client';
import { getMarketBySlug } from '../lib/api'

export default function Button({handleComplete, slug}) {
    const handleSubmit = async () => {
        //get data from search
        const data = await getMarketBySlug(slug)
        const closeTime = new Date(data.closeTime);
        let output = {
            question: data.question,
            closeTime: closeTime,
            textDescription: data.textDescription
        }
        handleComplete(output)
    }

    return (
        <button onClick={handleSubmit} className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" >🔍</button>
    )
}