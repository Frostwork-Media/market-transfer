import DatePicker from 'react-datepicker';
import { useState, useEffect } from 'react';

export default function Component({id, name, selected, onChange, className}) {
    
    const handleChange = (date) => {
        onChange(date); 
    };

    return (
        <DatePicker
        id={id}
        name={name}
        selected={selected}
        onChange={handleChange}
        className={className}
    />
    )
}