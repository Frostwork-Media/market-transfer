import AutomateBettingForm from '../components/AutomateBettingForm'

export default function Page({}){
    return (
        <main className=''>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="h-screen flex justify-center">
                    <div className="flex flex-col">
                        <div className="relative w-full my-auto">
                            <h1 className="text-6xl font-bold text-center py-4">Automate Betting</h1>
                            <h2 className="text-2xl font-bold text-center py-4">Automate your Manifold Markets bets according to your true probabilities to maximise profit under Kelly</h2>
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