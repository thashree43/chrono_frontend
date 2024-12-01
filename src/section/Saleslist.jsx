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
} from '@material-tailwind/react';
import { PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/solid';
import {
  useGetCustomersQuery,
  useGetProductsQuery,
  useGetsalesentriesQuery,
} from '../api/Userapi';
import { toast } from 'react-toastify';
import { useAddsalesentryMutation } from '../api/Userapi';

export const Saleslist = () => {
  // Queries
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const {
    data: salesEntries = [],
    isLoading: isSalesLoading,
    error: salesError,
  } = useGetsalesentriesQuery();

  // Mutations
  const [addSalesEntry] = useAddsalesentryMutation();

  // State Management
  const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentSalesEntries, setCurrentSalesEntries] = useState([]);
  const [selectedSaleDetails, setSelectedSaleDetails] = useState(null);

  // Pagination for Sales Entries
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // Calculated Values
  const totalCost = useMemo(() => {
    return currentSalesEntries.reduce(
      (total, entry) => total + entry.price * entry.quantity,
      0
    );
  }, [currentSalesEntries]);

  // Pagination Logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = salesEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const totalPages = Math.ceil(salesEntries.length / entriesPerPage);

  // Input Handlers
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

  return (
    <Card className="h-full w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5">Sales Management</Typography>
        <Button
          onClick={() => setIsAddSaleModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" /> Add Sale
        </Button>
      </div>

      {/* Loading and Error States */}
      {isSalesLoading ? (
        <Typography className="text-center">Loading sales...</Typography>
      ) : salesError ? (
        <Typography color="red" className="text-center">
          Error loading sales: {salesError.message}
        </Typography>
      ) : salesEntries.length === 0 ? (
        <Typography className="text-center">No sales entries found</Typography>
      ) : (
        renderSalesTable()
      )}

      {/* Modals */}
      {renderAddSaleModal()}
      {renderSaleDetailsModal()}
    </Card>
  );
};

export default Saleslist;
