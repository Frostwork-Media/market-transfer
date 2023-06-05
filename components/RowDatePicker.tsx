import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { userQuestion } from '@/lib/types';

export default function Component({id, name, selected, className, setUserData, slug, tableData}) {
    
    const handleMarketCorrectionTimeChange = (slug, time) => {
        console.log("Updating correction date for ", slug, " to ", time);
        const newRow:userQuestion = {
            slug: slug,
            url: tableData.find(row => row.slug === slug).url || null,
            userProbability: tableData.find(row => row.slug === slug).userProbability,
            marketCorrectionTime: time 
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
        handleMarketCorrectionTimeChange(slug, time);
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