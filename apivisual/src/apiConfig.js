// Desc: API Configuration file
// Base API URL
const BASE_URL = 'http://10.198.67.90:5000';

// API Endpoints
export const API_ENDPOINTS = {
    users: `${BASE_URL}/users`,
    alarms: `${BASE_URL}/alarms`,
    submit: `${BASE_URL}/submit`,
    download: `${BASE_URL}/download`,
    clear: `${BASE_URL}/clear`,
    fetch: `${BASE_URL}/fetch-data`,
    startLog: `${BASE_URL}/writeLog`,
    stopLog: `${BASE_URL}/stopLog`,
    deleteLog: `${BASE_URL}/deleteLog`,
};

export default BASE_URL;
