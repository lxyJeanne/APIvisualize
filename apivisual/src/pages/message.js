import React, { useState, useEffect } from "react"
import { Card, Button, Form, Input, Table, Space, message, DatePicker } from 'antd'
import { SearchOutlined,DownloadOutlined , ClearOutlined} from "@ant-design/icons"
import { useAlarm } from '../AlarmContext'  
import Column from "antd/es/table/Column"
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from "../apiConfig"
import axios from "axios"

const Message = () => {
  const { alarms, setAlarms,fetchAlarms } = useAlarm();  
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
        fetchAlarms();
    }, 30000); // 每30秒请求一次，而不是每秒
    return () => clearInterval(interval);
}, []);
function handleClear() {
  if (window.confirm("Are you sure you want to clear?")) {
      // 如果用户点击“确定”，则发送 POST 请求
      axios.post(API_ENDPOINTS.clear, {
          data: "all"
      })
      .then(response => {
          console.log('Success:', response.data);
          // 如果请求成功，刷新页面
          window.location.reload();
      })
      .catch(error => {
          console.error('Error:', error);
          if (error.response) {
              // 请求已发出，但服务器响应的状态码不在 2xx 范围内
              console.error('Error status', error.response.status);
              console.error('Error data', error.response.data);
          } else if (error.request) {
              console.error('No response', error.request);
          } else {
              console.error('Error', error.message);
          }
      });
  } else {
      console.log('User canceled the action.');
  }
}

  return (
    <>
      <Card title='Alarm List' 
        extra={
        <Space >
          <a href="https://open.hikvision.com/hardware/structures/NET_DVR_ALARMHOST_CID_ALL_MINOR_TYPE.html" target="_blank" rel="noopener noreferrer">
            <Button type="dashed">
            CID_code Chart
            </Button>
          </a>  
          <Button type="primary" icon={<DownloadOutlined />} onClick={() =>window.location.href = API_ENDPOINTS.download }>
          Download
          </Button>
          <Button type="primary" danger icon={<ClearOutlined /> } onClick={handleClear}>
          Clear
          </Button>
        </Space>}
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
              size="middle"
              style={{ width: '100%' }} // 确保表格宽度填满容器
              >
              <Column
                title="HPP account" dataIndex="app_key" key="app_key"
              />
              <Column
                title="Device serial" dataIndex="device_serial" key="device_serial"
              />
              <Column
                title="Event type" dataIndex="event_type" key="event_type"
              />
              <Column
                title="Description" dataIndex="description" key="description"
              />
              <Column
                title="Trigger time" dataIndex="trigger_time" key="trigger_time"
              />
              <Column
                title="Channel" dataIndex="channel_name" key="channel_name"
              />
              <Column
                title="Target" dataIndex="detection_target" key="detection_target"
              />
              <Column
                title="Position" dataIndex="target_position" key="target_position"
              />
              <Column
                title="Zone" dataIndex="zone" key="zone"
              />
              <Column
                title="Partition" dataIndex="system_name" key="system_name"
              />
              <Column
                title="Operator" dataIndex="user_name" key="user_name"
              />
              <Column
                title="CID Code" dataIndex="event_code" key="event_code"
              />
              <Column
                title="Action"
                key="action"
                render={() => (
                  <a href={API_ENDPOINTS.alarms} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                )}
              />
            </Table>
      </Card>
      
    </>

  )
}

export default Message

