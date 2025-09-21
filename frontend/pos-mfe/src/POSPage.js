import React, { useState } from 'react';
import { Row, Col, Card, Tag, Typography, Button, Modal, List, InputNumber, message } from 'antd';

const { Title, Text } = Typography;

const initialTables = [
  { id: 1, name: 'T1', status: 'available' }, { id: 2, name: 'T2', status: 'occupied' },
  { id: 3, name: 'T3', status: 'available' }, { id: 4, name: 'T4', status: 'reserved' },
];

const menuItems = [
    { id: 1, name: 'Seabass', price: 25.50 }, { id: 2, name: 'Tomahawk', price: 75.00 },
    { id: 3, name: 'Burger', price: 18.00 }, { id: 4, name: 'Albikra', price: 22.00 },
];

const POSPage = () => {
    const [tables, setTables] = useState(initialTables);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [currentOrder, setCurrentOrder] = useState({});

    const handleTableClick = (table) => {
        if (table.status === 'available') {
            setSelectedTable(table);
            setCurrentOrder({});
            setIsModalVisible(true);
        } else {
            message.info(`Table ${table.name} is currently ${table.status}.`);
        }
    };

    const handleAddToOrder = (itemId, quantity) => {
        setCurrentOrder(prev => ({...prev, [itemId]: quantity }));
    };

    const handlePlaceOrder = () => {
        console.log("Placing order for table:", selectedTable.id);
        console.log("Order details:", currentOrder);
        // In a real app, you'd make an API call here:
        // POST /api/orders with { table_id, employee_id, items: [...] }
        message.success(`Order placed for table ${selectedTable.name}!`);
        
        // Update table status
        setTables(tables.map(t => t.id === selectedTable.id ? {...t, status: 'occupied' } : t));

        setIsModalVisible(false);
        setSelectedTable(null);
    };

    const getStatusColor = (status) => {
        if (status === 'available') return 'green';
        if (status === 'occupied') return 'volcano';
        return 'gold';
    };

    return (
        <div>
            <Title level={2}>Table Layout</Title>
            <Row gutter={[16, 16]}>
                {tables.map(table => (
                    <Col key={table.id} span={6}>
                        <Card hoverable onClick={() => handleTableClick(table)}>
                            <div style={{ textAlign: 'center' }}>
                                <Title level={4}>{table.name}</Title>
                                <Tag color={getStatusColor(table.status)}>{table.status.toUpperCase()}</Tag>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={`New Order for Table ${selectedTable?.name}`}
                visible={isModalVisible}
                onOk={handlePlaceOrder}
                onCancel={() => setIsModalVisible(false)}
                okText="Place Order"
            >
                <List
                    dataSource={menuItems}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <InputNumber min={0} defaultValue={0} onChange={(val) => handleAddToOrder(item.id, val)} />
                            ]}
                        >
                            <List.Item.Meta title={item.name} description={`$${item.price.toFixed(2)}`} />
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default POSPage;