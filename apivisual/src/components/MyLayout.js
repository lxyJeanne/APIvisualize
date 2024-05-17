import React, { useState } from 'react';
import { Layout, Menu, Button,theme } from 'antd';
import { MenuFoldOutlined, UserSwitchOutlined, DatabaseOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Route, Routes } from 'react-router-dom';
import { useUsers } from '../UserContext';
import AccountPage from '../pages/AccountPage';
import { logo } from "../tools";

const { Header, Sider, Content } = Layout;

const MyLayout = ({ children }) => {
  const { users } = useUsers();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = [location.pathname];

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ width: '100vw', height: '100vh' }} id='components-layout-demo-custom-trigger'>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <img src={logo} alt='logo' />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultSelectedKeys={['/']}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: '/',
              icon: <UserOutlined />,
              label: 'User',
            },
            {
              key: '/message',
              icon: <DatabaseOutlined />,
              label: 'All Messages',
            },
            {
              key: '/hpp_account',
              icon: <UserSwitchOutlined />,
              label: 'HPP Account',
              children: users.map(user => ({
                label: `User ${user.id} - ${user.username}`,
                key: `/${user.username}`,
              })),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuFoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <span className='app-title'>ALARM MESSAGES</span>
        </Header>
        <Content  style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer }}>
          {children}
          <Routes>
            {users.map(user => (
              <Route path={`/${user.username}`} element={<AccountPage />} />
            ))}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyLayout;
