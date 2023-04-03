import GPT4castingForm from '../../components/GPT4castingForm';

export default function Page({}){
    return (
        <main className=''>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <div className="h-screen flex justify-center">
                    <div className="flex flex-col">
                        <div className="relative w-full my-auto">
                            <h1 className="text-6xl font-bold text-center py-4">GPT-4casting</h1>
                                <GPT4castingForm />
                            <div className="w-full px-4">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      );
}