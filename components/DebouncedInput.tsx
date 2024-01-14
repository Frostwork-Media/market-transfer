import React, { useState, useEffect } from "react";
import useDebounce from "../lib/hooks/useDebounce";

export default function DebouncedInput({
    // id, name, classname optional
    name = "debounced-input",
    className = "w-full text-center",
    slug,
    initialValue,
    onDebouncedChange,
}) {
    const [value, setValue] = useState(initialValue);
    const [inputValue, setInputValue] = useState(initialValue);
    const debouncedFinalValue = useDebounce(value, 1000);

    useEffect(() => {
        const handleChange = () => {
            onDebouncedChange(slug, debouncedFinalValue);
            console.log(
                `DebouncedInput: ${slug} ${debouncedFinalValue}`
            )
        };

        if (value !== initialValue) {
            handleChange();
        }
    }, [debouncedFinalValue]);

    return (
        <input
            name={name}
            type="number"
            className={className}
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
            }}
        />
    );

}



