// In src/App.jsx

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LeagueData from './LeagueData';
import MatchupData from './MatchupData';
import Rankings from './Rankings';
import { AppBar, Toolbar, Button, Typography, Container } from '@mui/material';
import WeekSelector from './WeekSelector';
// REMOVE THIS LINE: import { WeekProvider } from './WeekContext';

function App() {
  return (
    // The <Router> should be the top-level component here
    <Router>
      {/* REMOVE <WeekProvider> from here */}
      <div className="App">
        <AppBar position="fixed" sx={{ width: '100%', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Fantasy Football Dashboard
            </Typography>

            <div>
              <Button color="inherit" component={Link} to="/" sx={{ mr: 1 }}>
                League Data
              </Button>
              <Button color="inherit" component={Link} to="/matchups" sx={{ mr: 1 }}>
                Matchup Data
              </Button>
              <Button color="inherit" component={Link} to="/rankings">
                Rankings
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        <Toolbar />
        
        <Container className="container">
          <WeekSelector />
          <Routes>
            <Route path="/" element={<LeagueData />} />
            <Route path="/matchups" element={<MatchupData />} />
            <Route path="/rankings" element={<Rankings />} />
          </Routes>
        </Container>
      </div>
      {/* REMOVE </WeekProvider> from here */}
    </Router>
  );
}

export default App;