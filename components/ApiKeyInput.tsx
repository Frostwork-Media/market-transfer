import { useMemo } from 'react';

interface Props {
    keyName: string;
    defaultKey?: string;
    onChange?: (key: string) => void;
}

export default function Component({ keyName, defaultKey = "", onChange = () => null }: Props) {
    const defaultApiKey = useMemo(() => {
        return window.localStorage.getItem(keyName) || defaultKey || '';
    }, []);

    return (
        <input
        id={"api-key"+keyName}
        name={"api-key"+keyName}
        type="password"
        className="block w-full mt-1 border border-gray-200 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        defaultValue={defaultApiKey}
        onChange={(event) => {
            onChange(event.target.value);
        }}
    />
    );
}
