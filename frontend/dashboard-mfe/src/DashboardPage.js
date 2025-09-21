import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/charts';

const { Title } = Typography;
const API_BASE_URL = '/api'; // Nginx will proxy this

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [salesByItem, setSalesByItem] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, salesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/analytics/summary/today`),
                    fetch(`${API_BASE_URL}/analytics/sales-by-item`)
                ]);
                const summaryData = await summaryRes.json();
                const salesData = await salesRes.json();
                setSummary(summaryData);
                setSalesByItem(salesData.map(d => ({ type: d.name, value: Number(d.total_revenue) })));
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
    }

    const pieConfig = {
        appendPadding: 10,
        data: salesByItem,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: { type: 'inner', offset: '-50%', content: '{value}', style: { textAlign: 'center' } },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    };
    
    return (
        <div>
            <Title level={2}>Today's Dashboard</Title>
            <Row gutter={16}>
                <Col span={8}>
                    <Card><Statistic title="Total Sales" value={summary?.total_sales} precision={2} prefix="$" /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="Total Orders" value={summary?.total_orders} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="Average Check" value={summary?.average_check} precision={2} prefix="$" /></Card>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '24px' }}>
                <Col span={16}>
                    <Card title="Sales by Hour (Dummy Data)">
                         <Column data={dummySalesData} xField="hour" yField="sales" height={300} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Best Selling Items (by Revenue)">
                        <Pie {...pieConfig} height={300} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const dummySalesData = [
    { hour: '10am', sales: 120 }, { hour: '11am', sales: 250 },
    { hour: '12pm', sales: 800 }, { hour: '1pm', sales: 1150 },
    { hour: '2pm', sales: 900 }, { hour: '3pm', sales: 400 },
];

export default DashboardPage;