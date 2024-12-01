import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseurluser = import.meta.env.VITE_BASE_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: baseurluser,
  credentials: 'include',
});
export const UserApislice = createApi({
  reducerPath: 'userapi',
  baseQuery,
  tagTypes: ['Customers', 'Products', 'Sales'],
  endpoints: (builder) => ({
    regiterpost: builder.mutation({
      query: (formData) => ({
        url: '/register',
        method: 'POST',
        body: formData,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: '/verify-otp',
        method: 'POST',
        body: otpData,
      }),
    }),
    resendOtp: builder.mutation({
      query: (emailData) => ({
        url: '/resend-otp',
        method: 'POST',
        body: emailData,
      }),
    }),
    login: builder.mutation({
      query: (formData) => ({
        url: '/login',
        method: 'POST',
        body: formData,
      }),
    }),
    getProducts: builder.query({
      query: () => '/get-products',
      transformResponse: (response) => {
        console.log('API Response:', response); // Debugging log
        return response.products || []; // Ensure it returns an array
      },
      providesTags: ['Products'],
    }),
    addproduct: builder.mutation({
      query: (formData) => ({
        url: '/add-product',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: (formData) => ({
        url: `products/${formData.get('_id')}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/delete-product/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'], // Invalidate product cache after deleting
    }),
    getCustomers: builder.query({
      query: () => '/get-customers',
      transformResponse: (response) => {
        return response.Customers || [];
      },
      providesTags: ['Customers'],
    }),
    addCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: '/add-customer',
        method: 'POST',
        body: newCustomer,
      }),
      invalidatesTags: ['Customers'],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...updatedCustomer }) => ({
        url: `/update-customer/${id}`,
        method: 'PUT',
        body: updatedCustomer,
      }),
      invalidatesTags: ['Customers'],
    }),
    deleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `/delete-customer/${customerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers'],
    }),
    // In your existing UserApislice
    getsalesentries: builder.query({
      query: () => '/get-salesentry',
      transformResponse: (response) => {
        console.log('Sales Entries Response:', response);
        return (response.Salesentries || []).map((entry) => ({
          ...entry,
          Date: new Date(entry.Date).toISOString(),
        }));
      },
      providesTags: ['Sales'],
    }),
    addsalesentry: builder.mutation({
      query: (salesdata) => ({
        url: '/add-salesentry',
        method: 'POST',
        body: salesdata,
      }),
      invalidatesTags: ['Sales'],
    }),
  }),
});

export const {
  // Authentication Mutations
  useRegiterpostMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,

  // Product-related Queries and Mutations
  useGetProductsQuery,
  useAddproductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Customer-related Queries and Mutations
  useGetCustomersQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,

  // Sales-related Queries and Mutations
  useGetsalesentriesQuery,
  useAddsalesentryMutation,
} = UserApislice;
