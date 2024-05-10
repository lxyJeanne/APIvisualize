import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://10.198.67.90:5000/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider value={{ users, setUsers, fetchUsers, loading, error }}>
            {children}
        </UserContext.Provider>
    );
};
