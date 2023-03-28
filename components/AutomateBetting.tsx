import React from 'react';

const AutomateBetting: React.FC = () => {
  return (
    <main className=''>
        <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="h-screen flex justify-center">
                <div className="flex flex-col">
                    <div className="relative w-full my-auto">
                        <h1 className="text-6xl font-bold text-center py-4">Automate Betting</h1>
                        <h2 className="text-2xl font-bold text-center py-4">Move a prediction market from one site to another</h2>
                        <div className="w-full max-w-md px-4">
                            <AutomateBettingForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
};

export default AutomateBetting;