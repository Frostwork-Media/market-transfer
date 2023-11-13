import DatePicker from 'react-datepicker';
import { Question } from '@prisma/client';

export default function Component({id, name, selected, className, setUserData, slug, tableData}) {
    
    const handleCorrectionTimeChange = (slug, time) => {
        console.log("Updating correction time for ", slug, " to ", time);

        const oldRow = tableData.find(row => row.slug === slug);
        if (!oldRow) {
            throw new Error(`row not found for slug ${slug}`);
        }

        const newRow: Question = {
            ...oldRow,
            slug: slug,
            url: tableData.find(row => row.slug === slug).url || null,
            userProbability: tableData.find(row => row.slug === slug).userProbability,
            marketCorrectionTime: time,
            aggregator: tableData.find(row => row.slug === slug).aggregator,
        };
        const updatedUserData = tableData.map((row) => {
            if (row.slug === slug) {
                return newRow;
            }
            return row;
        });
        setUserData(updatedUserData);
    }

    const handleChange = (time) => {
        console.log("Date changed: ", time);
        handleCorrectionTimeChange(slug, time);
    }

    return (
        <DatePicker
        name={name}
        selected={selected}
        onChange={handleChange}
        className={className}
        dateFormat="yyyy/MM/dd"
    />
    )
}