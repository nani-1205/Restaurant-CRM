import React from 'react';
import 'antd/dist/reset.css';
import { Card, Col, Row, Statistic, Table, Progress, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarCircleOutlined, RiseOutlined, PhoneOutlined, MessageOutlined, ArrowDownOutlined } from '@ant-design/icons';

// Mock Data to replicate the video's UI
const interactionData = [
  { name: 'Feb', Chat: 180, Call: 140 },
  { name: 'Mar', Chat: 75, Call: 45 },
  { name: 'Apr', Chat: 185, Call: 220 },
  { name: 'May', Chat: 35, Call: 80 },
  { name: 'Jun', Chat: 205, Call: 45 },
  { name: 'Jul', Chat: 80, Call: 120 },
];

const leaderboardData = [
  { key: '1', rank: '🥇', name: 'Alaska Young', percentage: 95 },
  { key: '2', rank: '🥈', name: 'Alex Shotay', percentage: 90 },
  { key: '3', rank: '🥉', name: 'Mina Lee', percentage: 76 },
  { key: '4', rank: '#4', name: 'Mesut Ozil', percentage: 65 },
  { key: '5', rank: '#5', name: 'Kai Havertz', percentage: 45 },
];

const App = () => {
  return (
    <div style={{ background: '#f8f9fa', padding: '24px', fontFamily: 'sans-serif' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <h2 style={{ marginBottom: 0, fontWeight: 600 }}>Dashboard</h2>
        </Col>

        {/* KPI Cards */}
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Return"
              value={4672.20}
              precision={2}
              valueStyle={{ color: '#3f8600', fontWeight: 500 }}
              prefix={<DollarCircleOutlined />}
              suffix={<Tag color="green" icon={<RiseOutlined />} style={{ marginLeft: '8px' }}>27%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Flagged Calls"
              value={204765}
              valueStyle={{ color: '#00529b', fontWeight: 500 }}
              prefix={<PhoneOutlined />}
              suffix={<Tag color="green" icon={<RiseOutlined />} style={{ marginLeft: '8px' }}>32%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total Interaction"
              value={12045}
              valueStyle={{ color: '#cf1322', fontWeight: 500 }}
              prefix={<MessageOutlined />}
              suffix={<Tag color="red" icon={<ArrowDownOutlined />} style={{ marginLeft: '8px' }}>16%</Tag>}
            />
          </Card>
        </Col>

        {/* Main Chart and Leaderboard */}
        <Col xs={24} lg={16}>
          <Card title="Total Interaction" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={interactionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip wrapperStyle={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none', borderRadius: '8px' }}/>
                <Legend />
                <Bar dataKey="Call" fill="#8884d8" name="Call" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Chat" fill="#82ca9d" name="Chat" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Leaderboard" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <Table dataSource={leaderboardData} pagination={false} size="small">
              <Table.Column title="Rank" dataIndex="rank" key="rank" />
              <Table.Column title="Name" dataIndex="name" key="name" />
              <Table.Column
                title="Score"
                dataIndex="percentage"
                key="percentage"
                render={(val) => <Progress percent={val} size="small" status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />}
              />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default App;```

#### `index.css`
```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}