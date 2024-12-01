import { useState } from 'react';
import {
  Typography,
  Button,
  Input,
  IconButton,
} from '@material-tailwind/react';

// Add Product Component (Prop-based version)
export const AddProductModal = ({
  // eslint-disable-next-line react/prop-types
  isOpen,
  // eslint-disable-next-line react/prop-types
  onClose,
  // eslint-disable-next-line react/prop-types
  onAddProduct,
}) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    status: 'In Stock',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      alert('Please fill in all fields');
      return;
    }

    const productToAdd = {
      ...newProduct,
      id: Date.now(), // Use timestamp as unique ID
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
    };

    onAddProduct(productToAdd);

    // Reset form
    setNewProduct({
      name: '',
      category: '',
      price: '',
      stock: '',
      status: 'In Stock',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            Add New Product
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Category"
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            required
          />
          <div className="flex gap-4">
            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              value={newProduct.stock}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2">
              Status
            </Typography>
            <select
              name="status"
              value={newProduct.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Limited">Limited</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="text" color="blue-gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="green">
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
