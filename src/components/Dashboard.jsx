import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign,
  ShoppingCart,
  Users,
  BarChart3,
  Calendar,
  RefreshCw,
  Building2
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,   
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await window.electronAPI?.getDashboardData() 
      setDashboardData(data); 
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'purchase':
        navigate('/purchase');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'billing':
        navigate('/billing');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'export':
        navigate('/export');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Sales',
      value: `₹${dashboardData?.totalSales?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      // change: '+12.5%',
      // changeType: 'increase'
    },
    {
      name: 'Total Items',
      value: dashboardData?.totalItems || 0,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      // change: '+3 items',
      // changeType: 'increase'
    },
    {
      name: 'Low Stock Items',
      value: dashboardData?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      // change: '-2 items',
      // changeType: 'decrease'
    },
    {
      name: 'Inventory Value',
      value: `₹${dashboardData?.totalInventoryValue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      // change: '+8.2%',
      // changeType: 'increase'
    }
  ];

  const salesChartData = {
    labels: dashboardData?.salesChart?.map(item => 
      new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Daily Sales',
        data: dashboardData?.salesChart?.map(item => item.amount) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Trend (Last 30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Company Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div> 
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
          </div>
        </div>
      </div> 

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              {/* <div className="text-right">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? '↗' : '↘'} {stat.change}
                </span>
                <p className="text-xs text-gray-500">vs last period</p>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Line data={salesChartData} options={chartOptions} />
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          
          {dashboardData?.lowStockItems?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.lowStockItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {item.current_stock} / {item.minimum_stock}
                    </p>
                    <p className="text-xs text-gray-500">Current / Min</p>
                  </div>
                </div>
              ))}
              {dashboardData.lowStockItems.length > 5 && (
                <p className="text-sm text-gray-600 text-center pt-2">
                  +{dashboardData.lowStockItems.length - 5} more items need attention
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">All items are well stocked!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('billing')}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <Users className="w-5 h-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-blue-700 font-medium">New Billing</span>
          </button>
          <button 
            onClick={() => handleQuickAction('purchase')}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <ShoppingCart className="w-5 h-5 text-green-600 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-green-700 font-medium">New Purchase</span>
          </button>
          <button 
            onClick={() => handleQuickAction('inventory')}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <Package className="w-5 h-5 text-purple-600 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-purple-700 font-medium">Manage Inventory</span>
          </button>
          <button 
            onClick={() => handleQuickAction('analytics')}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <BarChart3 className="w-5 h-5 text-orange-600 mr-2 group-hover:scale-110 transition-transform" />
            <span className="text-orange-700 font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;