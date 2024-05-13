import React, { useState, useEffect } from "react"
import { Card, Button, Form, Input, Table, Space, message, DatePicker } from 'antd'
import {  SearchOutlined,ReloadOutlined } from "@ant-design/icons"
import { useAlarm } from '../AlarmContext'  // 确保正确导入
import Column from "antd/es/table/Column"
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from "../apiConfig"

const Message = () => {
  const { alarms, setAlarms,fetchAlarms } = useAlarm();  
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate()

  // const searchItems = (searchValue) => {
  //   setSearchInput(searchValue)
  //   if (searchInput !== '') {
  //     const filteredData = filesData.filter((item) => {
  //       return Object.values(item).join('').toLowerCase().includes(searchInput.toLowerCase())
  //     })
  //     setFilteredResults(filteredData)
  //   }
  //   else {
  //     setFilteredResults(filesData)
  //   }
  // }

  // function getData() {
  //   axios({
  //     method: "GET",
  //     url: "/files",
  //   })
  //     .then((response) => setFilesData(response.data)).catch((error) => {
  //       if (error.response) {
  //         console.log(error.response)
  //         console.log(error.response.status)
  //         console.log(error.response.headers)
  //       }
  //     })
  // }

  useEffect(() => {
    console.log("Alarm message updated:", alarms);
}, [alarms]);


  return (
    <>
      <Card title='Alarm List' 
        extra={<Button type="primary" icon={<ReloadOutlined />} onClick={() => setAlarms([...alarms])}>
        </Button>}
      >

        <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="inline"
              onFinish={(v) => {
                message.success('Search succeed');
              }}
              direction="vertical"
            >
              <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}>
                <Form.Item label='HPP Account' name='HPP Account'>
                  <Input placeholder="Please enter HPP account" />
                </Form.Item>
                <Form.Item label='Device Serial' name='Device Serial'>
                  <Input placeholder="Please enter device number" />
                </Form.Item>
              </Space>

              <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}>
                <Form.Item label='Alarm Type' name='Alarm Type'>
                  <Input placeholder="Please enter alarm type" />
                </Form.Item>
                <Form.Item label='Alarm Description' name='Alarm Description'>
                  <Input placeholder="Please enter trigger event" />
                </Form.Item>
              </Space>

              <Form.Item label='Time Range' name='Time Range'>
                <DatePicker.RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>

              <Form.Item style={{ marginLeft: 'auto' }}>
                <Button type="primary"  htmlType="submit">
                  <SearchOutlined />
                  Search
                </Button>
              </Form.Item>
            </Form>
          </Space>
          <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}> </Space>
          {/* {searchInput.length > 1 ? ( */}
            <Table
              dataSource={alarms}
              pagination={{ pageSize: 6 }}
              >
              <Column
                title="HPP_account" dataIndex="app_key" key="app_key"
              />
              <Column
                title="Device_serial" dataIndex="device_serial" key="device_serial"
              />
              <Column
                title="Event_type" dataIndex="event_type" key="event_type"
              />
              <Column
                title="Description" dataIndex="description" key="description"
              />
              <Column
                title="Trigger_time" dataIndex="trigger_time" key="trigger_time"
              />
              <Column
                title="Channel" dataIndex="channel_name" key="channel_name"
              />
              <Column
                title="Dectection_target" dataIndex="detection_target" key="detection_target"
              />
              <Column
                title="Target_position" dataIndex="target_position" key="target_position"
              />
              <Column
                title="Zone" dataIndex="zone" key="zone"
              />
              <Column
                title="Partition" dataIndex="system_name" key="system_name"
              />
              <Column
                title="User Name" dataIndex="user_name" key="user_name"
              />
              <Column
                title="Event Code" dataIndex="event_code" key="event_code"
              />
              <Column
                title="Action"
                key="action"
                render={() => (
                  <a href="http://10.198.67.90:5000/alarms" target="_blank" rel="noopener noreferrer">
                    查看
                  </a>
                )}
              />
            </Table>
      </Card>
      
    </>

  )
}

export default Message
