import { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from '@material-tailwind/react';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid';
import {
  useGetCustomersQuery,
  useGetProductsQuery,
  useGetsalesentriesQuery,
  useAddsalesentryMutation,
  useEmailreportMutation,
} from '../api/Userapi';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Saleslist = () => {
  // Queries
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const { data: salesEntries = [] } = useGetsalesentriesQuery();

  // Mutations
  const [addSalesEntry] = useAddsalesentryMutation();
  const [emailreport] = useEmailreportMutation();
  // State Management
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentSalesEntries, setCurrentSalesEntries] = useState([]);
  const [selectedSaleDetails, setSelectedSaleDetails] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [isEmailReportModalOpen, setIsEmailReportModalOpen] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // Filtered Sales Entries
  const filteredSalesEntries = useMemo(() => {
    return salesEntries.filter((entry) => {
      const entryDate = new Date(entry.Date);
      return (
        (!selectedDateRange.startDate ||
          entryDate >= selectedDateRange.startDate) &&
        (!selectedDateRange.endDate || entryDate <= selectedDateRange.endDate)
      );
    });
  }, [salesEntries, selectedDateRange]);

  // Pagination Calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredSalesEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );
  const totalPages = Math.ceil(filteredSalesEntries.length / entriesPerPage);

  const handleEmailReport = async () => {
    if (!reportEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reportEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Send sales report via email
      const response = await emailreport({
        reportData: filteredSalesEntries,
        email: reportEmail,
      }).unwrap();
      console.log(response);

      toast.success('Sales report sent to email successfully');
      setIsEmailReportModalOpen(false);
      setReportEmail('');
    } catch (error) {
      console.error('Email report error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to send sales report'
      );
    }
  };

  const renderEmailReportModal = () => {
    return (
      <Dialog
        open={isEmailReportModalOpen}
        handler={() => setIsEmailReportModalOpen(false)}
      >
        <DialogHeader>Email Sales Report</DialogHeader>
        <DialogBody divider>
          <div className="mb-4">
            <Input
              label="Email Address"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
              type="email"
            />
          </div>
          <Typography variant="small" color="gray">
            The sales report will be sent to this email address.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsEmailReportModalOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button color="green" onClick={handleEmailReport}>
            Send Report
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  // Reporting Functions
  const generateReport = (type) => {
    switch (type) {
      case 'print':
        handlePrintReport(filteredSalesEntries);
        break;
      case 'excel':
        handleExportToExcel(filteredSalesEntries);
        break;
      case 'pdf':
        handleExportToPDF(filteredSalesEntries);
        break;
      case 'email':
        setIsEmailReportModalOpen(true);
        break;
    }
  };

  const handlePrintReport = (data) => {
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write('<html><head><title>Sales Report</title>');
    printWindow.document.write(`
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Sales Report</h1>');
    printWindow.document.write('<table>');
    printWindow.document.write(`
      <thead>
        <tr>
          <th>Customer</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (sale) => `
          <tr>
            <td>${sale.customerName}</td>
            <td>${sale.productName}</td>
            <td>${sale.quantity}</td>
            <td>₹${sale.total.toFixed(2)}</td>
            <td>${new Date(sale.Date).toLocaleDateString()}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    `);
    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
    XLSX.writeFile(workbook, 'sales_report.xlsx');
  };

  const handleExportToPDF = (data) => {
    const doc = new jsPDF();
    doc.text('Sales Report', 10, 10);

    doc.autoTable({
      head: [['Customer', 'Product', 'Quantity', 'Total', 'Date']],
      body: data.map((sale) => [
        sale.customerName,
        sale.productName,
        sale.quantity.toString(),
        `₹${sale.total.toFixed(2)}`,
        new Date(sale.Date).toLocaleDateString(),
      ]),
      startY: 20,
    });

    doc.save('sales_report.pdf');
  };

  // Existing methods from previous implementation...
  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    setSelectedCustomer(customer);
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p._id === productId);

    if (product.stock < 1) {
      toast.error(`Product ${product.name} is out of stock`);
      return;
    }

    setSelectedProduct(product);
  };

  const addSaleEntry = () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }

    if (!selectedProduct || quantity < 1) {
      toast.error('Please select a valid product and quantity');
      return;
    }

    if (quantity > selectedProduct.stock) {
      toast.error(`Only ${selectedProduct.stock} items available in stock`);
      return;
    }

    const newEntry = {
      customerId: selectedCustomer._id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      productId: selectedProduct._id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      quantity: quantity,
      total: selectedProduct.price * quantity,
    };

    setCurrentSalesEntries([...currentSalesEntries, newEntry]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeSaleEntry = (index) => {
    const updatedEntries = [...currentSalesEntries];
    updatedEntries.splice(index, 1);
    setCurrentSalesEntries(updatedEntries);
  };

  const handleSubmitSale = async () => {
    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (currentSalesEntries.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      await addSalesEntry(currentSalesEntries).unwrap();
      toast.success('Sale recorded successfully');

      setSelectedCustomer(null);
      setCurrentSalesEntries([]);
      setIsAddSaleModalOpen(false);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to record sale');
    }
  };
  const viewSaleDetails = (sale) => {
    setSelectedSaleDetails(sale);
  };

  const renderSalesTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {[
                'Customer',
                'Product',
                'Quantity',
                'Total',
                'Date',
                'Actions',
              ].map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((sale, index) => (
              <tr key={index} className="even:bg-blue-gray-50/50">
                <td className="p-4">{sale.customerName}</td>
                <td className="p-4">{sale.productName}</td>
                <td className="p-4">{sale.quantity}</td>
                <td className="p-4">₹{sale.total.toFixed(2)}</td>
                <td className="p-4">
                  {new Date(sale.Date).toLocaleDateString()}
                </td>
                <td className="p-4 space-x-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    color="blue"
                    onClick={() => viewSaleDetails(sale)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-4">
          <Button
            size="sm"
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <Typography>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const totalCost = currentSalesEntries.reduce(
    (total, entry) => total + entry.total,
    0
  );

  const renderAddSaleModal = () => {
    return (
      <Dialog
        open={isAddSaleModalOpen}
        handler={() => setIsAddSaleModalOpen(false)}
        size="lg"
      >
        <DialogHeader>Create New Sale</DialogHeader>
        <DialogBody divider>
          {/* Customer Selection */}
          <div className="mb-4">
            <Typography variant="h6">Customer Details</Typography>
            <Select
              label="Select Customer"
              value={selectedCustomer?._id}
              onChange={handleCustomerSelect}
            >
              {customers.map((customer) => (
                <Option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.mobile}
                </Option>
              ))}
            </Select>
          </div>

          {/* Product Selection */}
          <div className="mb-4">
            <Typography variant="h6">Product Selection</Typography>
            <div className="flex space-x-2">
              <Select
                label="Select Product"
                value={selectedProduct?._id}
                onChange={handleProductSelect}
                className="w-1/2"
              >
                {products.map((product) => (
                  <Option
                    key={product._id}
                    value={product._id}
                    disabled={product.stock < 1}
                  >
                    {product.name} - ₹{product.price} (Stock: {product.stock})
                  </Option>
                ))}
              </Select>
              <Input
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                max={selectedProduct?.stock || 1}
                className="w-1/4"
              />
              <Button
                onClick={addSaleEntry}
                disabled={!selectedProduct}
                className="w-1/4"
              >
                Add Product
              </Button>
            </div>
          </div>

          {/* Current Sale Entries */}
          {currentSalesEntries.length > 0 && (
            <div className="mb-4">
              <Typography variant="h6">Sale Items</Typography>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border p-2">Product</th>
                    <th className="border p-2">Price</th>
                    <th className="border p-2">Quantity</th>
                    <th className="border p-2">Total</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSalesEntries.map((entry, index) => (
                    <tr key={index}>
                      <td className="border p-2">{entry.productName}</td>
                      <td className="border p-2">₹{entry.price.toFixed(2)}</td>
                      <td className="border p-2">{entry.quantity}</td>
                      <td className="border p-2">₹{entry.total.toFixed(2)}</td>
                      <td className="border p-2">
                        <Button
                          size="sm"
                          color="red"
                          variant="text"
                          onClick={() => removeSaleEntry(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-right">
                <Typography variant="h6">
                  Total: ₹{totalCost.toFixed(2)}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setIsAddSaleModalOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            color="green"
            onClick={handleSubmitSale}
            disabled={currentSalesEntries.length === 0}
          >
            Record Sale
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  const renderSaleDetailsModal = () => {
    return (
      <Dialog
        open={!!selectedSaleDetails}
        handler={() => setSelectedSaleDetails(null)}
      >
        <DialogHeader>Sale Details</DialogHeader>
        <DialogBody divider>
          {selectedSaleDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Typography>
                  Customer Name: {selectedSaleDetails.customerName}
                </Typography>
                <Typography>
                  Customer Mobile: {selectedSaleDetails.customerMobile}
                </Typography>
                <Typography>
                  Product: {selectedSaleDetails.productName}
                </Typography>
                <Typography>
                  Price: ₹{selectedSaleDetails.price.toFixed(2)}
                </Typography>
                <Typography>
                  Quantity: {selectedSaleDetails.quantity}
                </Typography>
                <Typography>
                  Total: ₹{selectedSaleDetails.total.toFixed(2)}
                </Typography>
                <Typography>
                  Date: {new Date(selectedSaleDetails.Date).toLocaleString()}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="blue"
            onClick={() => setSelectedSaleDetails(null)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  const renderReportsDropdown = () => {
    return (
      <Menu placement="bottom-end">
        <MenuHandler>
          <Button variant="outlined" className="flex items-center gap-2">
            <DocumentArrowDownIcon className="h-4 w-4" /> Reports
          </Button>
        </MenuHandler>
        <MenuList>
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => generateReport('print')}
          >
            <PrinterIcon className="h-4 w-4" /> Print
          </MenuItem>
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => generateReport('excel')}
          >
            <DocumentArrowDownIcon className="h-4 w-4" /> Export to Excel
          </MenuItem>
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => generateReport('pdf')}
          >
            <DocumentArrowDownIcon className="h-4 w-4" /> Export to PDF
          </MenuItem>
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => generateReport('email')}
          >
            <EnvelopeIcon className="h-4 w-4" /> Email
          </MenuItem>
        </MenuList>
      </Menu>
    );
  };

  return (
    <Card className="h-full w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5">Sales Management</Typography>
        <div className="flex space-x-2">
          {renderReportsDropdown()}
          <Button
            onClick={() => setIsAddSaleModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" /> Add Sale
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex space-x-2 mb-4">
        <Input
          type="date"
          label="Start Date"
          onChange={(e) =>
            setSelectedDateRange((prev) => ({
              ...prev,
              startDate: new Date(e.target.value),
            }))
          }
        />
        <Input
          type="date"
          label="End Date"
          onChange={(e) =>
            setSelectedDateRange((prev) => ({
              ...prev,
              endDate: new Date(e.target.value),
            }))
          }
        />
      </div>

      {/* Existing render methods */}
      {renderSalesTable()}
      {renderAddSaleModal()}
      {renderSaleDetailsModal()}
      {renderEmailReportModal()}
    </Card>
  );
};

export default Saleslist;
