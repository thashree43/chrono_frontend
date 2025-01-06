/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import {
  Card,
  Typography,
  CardBody,
  CardFooter,
  Button,
  Input,
  Chip,
  IconButton,
  Tooltip,
} from '@material-tailwind/react';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import {
  useAddproductMutation,
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from '../api/Userapi';
import { EditProductModal } from './Editprduct';
import { toast } from 'react-toastify';

export const Productlist = () => {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  // Fetch products query
  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useGetProductsQuery();
  const [addproduct] = useAddproductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    status: 'In Stock',
    image: null,
  });

  // Update local state when products are fetched
  useEffect(() => {
    if (productsData && Array.isArray(productsData)) {
      setProducts(productsData);
    } else {
      console.error('Products data is not an array:', productsData);
      setProducts([]);
    }
  }, [productsData]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page on new search
      }, 300),
    []
  );

  // Filtered and paginated products
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;

    return products.filter((product) =>
      Object.values(product).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [products, searchTerm]);

  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Description Cell Component
  const DescriptionCell = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongDescription = description.split(' ').length > 3;

    const truncatedDescription =
      isLongDescription && !isExpanded
        ? description.split(' ').slice(0, 3).join(' ') + '...'
        : description;

    return (
      <div className="flex items-center">
        <Typography
          variant="small"
          color="blue-gray"
          className="font-normal flex items-center"
        >
          {truncatedDescription}
          {isLongDescription && (
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

  const TABLE_HEAD = [
    'ID',
    'Name',
    'Description',
    'Price',
    'Stock',
    'Status',
    'Image',
    'Actions',
  ];

  const validateInputs = () => {
    const errors = [];

    // Name validation
    if (!newProduct.name.trim()) {
      errors.push('Product name is required');
    }

    // Description validation
    if (!newProduct.description.trim()) {
      errors.push('Product description is required');
    }

    // Price validation
    const price = parseFloat(newProduct.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Price must be a positive number');
    }

    // Stock validation
    const stock = parseInt(newProduct.stock);
    if (isNaN(stock) || stock < 0) {
      errors.push('Stock must be a non-negative number');
    }

    // Image validation
    if (!newProduct.image) {
      errors.push('Product image is required');
    }

    return errors;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.info('Please upload a valid image (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.info('Image size should be less than 5MB');
        return;
      }

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewProduct((prev) => ({
          ...prev,
          image: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Validate inputs
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', parseFloat(newProduct.price));
    formData.append('stock', parseInt(newProduct.stock));
    formData.append('status', newProduct.status);
    formData.append('image', newProduct.image);

    try {
      // Send product to backend
      await addproduct(formData).unwrap();

      // Reset form and close modal
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
        status: 'In Stock',
        image: null,
      });

      setImagePreview(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add product', error);
      toast.error('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product', error);
      toast.error('Error in deleting the product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Typography>Loading products...</Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full">
        <Typography color="red">
          Error loading products: {error.toString()}
        </Typography>
      </div>
    );
  }

  return (
    <>
      <Card className="h-full w-full">
        <div className="m-4 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Products List
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              See information about all products
            </Typography>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex items-center mr-4">
              <Input
                type="text"
                placeholder="Search products..."
                className="pr-10"
                onChange={(e) => debouncedSearch(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-3"
            >
              <PlusIcon className="h-5 w-5" />
              Add Product
            </Button>
          </div>
        </div>

        <CardBody className="overflow-x-auto px-0">
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50 p-4"
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
              {currentProducts.map((product, index) => {
                const isLast = index === currentProducts.length - 1;
                const classes = isLast
                  ? 'p-4'
                  : 'p-4 border-b border-blue-gray-50';

                return (
                  <tr key={product._id}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-bold"
                        >
                          {product._id}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {product.name}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <DescriptionCell description={product.description} />
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        ₹.{product.price.toFixed(2)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {product.stock}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Chip
                        variant="ghost"
                        size="sm"
                        value={product.status}
                        color={
                          product.status === 'In Stock'
                            ? 'green'
                            : product.status === 'Low Stock'
                              ? 'amber'
                              : 'red'
                        }
                      />
                    </td>
                    <td className={classes}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </td>
                    <td className={classes}>
                      <div className="flex items-center gap-2">
                        <Tooltip content="Edit Product">
                          <IconButton
                            variant="text"
                            onClick={() => handleEditProduct(product)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Delete Product">
                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Page {currentPage} of{' '}
            {Math.ceil(filteredProducts.length / itemsPerPage)}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={
                currentPage ===
                Math.ceil(filteredProducts.length / itemsPerPage)
              }
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h5" color="blue-gray">
                Add New Product
              </Typography>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={() => setIsAddModalOpen(false)}
              >
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

            <form onSubmit={handleAddProduct} className="space-y-4">
              <Input
                label="Product Name"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Description"
                name="description"
                value={newProduct.description}
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
                  value={newProduct.price}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={newProduct.stock}
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
                  value={newProduct.status}
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
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center cursor-pointer p-2 border rounded"
                >
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Upload Image
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
                <Button
                  variant="text"
                  color="blue-gray"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" color="green">
                  Add Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditModalOpen && editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          updateProduct={updateProduct}
        />
      )}
    </>
  );
};
