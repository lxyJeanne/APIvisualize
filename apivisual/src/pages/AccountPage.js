import React, { useState, useEffect } from "react";
import { Card, Button, Form, Input, Table, Space, message, DatePicker } from 'antd';
import { SearchOutlined, DownloadOutlined, ClearOutlined, SendOutlined } from "@ant-design/icons";
import { useAlarm } from '../AlarmContext';
import Column from "antd/es/table/Column";
import { useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from "../apiConfig";
import axios from "axios";
import dayjs from "dayjs";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const AccountPage = () => {
    const params = useParams();
    const Account = Object.values(params)[0];
    console.log("Account=", Account);

    const { alarms, setAlarms, fetchAlarms } = useAlarm();
    const [form] = Form.useForm();
    const [filteredAlarms, setFilteredAlarms] = useState([]);
    const [filterConditions, setFilterConditions] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndFilterAlarms = () => {
            fetchAlarms().then(() => {
                const filteredData = alarms.filter(alarm => alarm.app_key === Account);
                setFilteredAlarms(filteredData);
            });
        };
        fetchAndFilterAlarms();
        const interval = setInterval(() => {
            fetchAndFilterAlarms();
        }, 15000);
        return () => clearInterval(interval);
    }, [Account]);

    useEffect(() => {
        applyFilters(filterConditions, alarms);
    }, [alarms, filterConditions]);

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear?")) {
            axios.post(API_ENDPOINTS.clear, { data: Account })
                .then(response => {
                    console.log('Success:', response.data);
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    if (error.response) {
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
    };

    const handleSearch = (values) => {
        setFilterConditions(values);
        applyFilters(values, alarms);
        message.success('Search completed');
    };

    const applyFilters = (filters, data) => {
        let filtered = data.filter(alarm => alarm.app_key === Account);

        if (filters["Device Serial"]) {
            filtered = filtered.filter(alarm => alarm.device_serial.toLowerCase().includes(filters["Device Serial"].toLowerCase()));
        }
        if (filters["Alarm Type"]) {
            filtered = filtered.filter(alarm => alarm.event_type.toLowerCase().includes(filters["Alarm Type"].toLowerCase()));
        }
        if (filters["Alarm Description"]) {
            filtered = filtered.filter(alarm => alarm.description.toLowerCase().includes(filters["Alarm Description"].toLowerCase()));
        }
        if (filters["Zone"]) {
          filtered = filtered.filter(alarm => alarm.zone.toLowerCase().includes(filters["Zone"].toLowerCase()));
      } 
      if (filters["Partition"]) {
          filtered = filtered.filter(alarm => alarm.system_name.toLowerCase().includes(filters["Partition"].toLowerCase()));
      } 
      if (filters["Operator"]) {
          filtered = filtered.filter(alarm => alarm.user_name.toLowerCase().includes(filters["Operator"].toLowerCase()));
      } 
      if (filters["CID Code"]) {
        filtered = filtered.filter(alarm => alarm.event_code != null && alarm.event_code.toString().includes(filters["CID Code"]));
    }
        if (filters["Time Range"] && filters["Time Range"].length === 2) {
            const [start, end] = filters["Time Range"].map(time => dayjs(time));
            // console.log("filters:", filters["Time Range"]);
            // console.log("start:", start.format("YYYY-MM-DD HH:mm:ss"));
            // console.log("end:", end.format("YYYY-MM-DD HH:mm:ss"));

            filtered = filtered.filter(alarm => {
                const alarmTime = dayjs(alarm.trigger_time, "YYYY-MM-DD HH:mm:ss");
                const isWithinRange = alarmTime.isSame(start) || alarmTime.isSame(end) || (alarmTime.isAfter(start) && alarmTime.isBefore(end));
                // console.log("alarmTime:", alarmTime.format("YYYY-MM-DD HH:mm:ss"), "isWithinRange:", isWithinRange);
                return isWithinRange;
            });
        }

        setFilteredAlarms(filtered);
    };

    const handleClearSearch = () => {
        form.resetFields();
        setFilterConditions({});
        setFilteredAlarms(alarms.filter(alarm => alarm.app_key === Account));
        message.info('Search cleared');
    };

    
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredAlarms);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Alarms");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `alarms_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`);
  };

    return (
        <>
            <Card title='Alarm List'
                extra={
                    <Space>
                        <a href="https://open.hikvision.com/hardware/structures/NET_DVR_ALARMHOST_CID_ALL_MINOR_TYPE.html" target="_blank" rel="noopener noreferrer">
                            <Button type="dashed">
                                CID_code Chart
                            </Button>
                        </a>
                        <Button type="primary" icon={<DownloadOutlined />} onClick={exportToExcel}>
                            Export
                        </Button>
                        <Button type="primary" danger icon={<ClearOutlined />} onClick={handleClear}>
                            Clear
                        </Button>
                        <Button type="primary" icon={<SendOutlined />} onClick={() => window.location.href = `${API_ENDPOINTS.fetch}/${Account}`}>
                            Fetch
                        </Button>
                    </Space>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Form layout="inline" form={form} onFinish={handleSearch}>
                        <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}>
                            <Form.Item label='Device Serial' name='Device Serial'>
                                <Input placeholder="Please enter device number" />
                            </Form.Item>
                        
                            <Form.Item label='Alarm Type' name='Alarm Type'>
                                <Input placeholder="Please enter alarm type" />
                            </Form.Item>
                            <Form.Item label='Alarm Description' name='Alarm Description'>
                                <Input placeholder="Please enter trigger event" />
                            </Form.Item>
                            </Space>

                        <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}>
                            <Form.Item label='Zone' name='Zone'>
                                <Input placeholder="Please enter zone number" />
                            </Form.Item>                           
                            <Form.Item label='Partition' name='Partition'>
                                <Input placeholder="Please enter partition number" />
                            </Form.Item>
                            <Form.Item label='Operator' name='Operator'>
                                <Input placeholder="Please enter operator name" />
                            </Form.Item>
                            <Form.Item label='CID Code' name='CID Code'>
                                <Input placeholder="Please enter CID code" />
                            </Form.Item>
                        </Space>

                        <Form.Item label='Time Range' name='Time Range'>
                            <DatePicker.RangePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                format="YYYY-MM-DD HH:mm:ss"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginLeft: 'auto' }}>
                            <Button type="link" onClick={handleClearSearch} style={{ color: 'gray', fontSize: '12px' }}>
                                Clear
                            </Button>
                            <Button type="primary" htmlType="submit">
                                <SearchOutlined />
                                Search
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
                <Space direction="horizontal" style={{ display: 'flex', marginBottom: 20 }}> </Space>
                <Table
                    dataSource={filteredAlarms}
                    size="middle"
                >
                    <Column
                        title="Device serial" dataIndex="device_serial" key="device_serial"
                        sorter={(a, b) => a.device_serial.localeCompare(b.device_serial)}
                    />
                    <Column
                        title="Event type" dataIndex="event_type" key="event_type"
                        sorter={(a, b) => a.event_type.localeCompare(b.event_type)}
                    />
                    <Column
                        title="Description" dataIndex="description" key="description"
                        render={(text, record) => (
                            record.description === "Linkage" ? <a href={record.picture_url}>{text}</a> : text
                        )}
                        sorter={(a, b) => a.description.localeCompare(b.description)}
                    />
                    <Column
                        title="Trigger time" dataIndex="trigger_time" key="trigger_time"
                        sorter={(a, b) => new Date(a.trigger_time) - new Date(b.trigger_time)}
                    />
                    <Column
                        title="Channel" dataIndex="channel_name" key="channel_name"
                        sorter={(a, b) => a.channel_name.localeCompare(b.channel_name)}
                    />
                    <Column
                        title="Target" dataIndex="detection_target" key="detection_target"
                        sorter={(a, b) => a.detection_target.localeCompare(b.detection_target)}
                    />
                    <Column
                        title="Position" dataIndex="target_position" key="target_position"
                        sorter={(a, b) => a.target_position.localeCompare(b.target_position)}
                    />
                    <Column
                        title="Zone" dataIndex="zone" key="zone"
                        sorter={(a, b) => a.zone.localeCompare(b.zone)}
                    />
                    <Column
                        title="Zone Name" dataIndex="zone_name" key="zone_name"
                        sorter={(a, b) => a.zone_name.localeCompare(b.zone_name)}
                    />
                    <Column
                        title="Partition" dataIndex="system_name" key="system_name"
                        sorter={(a, b) => a.system_name.localeCompare(b.system_name)}
                    />
                    <Column
                        title="Operator" dataIndex="user_name" key="user_name"
                        sorter={(a, b) => a.user_name.localeCompare(b.user_name)}
                    />
                    <Column
                        title="CID Code" dataIndex="event_code" key="event_code"
                        sorter={(a, b) => a.event_code - b.event_code}
                    />
                    <Column
                        title="Action"
                        key="action"
                        render={(_,record) => (
                          <>
                            {record.description === "Linkage" ? (
                                <a href={record.picture_url} target="_blank" rel="noopener noreferrer">
                                    URL
                                </a>
                            ) : (
                                <a href={API_ENDPOINTS.alarms} target="_blank" rel="noopener noreferrer">
                                    View
                                </a>
                            )}
                        </>
                        )}
                    />
                </Table>
            </Card>
        </>
    );
};

export default AccountPage;
