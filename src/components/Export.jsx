import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar,
  Filter,
  RefreshCw,
  Lock,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'exceljs';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import PinProtected from './reusables/PinProtected';

const Export = () => {

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: 'all',
    reportType: 'inventory'
  });

  const exportToExcel = async (data, filename, sheetName) => {
    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (filters.reportType === 'inventory') {
      worksheet.columns = [
        { header: 'Item Name', key: 'name', width: 25 },
        { header: 'Current Stock', key: 'current_stock', width: 15 },
        { header: 'Purchase Rate', key: 'purchase_rate', width: 15 },
        { header: 'MRP', key: 'mrp', width: 15 },
        { header: 'Total Value (Purchase)', key: 'total_value_purchase', width: 20 },
        { header: 'Total Value (MRP)', key: 'total_value_mrp', width: 20 },
      ];
      
      // Initialize grand totals
      let grandTotalStock = 0;
      let grandTotalPurchaseRate = 0;
      let grandTotalMRP = 0;
      let grandTotalValuePurchase = 0;
      let grandTotalValueMRP = 0;
      
      data.forEach(item => {
        const totalValuePurchase = item.current_stock * item.purchase_rate;
        const totalValueMRP = item.current_stock * item.mrp;
        
        worksheet.addRow({
          ...item,
          total_value_purchase: totalValuePurchase,
          total_value_mrp: totalValueMRP
        });
        
        // Accumulate totals
        grandTotalStock += item.current_stock;
        grandTotalPurchaseRate += item.purchase_rate;
        grandTotalMRP += item.mrp;
        grandTotalValuePurchase += totalValuePurchase;
        grandTotalValueMRP += totalValueMRP;
      });
      
      // Add empty row for spacing
      worksheet.addRow({});
      
      // Add Grand Total row
      const grandTotalRow = worksheet.addRow({
        name: 'GRAND TOTAL',
        current_stock: grandTotalStock,
        purchase_rate: grandTotalPurchaseRate,
        mrp: grandTotalMRP,
        total_value_purchase: grandTotalValuePurchase,
        total_value_mrp: grandTotalValueMRP
      });
      
      // Style the grand total row
      grandTotalRow.font = { bold: true };
      grandTotalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD700' } // Gold color
      };
      
    } else if (filters.reportType === 'sales' || filters.reportType === 'purchases') {
      worksheet.columns = [
        { header: 'Sr. No.', key: 'sr_no', width: 8 },
        { header: 'Date', key: 'date', width: 15 },
        { header: filters.reportType === 'sales' ? 'Bill No.' : 'Purchase No.', key: 'number', width: 15 },
        { header: filters.reportType === 'sales' ? 'Customer' : 'Supplier', key: 'party_name', width: 20 },
        { header: 'Address', key: 'address', width: 20 },
        { header: 'GSTIN', key: 'gstin', width: 18 },
        { header: 'Net Amount', key: 'net_amount', width: 12 },
      ];
      data.forEach((row, idx) => {
        worksheet.addRow({
          sr_no: idx + 1,
          date: new Date(row.purchase_date || row.sale_date).toLocaleDateString(),
          number: row.invoice_number || row.bill_number || '',
          party_name: row.supplier_name || row.customer_name || '',
          address: row.address || row.customer_address || '',
          gstin: row.gstin || row.customer_gstin || '',
          net_amount: row.total_amount || '',
        });
      });
    }

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data, filename, title) => {
    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(16);
    doc.text(title, 148, 20, { align: 'center' });
    
    // Date range
    doc.setFontSize(10);
    doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 148, 30, { align: 'center' });
    
    let yPosition = 50;
    
    if (filters.reportType === 'inventory') {
      // Headers - adjusted for landscape
      doc.setFontSize(8);
      doc.text('Item Name', 10, yPosition);
      doc.text('Stock', 100, yPosition);
      doc.text('P.Rate', 140, yPosition);
      doc.text('MRP', 175, yPosition);
      doc.text('Val(P)', 210, yPosition);
      doc.text('Val(MRP)', 245, yPosition);
      
      yPosition += 10;
      doc.line(10, yPosition, 280, yPosition);
      
      // Initialize grand totals
      let grandTotalStock = 0;
      let grandTotalPurchaseRate = 0;
      let grandTotalMRP = 0;
      let grandTotalValuePurchase = 0;
      let grandTotalValueMRP = 0;
      
      data.forEach((item) => {
        yPosition += 8;
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 20;
        }
        
        const totalValuePurchase = item.current_stock * item.purchase_rate;
        const totalValueMRP = item.current_stock * item.mrp;
        
        doc.text(item.name.substring(0, 30), 10, yPosition);
        doc.text(item.current_stock.toString(), 100, yPosition);
        doc.text(`₹${item.purchase_rate.toFixed(2)}`, 140, yPosition);
        doc.text(`₹${item.mrp.toFixed(2)}`, 175, yPosition);
        doc.text(`₹${totalValuePurchase.toFixed(2)}`, 210, yPosition);
        doc.text(`₹${totalValueMRP.toFixed(2)}`, 245, yPosition);
        
        // Accumulate totals
        grandTotalStock += item.current_stock;
        grandTotalPurchaseRate += item.purchase_rate;
        grandTotalMRP += item.mrp;
        grandTotalValuePurchase += totalValuePurchase;
        grandTotalValueMRP += totalValueMRP;
      });
      
      // Add Grand Total row
      yPosition += 15;
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Draw separator line
      doc.line(10, yPosition - 5, 280, yPosition - 5);
      
      // Grand Total text
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('GRAND TOTAL', 10, yPosition);
      doc.text(grandTotalStock.toString(), 100, yPosition);
      doc.text(`₹${grandTotalPurchaseRate.toFixed(2)}`, 140, yPosition);
      doc.text(`₹${grandTotalMRP.toFixed(2)}`, 175, yPosition);
      doc.text(`₹${grandTotalValuePurchase.toFixed(2)}`, 210, yPosition);
      doc.text(`₹${grandTotalValueMRP.toFixed(2)}`, 245, yPosition);
      doc.setFont(undefined, 'normal');
      
    } else if (filters.reportType === 'sales') {
      // Headers
      doc.text('Bill No', 20, yPosition);
      doc.text('Date', 80, yPosition);
      doc.text('Customer', 130, yPosition);
      doc.text('Amount', 200, yPosition);
      
      yPosition += 10;
      doc.line(20, yPosition, 250, yPosition);
      
      data.forEach((sale) => {
        yPosition += 8;
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(sale.bill_number, 20, yPosition);
        doc.text(new Date(sale.sale_date).toLocaleDateString(), 80, yPosition);
        doc.text((sale.customer_name || '').substring(0, 25), 130, yPosition);
        doc.text(`₹${sale.total_amount.toFixed(2)}`, 200, yPosition);
      });
    } else if (filters.reportType === 'purchases') {
      // Headers
      doc.text('Purchase No', 20, yPosition);
      doc.text('Date', 80, yPosition);
      doc.text('Supplier', 130, yPosition);
      doc.text('Amount', 200, yPosition);
      
      yPosition += 10;
      doc.line(20, yPosition, 250, yPosition);
      
      data.forEach((purchase) => {
        yPosition += 8;
        if (yPosition > 180) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(purchase.invoice_number || '', 20, yPosition);
        doc.text(new Date(purchase.purchase_date).toLocaleDateString(), 80, yPosition);
        doc.text((purchase.supplier_name || '').substring(0, 25), 130, yPosition);
        doc.text(`₹${purchase.total_amount.toFixed(2)}`, 200, yPosition);
      });
    }
    
    doc.save(filename);
  };

  const handleExport = async (format) => {
    setLoading(true);

    try {
      let data = [];
      let filename = '';
      let title = '';

      if (filters.reportType === 'inventory') {
        data = await window.electronAPI.getExportInventoryData();
        filename = `inventory_report_${new Date().toISOString().split('T')[0]}`;
        title = 'Inventory Report';
      } else if (filters.reportType === 'sales') {
        data = await window.electronAPI.getExportSalesData({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        filename = `sales_report_${filters.startDate}_to_${filters.endDate}`;
        title = 'Sales Report';
      } else if (filters.reportType === 'purchases') {
        data = await window.electronAPI.getExportPurchaseData({
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        filename = `purchase_report_${filters.startDate}_to_${filters.endDate}`;
        title = 'Purchase Report';
      }

      if (format === 'excel') {
        await exportToExcel(data, `${filename}.xlsx`, title);
        toast.success('Excel file exported successfully!');
      } else if (format === 'pdf') {
        exportToPDF(data, `${filename}.pdf`, title);
        toast.success('PDF file exported successfully!');
      }

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // PIN protection wrapper 
  return (
    // <PinProtected message="This module is protected and requires PIN verification to access." modulename="Export">
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
            <p className="text-gray-600">Export your data to Excel or PDF formats</p>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Export Filters</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <select
                  value={filters.reportType}
                  onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="inventory">Inventory Report</option>
                  <option value="sales">Sales Report</option>
                  <option value="purchases">Purchase Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          {/* Export Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Download className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Export Options</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleExport('excel')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                )}
                Export to Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 mr-2" />
                )}
                Export to PDF
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Export Details</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Excel files include all data columns with formatting</li>
                <li>• PDF files are optimized for printing</li>
                <li>• Date filters apply to sales and purchase reports</li>
                <li>• Inventory reports show current stock levels</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Current Inventory</h3>
                <p className="text-sm text-gray-600">Export all items with stock levels</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFilters({ ...filters, reportType: 'inventory' });
                handleExport('excel');
              }}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Quick Excel Export
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Monthly Sales</h3>
                <p className="text-sm text-gray-600">This month's sales report</p>
              </div>
            </div>
            <button
              onClick={() => {
                const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
                setFilters({ 
                  ...filters, 
                  reportType: 'sales',
                  startDate: startOfMonth,
                  endDate: new Date().toISOString().split('T')[0]
                });
                handleExport('pdf');
              }}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Quick PDF Export
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Purchase History</h3>
                <p className="text-sm text-gray-600">All purchase records</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFilters({ ...filters, reportType: 'purchases' });
                handleExport('excel');
              }}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Quick Excel Export
            </button>
          </div>
        </div>
      </div>
    
    // </PinProtected>
  ); 
}; 
 
export default Export;