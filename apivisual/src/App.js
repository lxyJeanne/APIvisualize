import React from 'react';
import MyLayout from "./components/MyLayout";
import { Routes, Route } from 'react-router-dom';
import User from "./pages/user";
import { UserProvider } from './UserContext';
import Message from './pages/message';
import { AlarmProvider } from './AlarmContext';
import './App.css';

const App = () => {
    return (
        <UserProvider>
          <AlarmProvider>
            <MyLayout>
              <Routes>
                <Route path='/' element={<User />} />
                <Route path='/message' element={<Message />} />
                {/* Account routes are handled inside MyLayout or another component */}
              </Routes>
            </MyLayout>
          </AlarmProvider>
        </UserProvider>
    );
}

export default App;
