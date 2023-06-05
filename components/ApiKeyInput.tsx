import { useState, useEffect } from 'react';

export default function Component({defaultKey = null, onChange, keyName}) {
    const [apiKey, setApiKey] = useState(defaultKey || '')

    useEffect(() => {
        const storedKey = window?.localStorage.getItem(keyName)
        if (storedKey) {
            setApiKey(storedKey)
        }
    }, [keyName])

    useEffect(() => {
        onChange(apiKey)
        window.localStorage.setItem(keyName, apiKey)
    }, [apiKey, keyName, onChange])

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