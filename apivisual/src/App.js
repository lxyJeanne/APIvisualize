import React from 'react';
import MyLayout from "./components/MyLayout";
import { Routes, Route } from 'react-router-dom';
import User from "./pages/user";
import Categories from "./pages/FILE/categories";
import FileList from "./pages/FILE/list";

const App = () => {
  return (
    <MyLayout>
      <Routes>
        <Route path='/' element={<User />} />
        <Route path='/hpp_account/account_1' element={<FileList />} />
        <Route path='/hpp_account/account_2' element={<Categories />} />
      </Routes>
    </MyLayout>
  )
}

export default App;
