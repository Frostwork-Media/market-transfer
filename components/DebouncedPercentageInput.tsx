import React, { useState, useEffect } from "react";
import useDebounce from "../lib/hooks/useDebounce";
import { floatToPercent } from "@/lib/utils";

export default function DebouncedPercentageInput({
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
                `DebouncedPercentageInput: ${slug} ${debouncedFinalValue}`
            )
        };

        if (value !== initialValue) {
            handleChange();
        }
    }, [debouncedFinalValue]);

    return (
        <input
            type="number"
            className="w-full text-center"
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
            }}
        />
    );

}



