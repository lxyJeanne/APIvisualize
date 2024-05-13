import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './apiConfig';

const AlarmContext = createContext();

export const useAlarm = () => useContext(AlarmContext);

export const AlarmProvider = ({ children }) => {
    const [alarms, setAlarms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAlarms = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_ENDPOINTS.alarms);
            setAlarms(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch alarms:', error);
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlarms();
    }, []);

    return (
        <AlarmContext.Provider value={{ alarms, setAlarms, fetchAlarms, loading, error }}>
            {children}
        </AlarmContext.Provider>
    );
};
