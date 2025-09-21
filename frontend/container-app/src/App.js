import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu, Spin } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';

const { Sider, Content } = Layout;

// Lazy load the remote components
const DashboardPage = React.lazy(() => import('dashboard/DashboardPage'));
const POSPage = React.lazy(() => import('pos/POSPage'));
const EmployeesPage = React.lazy(() => import('employees/EmployeesPage'));

const App = () => {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible>
          <div className="logo">CRM</div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
              <Link to="/pos">Point of Sale</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<TeamOutlined />}>
              <Link to="/employees">Employees</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ margin: '16px' }}>
            <Suspense fallback={<div className="spinner-container"><Spin size="large" /></div>}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
              </Routes>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
};

export default App;