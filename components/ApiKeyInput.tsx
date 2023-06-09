import { useState, useEffect } from 'react';

export default function Component({defaultKey = null, keyName}) {
    const [apiKey, setApiKey] = useState(() => {
        const storedKey = window.localStorage.getItem(keyName);
        return storedKey || defaultKey || '';
    });

    useEffect(() => {
        window.localStorage.setItem(keyName, apiKey);
    }, [apiKey, keyName]);

    const handleAPIKeyChange = (event) => {
        setApiKey(event.target.value);
    };

    return (
        <input
        id={"api-key"+keyName}
        name={"api-key"+keyName}
        type="password"
        className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        value={apiKey}
        onChange={handleAPIKeyChange}
    />
    );
}