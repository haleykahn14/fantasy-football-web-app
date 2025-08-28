import React, { createContext, useState, useContext } from 'react';

// Create a context for the week
export const WeekContext = createContext({
  week: 1,
  setWeek: () => console.error('setWeek function not available. Is the component wrapped in WeekProvider?'),
});

// Create a custom hook to use the week context
export const useWeek = () => useContext(WeekContext);

// Create a provider component
export const WeekProvider = ({ children }) => {
  const [week, setWeek] = useState(1); // Default week

  return (
    <WeekContext.Provider value={{ week, setWeek }}>
      {children}
    </WeekContext.Provider>
  );
};