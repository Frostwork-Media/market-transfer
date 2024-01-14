import DatePicker from "react-datepicker";
import { useCallback } from "react";

export default function RowDatePicker({
  name,
  selected,
  className,
  onChange,
}: {
  name: string,
  selected: string | Date,
  className: string,
  onChange: (newDate: Date) => void,
}) {
  const handleChange = useCallback((time) => {
    console.log("Date changed: ", time);
    onChange(time);
  }, []);

  return (
    <DatePicker
      name={name}
      selected={selected}
      onChange={handleChange}
      className={className}
      dateFormat="yyyy/MM/dd"
    />
  );
}
