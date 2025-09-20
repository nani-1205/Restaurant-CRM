import React from 'react';
import 'antd/dist/reset.css'; // Import Ant Design styles
import { Card, Col, Row, Statistic, Table, Progress } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css'; // Custom styles

// Mock Data
const interactionData = [
  { name: 'Feb', Chat: 180, Call: 140 }, { name: 'Mar', 80, Call: 40 },
  { name: 'Apr', Chat: 185, Call: 220 }, { name: 'May', Chat: 35, Call: 80 },
  { name: 'Jun', Chat: 200, Call: 45 }, { name: 'Jul', Chat: 80, Call: 120 },
];
const leaderboardData = [
  { rank: '#1', name: 'Alaska Young', percentage: 95 },
  { rank: '#2', name: 'Alex Shotay', percentage: 90 },
];
const COLORS = ['#8884d8', '#82ca9d', '#FFBB28', '#FF8042'];
const pieData = [{ name: 'Medical', value: 28 }, { name: 'Sport', value: 19 }, { name: 'Electronics', value: 12 }];

function App() {
  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        {/* KPI Cards */}
        <Col span={8}><Card><Statistic title="Total Return" value="$4,672.20" prefix="$" /></Card></Col>
        <Col span={8}><Card><Statistic title="Total Flagged Calls" value={204765} /></Card></Col>
        <Col span={8}><Card><Statistic title="Total Interaction" value={12045} /></Card></Col>
        
        {/* Main Chart and Leaderboard */}
        <Col span={16}>
          <Card title="Total Interaction">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interactionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Call" fill="#8884d8" />
                <Bar dataKey="Chat" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Leaderboard">
            <Table dataSource={leaderboardData} pagination={false}>
              <Table.Column title="Rank" dataIndex="rank" key="rank" />
              <Table.Column title="Name" dataIndex="name" key="name" />
              <Table.Column title="Percentage" dataIndex="percentage" key="percentage" render={val => <Progress percent={val} size="small" />} />
            </Table>
          </Card>
        </Col>

        {/* Bottom Charts */}
        <Col span={16}>
          <Card title="Pinged Keywords">{/* Heatmap/Table here */}</Card>
        </Col>
        <Col span={8}>
          <Card title="Keyword Categories">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
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