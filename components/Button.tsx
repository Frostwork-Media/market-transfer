'use client';
import { getMarketBySlug } from '../lib/api'

export default function Button({handleComplete}) {
    const handleSubmit = async () => {
        //get data from search
        const slug = "will-trump-be-arrested-on-tuesday";
        const data = await getMarketBySlug(slug)
        const prettyCloseTime = new Date(data.closeTime).toLocaleString();
        let output = {
            question: data.question,
            closeTime: prettyCloseTime,
            textDescription: data.textDescription
        }
        handleComplete(output)
    }

    return (
        <p onClick={handleSubmit} className="bg-black text-white rounded-full p-2 shadow hover:text-black hover:bg-white hover:border hover:border-black" >Do Thing</p>
    )
}