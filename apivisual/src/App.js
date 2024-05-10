import React from 'react';
import { UserProvider } from "./UserContext"; // 确保路径正确
import MyLayout from "./components/MyLayout";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import User from "./pages/user";
import Categories from "./pages/FILE/categories";
import FileList from "./pages/FILE/list";
import Message from './pages/message';

const App = () => {
  return (
    <UserProvider>
        <MyLayout>
          <Routes>
            <Route path='/' element={<User />} />
            <Route path='/message' element={<Message />} />
            <Route path='/hpp_account/account_1' element={<FileList />} />
            <Route path='/hpp_account/account_2' element={<Categories />} />
          </Routes>
        </MyLayout>
    </UserProvider>
  );
}

export default App;
