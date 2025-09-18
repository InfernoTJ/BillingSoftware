import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Calendar, Package, DollarSign, Users, RefreshCw, Award, Activity
} from 'lucide-react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const formatINR = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!window.electronAPI?.getAnalyticsData) {
        setError('Analytics only available in desktop app');
        setAnalyticsData(null);
      } else {
        const data = await window.electronAPI.getAnalyticsData({ timeFilter });
        console.log('Fetched analytics data:', data); 
        if (!data) {
          setError('No analytics data returned');
          setAnalyticsData(null);
        } else {
          setAnalyticsData(data);
        }
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load analytics data');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'No analytics available'}</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Chart data builders mapped to new API
  const salesByDayData = {
    labels: (analyticsData.salesChart || []).map(d => d.date),
    datasets: [
      {
        type: 'line',
        label: 'Sales (₹)',
        data: (analyticsData.salesChart || []).map(d => Number(d.amount || 0)),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.15)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Orders',
        data: (analyticsData.salesChart || []).map(d => Number(d.orders || 0)),
        backgroundColor: 'rgba(16,185,129,0.6)',
        borderColor: 'rgba(16,185,129,1)',
        yAxisID: 'y1',
      }
    ]
  };

  const monthlyTrendData = {
    labels: (analyticsData.monthlyTrends || []).map(m => m.month),
    datasets: [
      {
        label: 'Sales (₹)',
        data: (analyticsData.monthlyTrends || []).map(m => Number(m.sales || 0)),
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.15)',
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: (analyticsData.monthlyTrends || []).map(m => Number(m.orders || 0)),
        borderColor: 'rgba(234,179,8,1)',
        backgroundColor: 'rgba(234,179,8,0.15)',
        yAxisID: 'y1',
      }
    ]
  };

  const topItemsChartData = {
    labels: (analyticsData.topSellingItems || []).map(i => i.name),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: (analyticsData.topSellingItems || []).map(i => Number(i.revenue || 0)),
        backgroundColor: 'rgba(59,130,246,0.8)',
      },
      {
        label: 'Qty',
        data: (analyticsData.topSellingItems || []).map(i => Number(i.quantity || 0)),
        backgroundColor: 'rgba(16,185,129,0.5)',
      }
    ]
  };

  const categoryPieData = {
    labels: (analyticsData.salesByCategory || []).map(c => c.category || 'Uncategorized'),
    datasets: [
      {
        label: 'Sales (₹)',
        data: (analyticsData.salesByCategory || []).map(c => Number(c.amount || 0)),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
      }
    ]
  };

  const customerSegmentData = {
    labels: (analyticsData.customerAnalysis || []).map(s => s.segment),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: (analyticsData.customerAnalysis || []).map(s => Number(s.revenue || 0)),
        backgroundColor: ['#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
      }
    ]
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'daily', name: 'Daily', icon: Calendar },
    { id: 'weekly', name: 'Weekly', icon: TrendingUp },
    { id: 'monthly', name: 'Monthly', icon: Calendar },
    { id: 'yearly', name: 'Yearly', icon: Award }
  ];

  const ov = analyticsData.overview || {};

  return (
    <div className="space-y-6"> 
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600">Live insights from your sales, purchases and inventory</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="quarterly">This Quarter</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards mapped to new API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{formatINR(ov.totalRevenue)}</p>
              <p className="text-xs text-gray-500">Selected period</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatINR(ov.totalOrders)}</p>
              <p className="text-xs text-gray-500">Total invoices</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(ov.avgOrderValue || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Per order</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">GST Collected</p>
              <p className="text-2xl font-bold text-gray-900">₹{formatINR(ov.totalGST)}</p>
              <p className="text-xs text-gray-500">CGST + SGST</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Purchases</p>
              <p className="text-2xl font-bold text-gray-900">₹{formatINR(ov.totalPurchases)}</p>
              <p className="text-xs text-gray-500">Selected period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{formatINR(ov.stockValue)}</p>
              <p className="text-xs text-gray-500">{Number(ov.lowStockCount || 0)} low stock items</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 flex flex-col h-full min-h-[350px]">
                    <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
                    <div className="flex-1 flex items-center">
                      {(analyticsData.topSellingItems || []).length === 0 ? (
                        <div className="text-center text-gray-500 py-8 w-full">No data in selected period</div>
                      ) : (
                        <Bar 
                          data={topItemsChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top' } },
                            layout: { padding: 0 }
                          }}
                          height={null}
                        />
                      )}
                    </div>
                  </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                  {(analyticsData.salesByCategory || []).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No data in selected period</div>
                  ) : (
                    <Pie data={categoryPieData} options={{ responsive: true }} />
                  )}
                </div>
              </div>

              {/* Sales by Day */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Sales by Day</h3>
                {(analyticsData.salesChart || []).length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No data in selected period</div>
                ) : (
                  <Line
                    data={salesByDayData}
                    options={{
                      responsive: true,
                      interaction: { mode: 'index', intersect: false },
                      stacked: false,
                      scales: {
                        y: { type: 'linear', display: true, position: 'left' },
                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                      }
                    }}
                  />
                )}
              </div>

              {/* Customer segments & Monthly Trends side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* <div className="bg-gray-50 rounded-lg p-6 flex flex-col h-full min-h-[350px]">
                  <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
                  {(analyticsData.customerAnalysis || []).length === 0 ? (
                    <div className="text-center text-gray-500 py-8 w-full">No data in selected period</div>
                  ) : (
                    <div className="flex-1 flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 flex items-center">
                        <Doughnut data={customerSegmentData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </div>
                      <div className="flex-1 space-y-4">
                        {(analyticsData.customerAnalysis || []).map((segment, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{segment.segment}</p>
                              <p className="text-sm text-gray-600">{segment.count} customers</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{formatINR(segment.revenue)}</p>
                              <p className="text-sm text-gray-600">Avg: ₹{formatINR(segment.avgOrder)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div> */}

                <div className="bg-gray-50 rounded-lg p-6 flex flex-col h-full min-h-[350px]">
                  <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                  {(analyticsData.monthlyTrends || []).length === 0 ? (
                    <div className="text-center text-gray-500 py-8 w-full">No data in selected period</div>
                  ) : (
                    <div className="flex-1 flex items-center">
                      <Line
                        data={monthlyTrendData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: { type: 'linear', display: true, position: 'left' },
                            y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
                          }
                        }}
                        height={null}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Daily Performance</h3>
              {(analyticsData.dailyAnalysis || []).length === 0 ? (
                <div className="text-center text-gray-500 py-8">No data in selected period</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Sales</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th> 
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(analyticsData.dailyAnalysis || []).map((d, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.day}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{formatINR(d.avgSales)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{formatINR(d.totalSales)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{d.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Weekly */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Weekly Performance</h3>
              {(analyticsData.weeklyAnalysis || []).length === 0 ? (
                <div className="text-center text-gray-500 py-8">No data in selected period</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(analyticsData.weeklyAnalysis || []).map((w, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Week {w.week}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sales:</span>
                          <span className="font-medium">₹{formatINR(w.sales)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Orders:</span>
                          <span className="font-medium">{w.orders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Start:</span>
                          <span className="font-medium">{w.week_start}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">End:</span>
                          <span className="font-medium">{w.week_end}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Monthly */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Monthly Trends</h3>
              {(analyticsData.monthlyTrends || []).length === 0 ? (
                <div className="text-center text-gray-500 py-8">No data in selected period</div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <Line data={monthlyTrendData} options={{ responsive: true }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(analyticsData.monthlyTrends || []).slice(-6).map((m, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">{m.month}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Sales:</span>
                            <span className="font-medium">₹{formatINR(m.sales)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Orders:</span>
                            <span className="font-medium">{m.orders}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Yearly */}
          {activeTab === 'yearly' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Yearly Overview</h3>
              {(analyticsData.yearlyAnalysis || []).length === 0 ? (
                <div className="text-center text-gray-500 py-8">No data in selected period</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(analyticsData.yearlyAnalysis || []).map((y, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">{y.year}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Sales:</span>
                          <span className="font-medium">₹{formatINR(y.sales)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Orders:</span>
                          <span className="font-medium">{Number(y.orders || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top customer panel */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Top Customer</p>
            <p className="text-lg font-bold text-gray-900">{ov.topCustomer || 'N/A'}</p>
            <p className="text-xs text-gray-500">Revenue: ₹{formatINR(ov.topCustomerRevenue)}</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Analytics;