import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { userQuestion } from '@/lib/types';

export default function Component({id, name, selected, className, setUserData, slug, tableData}) {
    
    const handleCorrectionTimeChange = (slug, time) => {
        console.log("Updating correction time for ", slug, " to ", time);
        const newRow:userQuestion = {
            slug: slug,
            url: tableData.find(row => row.slug === slug).url || null,
            userProbability: tableData.find(row => row.slug === slug).userProbability,
            correctionTime: time,
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