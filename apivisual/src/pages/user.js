import React, { useState, useEffect } from "react";
import { Card, Button, Form, Input, Table, Space, Modal, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import Column from "antd/es/table/Column";
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../UserContext';  // 确保正确导入

const User = () => {
    const { users, setUsers,fetchUsers } = useUsers();  // 使用全局用户状态
    const [isShow, setIsShow] = useState(false);
    const [myForm] = Form.useForm();
    const [alarmData, setAlarmData] = useState([]);
    const navigate = useNavigate();

    const handleFormSubmit = async (values) => {
        try {
            const response = await axios.post('http://10.198.67.90:5000/submit', {
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
                    // 确保你访问的是正确的数据属性
                    fetchUsers();  // 重新获取所有用户数据，确保列表是最新的
                    setIsShow(false);  // 关闭模态框
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
            const response = await axios.post('http://10.198.67.90:5000/delete', {
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

    const handleView = (record) => {
        console.log(record);
        message.success('View file');
        navigate(`/hpp_account/account_${record.id}`, { state: { record } });
    };

    useEffect(() => {
        console.log("Users updated:", users);
    }, [users]);

    return (
        <>
            <Card title='User List'
                extra={
                    <Space>
                        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setUsers([...users])}>
                        </Button>
                        <Button type="primary" icon={<PlusOutlined onClick={() => setIsShow(true)} />} />
                    </Space>
                }>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form layout="inline"
                        onFinish={(v) => {
                            message.success('Search succeed');
                        }}
                        direction="vertical"
                    >
                        <Form.Item label="全局搜索" name="globalSearch">
                            <Input placeholder="Search across all fields" />
                        </Form.Item>
                        <Form.Item style={{ marginLeft: 'auto' }}>
                            <Button type="primary" htmlType="submit">
                                <SearchOutlined />
                                Search
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
                <Table dataSource={users}>
                    <Column title="id" dataIndex="id" key="id" />
                    <Column title="账户名" dataIndex="username" key="username" />
                    <Column title="密码" dataIndex="password" key="password" />
                    <Column
                        title="操作"
                        key="action"
                        render={(_, record) => {
                            if (!record || !record.id) return <span>Data missing!</span>;
                            return (
                                <Space size="middle">
                                    <a onClick={() => handleView(record)}>查看</a>
                                    <a onClick={() => handleDelete(record)}>删除</a>
                                </Space>
                            );
                        }}
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
                        <Button key="delete" type="danger" style={{ border: '1px solid red' }} onClick={() => {
                            myForm.setFieldsValue({ action: 'delete' });
                            myForm.submit();
                        }}>
                            Delete
                        </Button>
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
