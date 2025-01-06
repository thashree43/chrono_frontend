/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  IconButton,
} from '@material-tailwind/react';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

export const EditProductModal = ({
  product,
  isOpen,
  onClose,
  updateProduct,
}) => {
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    status: 'In Stock',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Populate form with existing product data when modal opens
  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        status: product.status,
        image: product.image,
      });
      setImagePreview(product.image);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditedProduct((prev) => ({
          ...prev,
          image: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateInputs = () => {
    const errors = [];

    // Name validation
    if (!editedProduct.name.trim()) {
      errors.push('Product name is required');
    }

    // Description validation
    if (!editedProduct.description.trim()) {
      errors.push('Product description is required');
    }

    // Price validation
    const price = parseFloat(editedProduct.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Price must be a positive number');
    }

    // Stock validation
    const stock = parseInt(editedProduct.stock);
    if (isNaN(stock) || stock < 0) {
      errors.push('Stock must be a non-negative number');
    }

    return errors;
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    // Validate inputs
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append('_id', product._id);
    formData.append('name', editedProduct.name);
    formData.append('description', editedProduct.description);
    formData.append('price', parseFloat(editedProduct.price));
    formData.append('stock', parseInt(editedProduct.stock));
    formData.append('status', editedProduct.status);

    // Only append image if it's a new file
    if (editedProduct.image instanceof File) {
      formData.append('image', editedProduct.image);
    }

    try {
      // Send updated product to backend
      const response = await updateProduct(formData).unwrap();
      console.log(response, 'the updated product');
      toast.success('product updated successfull');

      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to update product', error);
      alert('Failed to update product. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" color="blue-gray">
            Edit Product
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

        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <Input
            label="Product Name"
            name="name"
            value={editedProduct.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Description"
            name="description"
            value={editedProduct.description}
            onChange={handleInputChange}
            required
          />
          <div className="flex gap-4">
            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={editedProduct.price}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              min="0"
              value={editedProduct.stock}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* <div>
            <Typography variant="small" color="blue-gray" className="mb-2">
              Status
            </Typography>
            <select
              name="status"
              value={editedProduct.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Limited">Limited</option>
            </select>
          </div> */}

          {/* Image Upload Section */}
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              label="Product Image"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageUpload}
              className="hidden"
              id="edit-image-upload"
            />
            <label
              htmlFor="edit-image-upload"
              className="flex items-center cursor-pointer p-2 border rounded"
            >
              <PhotoIcon className="h-5 w-5 mr-2" />
              Update Image
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Product Preview"
                className="h-20 w-20 object-cover rounded"
              />
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="text" color="blue-gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="green">
              Update Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
