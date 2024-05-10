import {
  MenuFoldOutlined,
  UserSwitchOutlined,
  DatabaseOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, theme,message} from 'antd'
import { logo } from "../tools"
import { useNavigate,useLocation } from 'react-router-dom'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUsers } from '../UserContext';

const { Header, Sider, Content } = Layout

const MyLayout = ({ children }) => {
  const {users, setUsers} = useUsers(); // 从 UserContext 中获取用户列表
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation(); // 获取当前路由位置

  useEffect(() => {
    console.log("Users:", users);
  }, []);

   // 根据当前路由路径确定选中的菜单项
   const selectedKeys = [location.pathname];

  const {
    token: { colorBgContainer },
  } = theme.useToken()
  return (
    <Layout style={{ width: '100vw', height: '100vh' }}
      id='components-layout-demo-custom-trigger'
    >
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" >
          <img src={logo} alt='logo' />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys} // 动态设置选中的菜单项
          defaultSelectedKeys={['/']}
          onClick={({ key }) => {
            // alert(key)
            navigate(key)
          }}
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
                label: `${user?.id} - ${user?.username}`, // Using optional chaining
                key: `/hpp_account/account_${user?.id}`,
              })),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuFoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <span className='app-title'>ALARM MESSAGES</span>
          
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
export default MyLayout
