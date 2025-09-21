import React, { useState, useEffect } from 'react';
import { Table, Spin, Typography, Button, Modal, Form, Input, message } from 'antd';

const { Title } = Typography;
const API_BASE_URL = '/api';

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // In a real app, you might merge data from two endpoints here
            const res = await fetch(`${API_BASE_URL}/analytics/employee-performance`);
            const data = await res.json();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
            message.error("Could not load employee data.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddEmployee = (values) => {
        console.log('New Employee Data:', values);
        // API Call to POST /api/users
        // fetch(`${API_BASE_URL}/users`, { method: 'POST', body: JSON.stringify(values), ... })
        message.success(`Employee ${values.first_name} added!`);
        setIsModalVisible(false);
        form.resetFields();
        // Ideally, refetch the list after adding
        // fetchEmployees(); 
    };

    const columns = [
        { title: 'First Name', dataIndex: 'first_name', key: 'first_name' },
        { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
        { title: 'Orders Taken', dataIndex: 'orders_taken', key: 'orders_taken', sorter: (a, b) => a.orders_taken - b.orders_taken },
        { title: 'Total Sales', dataIndex: 'total_sales', key: 'total_sales', render: (val) => `$${Number(val).toFixed(2)}`, sorter: (a, b) => a.total_sales - b.total_sales },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Employee Performance</Title>
                <Button type="primary" onClick={() => setIsModalVisible(true)}>Add Employee</Button>
            </div>
            <Table
                dataSource={employees}
                columns={columns}
                rowKey="email"
                loading={loading}
            />
            <Modal
                title="Add New Employee"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleAddEmployee}>
                    <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="role_id" label="Role ID" initialValue={2} rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeesPage;