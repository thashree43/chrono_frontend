/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  IconButton,
} from '@material-tailwind/react';
import { toast } from 'react-toastify';

export const EditCustomerModal = ({
  customer,
  isOpen,
  onClose,
  updateCustomer,
}) => {
  // State to manage the edited customer data
  const [editedCustomer, setEditedCustomer] = useState({
    name: '',
    address: '',
    mobile: '',
  });

  // Populate form with existing customer data when modal opens
  useEffect(() => {
    if (customer) {
      setEditedCustomer({
        name: customer.name || '',
        address: customer.address || '',
        mobile: customer.mobile ? customer.mobile.toString() : '',
      });
    }
  }, [customer, isOpen]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate input fields
  const validateInputs = () => {
    const errors = [];

    // Name validation
    if (!editedCustomer.name.trim()) {
      errors.push('Customer name is required');
    }

    // Address validation
    if (!editedCustomer.address.trim()) {
      errors.push('Address is required');
    }

    // Mobile validation
    const mobile = editedCustomer.mobile.trim();
    if (!mobile) {
      errors.push('Mobile number is required');
    } else if (!/^\d{10}$/.test(mobile)) {
      errors.push('Mobile number must be 10 digits');
    }

    return errors;
  };

  // Handle customer update submission
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    // Validate inputs
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      // Ensure customer._id exists and is valid
      if (!customer._id) {
        toast.error('Invalid customer ID');
        return;
      }

      // Prepare customer data for update
      const customerData = {
        name: editedCustomer.name.trim(),
        address: editedCustomer.address.trim(),
        mobile: editedCustomer.mobile.trim(),
      };

      // Call update customer mutation with ID separately
      const response = await updateCustomer({
        id: customer._id, // Pass ID separately
        ...customerData, // Spread rest of the data
      }).unwrap();

      console.log(response, 'edited successfully the customer');

      // Show success message
      toast.success('Customer updated successfully');

      // Close the modal
      onClose();
    } catch (error) {
      // Handle update error
      console.error('Failed to update customer', error);
      toast.error(
        error.data?.message || 'Failed to update customer. Please try again.'
      );
    }
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            Edit Customer
          </Typography>
          <IconButton variant="text" color="blue-gray" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        {/* Edit Customer Form */}
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <Input
            label="Customer Name"
            name="name"
            value={editedCustomer.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Address"
            name="address"
            value={editedCustomer.address}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Mobile Number"
            name="mobile"
            type="tel"
            maxLength="10"
            value={editedCustomer.mobile}
            onChange={handleInputChange}
            required
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="text" color="blue-gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="green">
              Update Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
