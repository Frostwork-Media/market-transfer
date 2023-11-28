import AutomateBettingForm from '../components/AutomateBettingForm'

export default function Page({}){
    return (
        <main className=''>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex justify-center h-screen">
                    <div className="flex flex-col">
                        <div className="relative w-full my-auto">
                            <h1 className="py-4 text-6xl font-bold text-center">Automate Betting</h1>
                            <h2 className="py-4 text-2xl font-bold text-center">Automate your Manifold Markets bets according to your true probabilities to maximise profit under Kelly</h2>
                            <div className="w-full px-4">
                                <AutomateBettingForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      );
}