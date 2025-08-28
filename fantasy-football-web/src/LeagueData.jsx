import React, { useEffect, useState } from 'react';
import { useWeek } from './WeekContext';
import axios from 'axios';
import { Tabs, Tab, Paper, Divider, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const LeagueData = () => {
    const { week } = useWeek();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0); // State to manage the active tab

    const fetchData = async (selectedWeek) => {
        try {
            const response = await axios.get('/api/league', {
                params: {
                    league_id: import.meta.env.VITE_LEAGUE_ID,
                    year: import.meta.env.VITE_YEAR,
                    espn_s2: import.meta.env.VITE_ESPN_S2,
                    swid: import.meta.env.VITE_SWID,
                    week: selectedWeek  // Use the selected week
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
        fetchData(week); // Fetch data for the initial week
    }, [week]); // Refetch when week changes

    if (loading) return <div>Loading...</div>;

    // Get unique teams and sort them alphabetically
    const teams = [...new Set(data.map(player => player.TeamName))].sort();

    // Function to calculate total points per team
    const pointsPerTeam = () => {
        return teams.map(team => ({
            team,
            totalPoints: data
                .filter(player => player.TeamName === team)
                .reduce((sum, player) => sum + player.PlayerScoreActual, 0)
        }));
    };

    // Function to calculate points per position
    const pointsPerPosition = () => {
        const positionPoints = {};
        data.forEach(player => {
            const position = player.PlayerRosterSlot; // Assuming this field exists
            if (!positionPoints[position]) {
                positionPoints[position] = 0;
            }
            positionPoints[position] += player.PlayerScoreActual;
        });
        return positionPoints;
    };

    // Function to get highest and lowest scoring players
    const getHighestLowestPlayers = () => {
        if (data.length === 0) return { highest: null, lowest: null };

        const highest = data.reduce((max, player) => 
            player.PlayerScoreActual > max.PlayerScoreActual ? player : max
        );
        const lowest = data.reduce((min, player) => 
            player.PlayerScoreActual < min.PlayerScoreActual ? player : min
        );

        return { highest, lowest };
    };

    // Function to get highest and lowest scoring teams
    const getTeamStats = () => {
        const teamPoints = pointsPerTeam();
        const highestTeam = teamPoints.reduce((max, team) => 
            team.totalPoints > max.totalPoints ? team : max
        );
        const lowestTeam = teamPoints.reduce((min, team) => 
            team.totalPoints < min.totalPoints ? team : min
        );

        return { highestTeam, lowestTeam };
    };

    const overallPlayers = getHighestLowestPlayers();
    const overallTeams = getTeamStats();
    const positionPoints = pointsPerPosition();

    // Convert position points to rows for DataGrid
    const positionRows = Object.entries(positionPoints).map(([position, points]) => ({
        id: position,
        Position: position,
        Points: points,
    }));

    return (
        <div>
            <h2>Week {week} Winners and Losers </h2>

            <div>
                <p><strong>Highest Scoring Player:</strong> {overallPlayers.highest?.PlayerName} ({overallPlayers.highest?.PlayerScoreActual}) - {overallPlayers.highest?.TeamName}</p>
                <p><strong>Lowest Scoring Player:</strong> {overallPlayers.lowest?.PlayerName} ({overallPlayers.lowest?.PlayerScoreActual}) - {overallPlayers.lowest?.TeamName}</p>
                <p><strong>Highest Scoring Team:</strong> {overallTeams.highestTeam.team} ({overallTeams.highestTeam.totalPoints})</p>
                <p><strong>Lowest Scoring Team:</strong> {overallTeams.lowestTeam.team} ({overallTeams.lowestTeam.totalPoints})</p>
            </div>
            <br/>
            <Box sx={{ border: 1, borderColor: 'divider', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                <Tabs value={activeTab} variant="scrollable" scrollButtons="auto" onChange={(event, newValue) => setActiveTab(newValue)}>
                    {teams.map((team, index) => (
                        <Tab 
                            key={index} 
                            label={team} 
                            wrapped
                        />
                    ))}
                </Tabs>
            </Box>
            <Box style={{ border: '1px solid #ccc', borderTop: 'none', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px', padding: '16px'}}>
                {teams.map((team, index) => (
                    <div role="tabpanel" hidden={activeTab !== index} key={index}>
                        {activeTab === index && (
                            <div>
                                <h2>{team}</h2>

                                <p><strong>Highest Scoring Player Overall:</strong> {overallPlayers.highest?.PlayerName} ({overallPlayers.highest?.PlayerScoreActual})</p>
                                <p><strong>Lowest Scoring Player Overall:</strong> {overallPlayers.lowest?.PlayerName} ({overallPlayers.lowest?.PlayerScoreActual})</p>

                                <div style={{width: 'auto' }}>
                                    <DataGrid
                                        rows={data.filter(player => player.TeamName === team).map((player, idx) => ({
                                            id: idx,
                                            PlayerName: player.PlayerName,
                                            PlayerScoreActual: player.PlayerScoreActual,
                                            PlayerScoreProjected: player.PlayerScoreProjected,
                                        }))}
                                        columns={[
                                            { field: 'PlayerName', headerName: 'Player Name', flex: 1 },
                                            { field: 'PlayerScoreActual', headerName: 'Actual Score', flex: 1 },
                                            { field: 'PlayerScoreProjected', headerName: 'Projected Score', flex: 1 },
                                        ]}
                                        disableRowSelectionOnClick
                                        sx={{ border: 1, borderColor: 'grey.300' }} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div>
                    <h2>Points Per Position</h2>
                    <div style={{width: 'auto' }}>
                        <DataGrid
                            rows={positionRows}
                            columns={[
                                { field: 'Position', headerName: 'Position', flex: 1 },
                                { field: 'Points', headerName: 'Total Points', flex: 1 },
                            ]}
                            disableRowSelectionOnClick
                            sx={{ border: 1, borderColor: 'grey.300' }} 
                        />
                    </div>
                </div>
            </Box>
        </div>
    );
};

export default LeagueData;