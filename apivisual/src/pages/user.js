import React, { useState, useEffect } from "react"
import { Card, Button, Form, Input, Table, Space, Modal, message, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined } from "@ant-design/icons"
import axios from "axios"
import Column from "antd/es/table/Column"
import { useNavigate } from 'react-router-dom'

const User = () => {
  const [isShow, setIsShow] = useState(false)  //controle Uploading Modal present/hide
  const [myForm] = Form.useForm() //get form element
  const [filesData, setFilesData] = useState([])
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
    // getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleFormSubmit = async (values) => {
    try {
      const response = await axios.post('http://172.0.0.1:5000/submit', {
        headers: {
          'Content-Type': 'application/json'
        },
        appkey: values.Appkey,
        secretkey: values.Secretkey
      });
      message.success('Success submit');
      console.log(response.data);
      setIsShow(false); // 关闭模态框
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to submit');
    }
  };

  return (
    <>
      <Card title='Alarm List'
        extra={<Button type="primary" icon={<PlusOutlined onClick={() => {
          setIsShow(true)
        }} />}></Button>}
      >

        {/* {useEffect(() => { getData(); }, [])} */}

        <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="inline"
              onFinish={(v) => {
                message.success('Search succeed');
              }}
              direction="vertical"
            >
              <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}>
                <Form.Item label='HPP编号' name='HPP编号'>
                  <Input placeholder="Please enter HPP account" />
                </Form.Item>
                <Form.Item label='设备编号' name='设备编号'>
                  <Input placeholder="Please enter device number" />
                </Form.Item>
              </Space>

              {/* Second Row */}
              <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}>
                <Form.Item label='报警类型' name='报警类型'>
                  <Input placeholder="Please enter alarm type" />
                </Form.Item>
                <Form.Item label='触发事件' name='触发事件'>
                  <Input placeholder="Please enter trigger event" />
                </Form.Item>
              </Space>

              {/* DatePicker in its own row */}
              <Form.Item label='时间范围' name='时间范围'>
                <DatePicker.RangePicker
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>

              {/* 全局搜索栏 */}
              <Space direction="vertical" style={{ width: '100%' }}></Space>
              <Form.Item label="全局搜索" name="globalSearch">
                <Input placeholder="Search across all fields" />
              </Form.Item>
              {/* Search button in its own row */}
              
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
              dataSource={filteredResults}>
              <Column
                title="HPP编号" dataIndex="HPP_account" key="HPP_account"
              />
              <Column
                title="设备编号" dataIndex="device_serial" key="device_serial"
              />
              <Column
                title="报警类型" dataIndex="event_type" key="event_type"
              />
              <Column
                title="触发时间" dataIndex="trigger_time" key="trigger_time"
              />
              <Column
                title="操作"
                key="action"
                render={(_, dataIndex) => (
                  <a onClick={(v) => {
                    // console.log(text)
                    console.log(dataIndex)
                    message.success('View file')
                    navigate('', { state: { dataIndex } })

                  }}>
                    View
                  </a>
                )}
              />
            </Table>
      </Card>
      <Modal
      title='添加HPP账户'
      open={isShow}
      onCancel={() => setIsShow(false)}
      onOk={() => myForm.submit()}
      destroyOnClose
      maskClosable={false}
      footer={() => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button key="delete" type="danger"  style={{ border: '1px solid red' }}   onClick={() => {
            myForm.setFieldsValue({ action: 'delete' });
            myForm.submit();
          }}>
            Delete User
          </Button>
          <div>
            <Button key="cancel" onClick={() => setIsShow(false)}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={() => myForm.submit()}>
              OK
            </Button>
          </div>
        </Space>
      )}
    >
      <Form
        preserve={false}
        onFinish={handleFormSubmit}
        labelCol={{ span: 3 }}
        form={myForm}
      >
        <Form.Item label='Appkey' name='Appkey'>
          <Input placeholder="Please enter appkey" style={{ marginLeft: '10px' }} />
        </Form.Item>
        <Form.Item label='Secretkey' name='Secretkey'>
          <Input placeholder="Please enter secretkey" style={{ marginLeft: '10px' }} />
        </Form.Item>
      </Form>
    </Modal>
    </>

  )
}

export default User
