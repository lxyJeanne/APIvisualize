import React, { useState, useEffect } from "react";
import { Card, Button, Form, Input, Table, Space, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined,DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import Column from "antd/es/table/Column";
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../UserContext';  
import { API_ENDPOINTS } from "../apiConfig";

const User = () => {
    const { users, setUsers,fetchUsers } = useUsers();  
    const [isShow, setIsShow] = useState(false);
    const [myForm] = Form.useForm();
    const [searchForm] = Form.useForm();
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState([]);

    const handleFormSubmit = async (values) => {
        try {
            const response = await axios.post(API_ENDPOINTS.submit, {
                appkey: values.appkey,
                secretkey: values.secretkey
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                const data = response.data;
                if (data.status === 'success') {
                    message.success(data.message || 'Success submit');
                    fetchUsers();  // 重新获取所有用户数据，确保列表是最新的
                    setIsShow(false);  
                } else {
                    throw new Error(data.message || 'An unexpected error occurred');
                }
            } else {
                throw new Error('HTTP status code: ' + response.status);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error(error.response?.data?.message || error.message || 'Failed to submit');
        }
    };

    const handleDelete = async (record) => {
        try {
            const response = await axios.post(API_ENDPOINTS.delete, {
                username: record.username,
                password: record.password
            });
            if (response.status === 200) {
                setUsers(prevUsers => prevUsers.filter(user => user.id !== record.id));
                message.success('User deleted successfully');
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Failed to delete user');
        }
    };

    function handleClear(record) {
        if (window.confirm("Are you sure you want to clear?")) {
            // 如果用户点击“确定”，则发送 POST 请求
            axios.post(API_ENDPOINTS.clear, {
                data: record.username
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

    const handleView = (record) => {
        console.log(record);
        navigate(`/${record.username}`, { state: { record } });
    };

    const handleSearch = (values) => {
        const searchValue = values.globalSearch.toLowerCase();
        const filteredResults = users.filter(user =>
            user.username.toLowerCase().includes(searchValue) ||
            user.password.toLowerCase().includes(searchValue) ||
            user.id.toString().includes(searchValue)
        );
        setSearchResults(filteredResults);
        message.success('Search completed');
    };

    const handleClearSearch = () => {
        setSearchResults(users);
        searchForm.resetFields(['globalSearch']);
        message.info('Search cleared');
    };

    useEffect(() => {
        setSearchResults(users);
    }, [users]);

    return (
        <>
            <Card title='User List'
                extra={
                    <Space>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={() => window.location.href = API_ENDPOINTS.download}>
                            Log
                        </Button>
                        <Button type="primary" icon={<PlusOutlined onClick={() => setIsShow(true)} />} />
                    </Space>
                }>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form layout="inline" onFinish={handleSearch} form={searchForm}
                        direction="vertical"
                    >
                        <Form.Item label="Search Global" name="globalSearch">
                            <Input placeholder="Search across all fields" />
                        </Form.Item>
                        <Form.Item style={{ marginLeft: 'auto' }}>
                        <Button type="link" onClick={handleClearSearch} style={{ color: 'gray', fontSize: '12px'}} >
                                Clear
                            </Button>
                            <Button type="primary" htmlType="submit">
                                <SearchOutlined />
                                Search
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Table dataSource={searchResults}  pagination={{ pageSize: 5 }}>
                        <Column title="id" dataIndex="id" key="id" />
                        <Column title="Hpp Account" dataIndex="username" key="username" />
                        <Column title="Password" dataIndex="password" key="password" />
                        <Column
                            title="Action"
                            key="action"
                            render={(_, record) => {
                                if (!record || !record.id) return <span>Data missing!</span>;
                                return (
                                    <Space size="middle">
                                        <a onClick={() => handleView(record)}>View</a>
                                        <a onClick={() => handleDelete(record)}>Unsubscribe</a>
                                        <a onClick={() => handleClear(record)}>Clear</a>
                                    </Space>
                                );
                            }}
                        />
                    </Table>
                </Space>
            </Card>
            <Modal
                title='Add User'
                open={isShow}
                onCancel={() => setIsShow(false)}
                onOk={() => myForm.submit()}
                destroyOnClose
                maskClosable={false}
                footer={() => (
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <div>
                            <Button key="cancel" onClick={() => setIsShow(false)}>
                                Cancel
                            </Button>
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
                    <Form.Item label='Appkey' name='appkey'>
                        <Input placeholder="Please enter appkey" style={{ marginLeft: '10px' }} />
                    </Form.Item>
                    <Form.Item label='Secretkey' name='secretkey'>
                        <Input placeholder="Please enter secretkey" style={{ marginLeft: '10px' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default User;
