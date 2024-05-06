import {
  MenuFoldOutlined,
  UserSwitchOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, theme } from 'antd'
import { useState } from 'react'
import { logo } from "../tools"
import { useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const MyLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

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
          defaultSelectedKeys={['/']}
          onClick={({ key }) => {
            alert(key)
            navigate(key)

          }}
          items={[
            {
              key: '/',
              icon: <DatabaseOutlined />,
              label: 'All Messages',
            },
            {
              key: '/hpp_account',
              icon: <UserSwitchOutlined />,
              label: 'HPP Account',
              children: [
                {
                  label: 'Account 1',
                  key: '/hpp_account/account_1',
                },
                {
                  label: 'Account 2',
                  key: '/hpp_account/account_2',
                }
              ]
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
