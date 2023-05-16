import { useState } from 'react';

//feels like there is something I have do with promises here?


export default function LoadingButton({passOnClick, buttonText}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleButtonClick() {
    setIsLoading(true);
  
    // Simulate an asynchronous process
    await passOnClick();
  
    setIsLoading(false);
  }  

  return <button
    onClick={handleButtonClick}
    className={`mx-4 my-2 flex items-center gap-2 bg-blue-500 font-bold text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
      isLoading ? "cursor-not-allowed" : ""
      }`}
    disabled={isLoading}
  >
      <span>{buttonText}</span>
      {isLoading ? (
        <svg
          className="w-5 h-5 animate-spin text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l1-1.647z"
          ></path>
        </svg>
    ) : null}
  </button>
  }
