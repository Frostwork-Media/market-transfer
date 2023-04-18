'use client';
import Form from '../../components/Form'
import Link from 'next/link'

export default function Page() {
    return (
        <main className=''>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="h-screen flex justify-center">
                    <div className="flex flex-col">
                        <div className="relative w-full my-auto">
                            <h1 className="text-6xl font-bold text-center py-4">Prediction Market Mover</h1>
                            <h2 className="text-2xl font-bold text-center py-4">Move a prediction market from one site to another</h2>
                            <div className="w-full max-w-md px-4">
                                <Form />
                            </div>
                            <a href="https://chat.whatsapp.com/DKKQ5wESCOHGeN5nCFVotI" target='_blank' className="bg-green-500 hover:bg-green-700  font-bold py-2 px-4 rounded-full mt-8">Say hi👋 or report bugs🐛 (whatsapp chat)</a>
                            <Link href="/automate-betting" className="text-blue-500 hover:text-blue-700">Automate Betting</Link>
                            <Link href="/GPT4casting" className="text-blue-500 hover:text-blue-700">GPT-4casting</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}