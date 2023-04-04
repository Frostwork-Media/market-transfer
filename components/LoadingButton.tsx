import { useState } from 'react';

//feels like there is something I have do with promises here?


export default function LoadingButton({passOnClick, classNames, buttonText}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleButtonClick() {
    setIsLoading(true);
  
    // Simulate an asynchronous process
    await passOnClick();
  
    setIsLoading(false);
  }  

  return <button
    onClick={handleButtonClick}
    className={`${classNames} hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? "cursor-not-allowed" : ""
      }`}
    disabled={isLoading}
  >
    <span className="left-0 inset-y-0 flex items-center pl-3">
      <span>{buttonText}</span>
      {isLoading ? (

        <svg
          className="w-5 h-5 animate-spin text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l1-1.647z"
          ></path>
        </svg>
      ) : null }
    </span>
  </button>

  }