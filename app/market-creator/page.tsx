'use client';
import MarketCreationForm from '../../components/MarketCreationForm'
import Link from 'next/link'

export default function Page() {
    return (
        <main className=''>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="h-screen flex justify-center">
                    <div className="flex flex-col">
                        <div className="relative w-full my-auto">
                            <h1 className="text-6xl font-bold text-center py-4">Market creator</h1>
                            <h2 className="text-2xl font-bold text-center py-4">Automatically create a market based on your question</h2>
                            <div className="w-full max-w-md px-4">
                                <MarketCreationForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}