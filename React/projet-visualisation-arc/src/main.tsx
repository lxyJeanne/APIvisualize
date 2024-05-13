import { jsxDEV } from "react/jsx-dev-runtime";
import React from 'react'
import ReactDOM from 'react-dom/client'

// import "antd/dist/antd.compact.css";//紧凑主题
import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { HashRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Router>
    <ConfigProvider locale={frFR}>
      <App />
    </ConfigProvider>
  </Router>
  
);
