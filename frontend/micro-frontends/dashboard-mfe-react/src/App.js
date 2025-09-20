import React from 'react';
import 'antd/dist/reset.css';
import { Card, Col, Row, Statistic, Table, Progress, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarCircleOutlined, RiseOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

// Mock Data
const interactionData = [
  { name: 'Feb', Chat: 180, Call: 140 }, { name: 'Mar', Chat: 80, Call: 40 },
  { name: 'Apr', Chat: 185, Call: 220 }, { name: 'May', Chat: 35, Call: 80 },
  { name: 'Jun', Chat: 200, Call: 45 }, { name: 'Jul', Chat: 80, Call: 120 },
];
const leaderboardData = [
  { key: '1', rank: '#1', name: 'Alaska Young', percentage: 95 },
  { key: '2', rank: '#2', name: 'Alex Shotay', percentage: 90 },
  { key: '3', rank: '#3', name: 'Mina Lee', percentage: 76 },
];
const pieData = [{ name: 'Medical', value: 28 }, { name: 'Sport', value: 19 }, { name: 'Electronics', value: 12 }, { name: 'Bakery', value: 32 }];
const COLORS = ['#8884d8', '#82ca9d', '#FFBB28', '#FF8042'];

function App() {
  return (
    <div style={{ background: '#f0f2f5', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}><h2>Dashboard</h2></Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Total Return" value={4672.20} prefix={<DollarCircleOutlined />} suffix={<Tag color="green"><RiseOutlined /> 27%</Tag>} precision={2} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Flagged Calls" value={204765} prefix={<PhoneOutlined />} suffix={<Tag color="green"><RiseOutlined /> 32%</Tag>} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Total Interaction" value={12045} prefix={<MessageOutlined />} suffix={<Tag color="red"><RiseOutlined /> -16%</Tag>}/></Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Total Interaction">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interactionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Call" fill="#8884d8" name="Call" />
                <Bar dataKey="Chat" fill="#82ca9d" name="Chat" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Leaderboard">
            <Table dataSource={leaderboardData} pagination={false} size="small">
              <Table.Column title="Rank" dataIndex="rank" key="rank" />
              <Table.Column title="Name" dataIndex="name" key="name" />
              <Table.Column title="Score" dataIndex="percentage" key="percentage" render={val => <Progress percent={val} size="small" />} />
            </Table>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Keyword Categories">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={(c) => c.name}>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default App;