import React from 'react';
import 'antd/dist/reset.css';
import { Card, Col, Row, Statistic, Table, Progress, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarCircleOutlined, RiseOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

const interactionData = [
  { name: 'Feb', Chat: 180, Call: 140 }, { name: 'Mar', Chat: 80, Call: 40 },
  { name: 'Apr', Chat: 185, Call: 220 }, { name: 'May', Chat: 35, Call: 80 },
];
const leaderboardData = [ { key: '1', name: 'Alaska Young', percentage: 95 }, { key: '2', name: 'Alex Shotay', percentage: 90 } ];
const pieData = [{ name: 'Medical', value: 28 }, { name: 'Sport', value: 19 }, { name: 'Bakery', value: 32 }];
const COLORS = ['#8884d8', '#82ca9d', '#FFBB28'];

function App() {
  return (
    <div style={{ background: '#f0f2f5', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}><h2>Dashboard</h2></Col>
        <Col sm={12} md={8}><Card><Statistic title="Total Return" value={4672.20} prefix={<DollarCircleOutlined />} suffix={<Tag color="green"><RiseOutlined /> 27%</Tag>} precision={2} /></Card></Col>
        <Col sm={12} md={8}><Card><Statistic title="Flagged Calls" value={204765} prefix={<PhoneOutlined />} suffix={<Tag color="green"><RiseOutlined /> 32%</Tag>} /></Card></Col>
        <Col sm={24} md={8}><Card><Statistic title="Total Interaction" value={12045} prefix={<MessageOutlined />} suffix={<Tag color="red"><RiseOutlined /> -16%</Tag>}/></Card></Col>
        <Col xs={24} lg={16}>
          <Card title="Total Interaction">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interactionData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="Call" fill="#8884d8" /><Bar dataKey="Chat" fill="#82ca9d" /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Leaderboard"><Table dataSource={leaderboardData} pagination={false} size="small"><Table.Column title="Name" dataKey="name" /><Table.Column title="Score" dataIndex="percentage" render={val => <Progress percent={val} size="small" />} /></Table></Card>
        </Col>
      </Row>
    </div>
  );
}
export default App;