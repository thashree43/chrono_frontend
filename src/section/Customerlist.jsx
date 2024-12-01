/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  CardBody,
  CardFooter,
  Button,
  Input,
  IconButton,
} from '@material-tailwind/react';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import {
  useGetCustomersQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '../api/Userapi';
import { EditCustomerModal } from './Editcustomer';
import { toast } from 'react-toastify';

export const Customerlist = () => {
  const [customers, setCustomers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: customerData,
    isLoading,
    isError,
    error,
  } = useGetCustomersQuery();

  const [addCustomer] = useAddCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    address: '',
    mobile: '',
  });

  useEffect(() => {
    if (customerData && Array.isArray(customerData)) {
      setCustomers(customerData);
    }
  }, [customerData]);

  // Address Cell Component
  const AddressCell = ({ address }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongAddress = address.split(' ').length > 3;

    const truncatedAddress =
      isLongAddress && !isExpanded
        ? address.split(' ').slice(0, 3).join(' ') + '...'
        : address;

    return (
      <div className="flex items-center">
        <Typography variant="small" color="blue-gray" className="font-normal">
          {truncatedAddress}
          {isLongAddress && (
            <IconButton
              variant="text"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </IconButton>
          )}
        </Typography>
      </div>
    );
  };

  const TABLE_HEAD = ['ID', 'Name', 'Address', 'Mobile', 'Actions'];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const validateInputs = () => {
    const errors = [];
    if (!newCustomer.name.trim()) errors.push('Name is required');
    if (!newCustomer.address.trim()) errors.push('Address is required');
    if (isNaN(parseFloat(newCustomer.mobile)))
      errors.push('Mobile must be a number');
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    const validationErrors = validateInputs();

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n'));
      return;
    }

    try {
      await addCustomer({
        name: newCustomer.name,
        address: newCustomer.address,
        mobile: newCustomer.mobile,
      }).unwrap();

      setNewCustomer({ name: '', address: '', mobile: '' });
      toast.success('Customer added successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to add customer');
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    console.log('the customer delet id', customerId);

    try {
      await deleteCustomer(customerId).unwrap();
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error(error);

      toast.error('Failed to delete customer');
    }
  };

  if (isLoading) return <Typography>Loading customers...</Typography>;
  if (isError)
    return <Typography color="red">Error: {error.toString()}</Typography>;

  return (
    <Card className="h-full w-full">
      {/* Header Section */}
      <div className="m-4 flex items-center justify-between">
        <Typography variant="h5">Customers List</Typography>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-3"
        >
          <PlusIcon className="h-5 w-5" /> Add Customer
        </Button>
      </div>

      {/* Table Section */}
      <CardBody>
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="border-b p-4">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((customer) => (
              <tr key={customer._id}>
                <td className="p-4">{customer._id}</td>
                <td className="p-4">{customer.name}</td>
                <td className="p-4">
                  <AddressCell address={customer.address} />
                </td>
                <td className="p-4">{customer.mobile}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <IconButton
                      variant="text"
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      variant="text"
                      color="red"
                      onClick={() => handleDeleteCustomer(customer._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>

      {/* Pagination */}
      <CardFooter className="flex justify-between p-4">
        <Button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Typography>
          Page {currentPage} of {Math.ceil(customers.length / itemsPerPage)}
        </Typography>
        <Button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(customers.length / itemsPerPage)}
        >
          Next
        </Button>
      </CardFooter>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <Typography variant="h5">Add New Customer</Typography>
            <form onSubmit={handleAddCustomer} className="space-y-4 mt-4">
              <Input
                label="Name"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Address"
                name="address"
                value={newCustomer.address}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Mobile"
                name="mobile"
                type="number"
                value={newCustomer.mobile}
                onChange={handleInputChange}
                required
              />
              <div className="flex justify-end gap-4">
                <Button variant="text" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="green">
                  Add Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <EditCustomerModal
          customer={editingCustomer}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCustomer(null);
          }}
          updateCustomer={updateCustomer}
        />
      )}
    </Card>
  );
};
