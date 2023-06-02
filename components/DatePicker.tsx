import DatePicker from 'react-datepicker';

export default function Component({id, name, selected, onChange, className}) {
    
    const handleMarketCorrectionTimeChange = (slug, time) => {
        // Update the user data
        const updatedUserData = tableData.map((row) => {
            if (row.slug === slug) {
                let newRow:userQuestion = row;
                newRow.marketCorrectionTime = time;
                return newRow;
            }
            return row;
        });
        setUserData(updatedUserData);
    }

    const handleChange = (time) => {
        handleMarketCorrectionTimeChange(slug, time);
    }

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