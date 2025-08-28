import React, { useEffect, useState } from 'react';
import { useWeek } from './WeekContext';
import axios from 'axios';
import { Tabs, Tab, Paper, Box, Typography, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Rankings = () => {
    const { week } = useWeek();
    const [weeklyData, setWeeklyData] = useState([]);
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Fetch data for current week
    const fetchWeeklyData = async (selectedWeek) => {
        try {
            const response = await axios.get('/api/league', {
                params: {
                    league_id: import.meta.env.VITE_LEAGUE_ID,
                    year: import.meta.env.VITE_YEAR,
                    espn_s2: import.meta.env.VITE_ESPN_S2,
                    swid: import.meta.env.VITE_SWID,
                    week: selectedWeek
                }
            });
            setWeeklyData(response.data);
        } catch (error) {
            console.error("Error fetching weekly data", error);
        }
    };

    // Fetch historical data for all weeks up to current week
    const fetchHistoricalData = async (currentWeek) => {
        try {
            const promises = [];
            for (let w = 1; w <= currentWeek; w++) {
                promises.push(
                    axios.get('/api/league', {
                        params: {
                            league_id: import.meta.env.VITE_LEAGUE_ID,
                            year: import.meta.env.VITE_YEAR,
                            espn_s2: import.meta.env.VITE_ESPN_S2,
                            swid: import.meta.env.VITE_SWID,
                            week: w
                        }
                    })
                );
            }
            const responses = await Promise.all(promises);
            const allData = responses.flatMap(response => response.data);
            setHistoricalData(allData);
        } catch (error) {
            console.error("Error fetching historical data", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchWeeklyData(week),
                fetchHistoricalData(week)
            ]);
            setLoading(false);
        };
        fetchData();
    }, [week]);

    if (loading) return <div>Loading rankings...</div>;

    // Calculate weekly team rankings
    const calculateWeeklyRankings = () => {
        const teamScores = {};
        
        weeklyData.forEach(player => {
            if (!teamScores[player.TeamName]) {
                teamScores[player.TeamName] = {
                    teamName: player.TeamName,
                    totalPoints: 0,
                    playerCount: 0
                };
            }
            teamScores[player.TeamName].totalPoints += player.PlayerScoreActual;
            teamScores[player.TeamName].playerCount += 1;
        });

        return Object.values(teamScores)
            .map(team => ({
                ...team,
                averagePoints: team.totalPoints / team.playerCount
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((team, index) => ({
                ...team,
                rank: index + 1
            }));
    };

    // Calculate overall season rankings
    const calculateOverallRankings = () => {
        const teamStats = {};
        
        historicalData.forEach(player => {
            if (!teamStats[player.TeamName]) {
                teamStats[player.TeamName] = {
                    teamName: player.TeamName,
                    totalPoints: 0,
                    weekCount: new Set(),
                    bestWeek: 0,
                    worstWeek: Infinity,
                    consistency: []
                };
            }
            teamStats[player.TeamName].totalPoints += player.PlayerScoreActual;
            teamStats[player.TeamName].weekCount.add(player.Week || week);
        });

        // Calculate weekly totals for consistency
        const weeklyTotals = {};
        historicalData.forEach(player => {
            const weekKey = `${player.TeamName}-${player.Week || week}`;
            if (!weeklyTotals[weekKey]) {
                weeklyTotals[weekKey] = {
                    teamName: player.TeamName,
                    week: player.Week || week,
                    total: 0
                };
            }
            weeklyTotals[weekKey].total += player.PlayerScoreActual;
        });

        // Update team stats with weekly performance
        Object.values(weeklyTotals).forEach(weekData => {
            const team = teamStats[weekData.teamName];
            if (team) {
                team.bestWeek = Math.max(team.bestWeek, weekData.total);
                team.worstWeek = Math.min(team.worstWeek, weekData.total);
                team.consistency.push(weekData.total);
            }
        });

        return Object.values(teamStats)
            .map(team => {
                const weeksPlayed = team.weekCount.size;
                const avgPoints = team.totalPoints / weeksPlayed;
                const variance = team.consistency.reduce((sum, points) => {
                    return sum + Math.pow(points - (team.totalPoints / weeksPlayed), 2);
                }, 0) / weeksPlayed;
                
                return {
                    ...team,
                    weeksPlayed,
                    averagePoints: avgPoints,
                    standardDeviation: Math.sqrt(variance),
                    worstWeek: team.worstWeek === Infinity ? 0 : team.worstWeek
                };
            })
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((team, index) => ({
                ...team,
                rank: index + 1
            }));
    };

    const weeklyRankings = calculateWeeklyRankings();
    const overallRankings = calculateOverallRankings();

    // Prepare data for DataGrid
    const weeklyRows = weeklyRankings.map(team => ({
        id: team.rank,
        rank: team.rank,
        teamName: team.teamName,
        totalPoints: Math.round(team.totalPoints * 100) / 100,
        averagePoints: Math.round(team.averagePoints * 100) / 100,
        playerCount: team.playerCount
    }));

    const overallRows = overallRankings.map(team => ({
        id: team.rank,
        rank: team.rank,
        teamName: team.teamName,
        totalPoints: Math.round(team.totalPoints * 100) / 100,
        averagePoints: Math.round(team.averagePoints * 100) / 100,
        weeksPlayed: team.weeksPlayed,
        bestWeek: Math.round(team.bestWeek * 100) / 100,
        worstWeek: Math.round(team.worstWeek * 100) / 100,
        consistency: Math.round(team.standardDeviation * 100) / 100
    }));

    const weeklyColumns = [
        { field: 'rank', headerName: 'Rank', width: 80 },
        { field: 'teamName', headerName: 'Team', flex: 1 },
        { field: 'totalPoints', headerName: 'Total Points', width: 120 },
        { field: 'averagePoints', headerName: 'Avg Points', width: 120 },
        { field: 'playerCount', headerName: 'Players', width: 100 }
    ];

    const overallColumns = [
        { field: 'rank', headerName: 'Rank', width: 80 },
        { field: 'teamName', headerName: 'Team', flex: 1 },
        { field: 'totalPoints', headerName: 'Total Points', width: 120 },
        { field: 'averagePoints', headerName: 'Avg/Week', width: 120 },
        { field: 'bestWeek', headerName: 'Best Week', width: 100 },
        { field: 'worstWeek', headerName: 'Worst Week', width: 100 },
        { field: 'consistency', headerName: 'Std Dev', width: 100 }
    ];

    return (
        <div>
            <h2>Team Rankings</h2>
            <br/>
            <Box sx={{ border: 1, borderColor: 'divider', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
                    <Tab label={`Week ${week} Rankings`} />
                    <Tab label="Overall Season Rankings" />
                </Tabs>
            </Box>
<Box style={{ border: '1px solid #ccc', borderTop: 'none', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px', padding: '16px'}}>
            {activeTab === 0 && (
                <div>
                        <h3>Week {week} Team Performance</h3>
                            <DataGrid
                                rows={weeklyRows}
                                columns={weeklyColumns}
                                disableRowSelectionOnClick
                                sx={{ border: 1, borderColor: 'grey.300' }}
                                initialState={{
                                    sorting: {
                                        sortModel: [{ field: 'rank', sort: 'asc' }]
                                    }
                                }}
                            />
                </div>
            )}

            {activeTab === 1 && (
                <div>
                        <h3>Season Performance Through Week {week}</h3>

                            <DataGrid
                                rows={overallRows}
                                columns={overallColumns}
                                disableRowSelectionOnClick
                                sx={{ border: 1, borderColor: 'grey.300' }}
                                initialState={{
                                    sorting: {
                                        sortModel: [{ field: 'rank', sort: 'asc' }]
                                    }
                                }}
                            />
</div>
            )}
           </Box> 
        </div>
    );
};

export default Rankings;
