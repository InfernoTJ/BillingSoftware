import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  User,
  RefreshCw,
  Edit3
} from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItemDetails();
  }, [id]);

  const loadItemDetails = async () => {
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.getItemDetails(id);
        setItem(data);
      } else {
        // Mock data for web environment
        setItem({
          id: id,
          name: 'Sample Item',
          sku: 'SKU001',
          description: 'Sample description',
          unit: 'pcs',
          mrp: 100,
          purchase_rate: 80,
          sale_rate: 90,
          gst_percentage: 18,
          current_stock: 50,
          minimum_stock: 10,
          category_name: 'Sample Category',
          supplier_name: 'Sample Supplier',
          purchaseHistory: []
        });
      }
    } catch (error) {
      console.error('Error loading item details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Item Not Found</h2>
        <p className="text-gray-600 mb-4">The requested item could not be found.</p>
        <button
          onClick={() => navigate('/inventory')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/inventory')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">SKU: {item.sku}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/admin`)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Item
        </button>
      </div>

      {/* Item Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Stock</p>
              <p className="text-2xl font-bold text-gray-900">{item.current_stock}</p>
              <p className="text-xs text-gray-500">Min: {item.minimum_stock}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">MRP</p>
              <p className="text-2xl font-bold text-gray-900">₹{item.mrp}</p>
              <p className="text-xs text-gray-500">Sale: ₹{item.sale_rate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Purchase Rate</p>
              <p className="text-2xl font-bold text-gray-900">₹{item.purchase_rate}</p>
              <p className="text-xs text-gray-500">Last purchase</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">GST Rate</p>
              <p className="text-2xl font-bold text-gray-900">{item.gst_percentage}%</p>
              <p className="text-xs text-gray-500">Tax inclusive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Item Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{item.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">SKU</label>
                <p className="text-gray-900">{item.sku}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-gray-900">{item.description || 'No description available'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Unit</label>
                <p className="text-gray-900">{item.unit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-gray-900">{item.category_name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Last Supplier</label>
                <p className="text-gray-900">{item.supplier_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Purchase Date</label>
                <p className="text-gray-900">
                  {item.last_purchase_date 
                    ? new Date(item.last_purchase_date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">MRP</label>
                <p className="text-2xl font-bold text-gray-900">₹{item.mrp}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sale Rate</label>
                <p className="text-2xl font-bold text-green-600">₹{item.sale_rate}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Purchase Rate</label>
                <p className="text-xl font-semibold text-blue-600">₹{item.purchase_rate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">GST Rate</label>
                <p className="text-xl font-semibold text-orange-600">{item.gst_percentage}%</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Profit Margin</label>
                  <p className="text-lg font-semibold text-purple-600">
                    ₹{(item.sale_rate - item.purchase_rate).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Margin %</label>
                  <p className="text-lg font-semibold text-purple-600">
                    {((item.sale_rate - item.purchase_rate) / item.purchase_rate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h2>
        
        {item.purchaseHistory && item.purchaseHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {item.purchaseHistory.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.unit_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.gst_percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.total_price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No purchase history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetails;