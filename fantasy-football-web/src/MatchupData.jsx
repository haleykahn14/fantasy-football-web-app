import React, { useEffect, useState } from 'react';
import { useWeek } from './WeekContext';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';

const MatchupData = () => {
    const { week } = useWeek();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMatchupData = async (selectedWeek) => {
        try {
            const response = await axios.get('/api/matchup', {
                params: {
                    league_id: import.meta.env.VITE_LEAGUE_ID,
                    year: import.meta.env.VITE_YEAR,
                    espn_s2: import.meta.env.VITE_ESPN_S2,
                    swid: import.meta.env.VITE_SWID,
                    week: selectedWeek  // Change week as needed
                }
            });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatchupData(week);
    }, [week]);

    if (loading) return <div>Loading matchup data...</div>;

    // Prepare rows for DataGrid
    const rows = data.map((matchup, index) => ({
        id: index,
        Week: matchup.Week,
        Team1: matchup.Name1,
        Score1: matchup.Score1,
        Team2: matchup.Name2,
        Score2: matchup.Score2,
        Type: matchup.Type,
        Winner: matchup.Score1 > matchup.Score2 
            ? matchup.Name1 
            : matchup.Score1 < matchup.Score2 
            ? matchup.Name2 
            : 'Tie',
    }));

    return (
        <div>
            <h2>Week {week} Matchups</h2>
            <br/>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={[
                        { field: 'Team1', headerName: 'Team 1', flex: 1 },
                        { field: 'Score1', headerName: 'Score 1', flex: 1 },
                        { field: 'Team2', headerName: 'Team 2', flex: 1 },
                        { field: 'Score2', headerName: 'Score 2', flex: 1 },
                        { field: 'Type', headerName: 'Type', flex: 1 },
                        { field: 'Winner', headerName: 'Winner', flex: 1 },
                    ]}
                    disableRowSelectionOnClick
                    sx={{ border: 1, borderColor: 'grey.300' }} // Add border
                />
            </div>
        </div>
    );
};

export default MatchupData;