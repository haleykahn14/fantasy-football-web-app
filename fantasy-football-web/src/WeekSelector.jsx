import React from 'react';
import { useWeek } from './WeekContext';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const WeekSelector = () => {
    const { week, setWeek } = useWeek();
    const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

    const handleWeekChange = (event) => {
        setWeek(Number(event.target.value));
    };

    return (
        <div className="week-selector" style={{ textAlign: 'right' }}>
            <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Week</InputLabel>
                <Select
                    value={week}
                    onChange={handleWeekChange}
                    label="Week"
                >
                    {weeks.map((weekNum) => (
                        <MenuItem key={weekNum} value={weekNum}>
                            Week {weekNum}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default WeekSelector;