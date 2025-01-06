/* eslint-disable no-unused-vars */
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
      transformResponse: (response, meta, arg) => {
        console.log('Raw API Response:', response);
        
        // Handle undefined or null response
        if (!response) {
          console.error('API returned empty response');
          return [];
        }
    
        // Check if response.products exists and is an array
        if (response.products && Array.isArray(response.products)) {
          return response.products;
        }
    
        // If response itself is an array, return it
        if (Array.isArray(response)) {
          return response;
        }
    
        // Log error for unexpected response format
        console.error('Unexpected API response format:', response);
        return [];
      },
      // eslint-disable-next-line no-unused-vars
      transformErrorResponse: (response, meta, arg) => {
        console.error('API Error:', response);
        return response;
      },
      // Add retry logic for failed requests
      extraOptions: {
        maxRetries: 3,
      },
      providesTags: ['Products'],
      // Add cache lifetime
      keepUnusedDataFor: 300, // Cache for 5 minutes
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
    emailreport: builder.mutation({
      query: (reportData) => ({
        url: '/sales/email-report',
        method: 'POST',
        body: reportData,
      }),
    }),
    userlogout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    Forgetpassword: builder.mutation({
      query: (email) => ({
        url: '/reset-password',
        method: 'POST',
        body: { email },
      }),
    }),
    Updatepassword: builder.mutation({
      query: (Postdata) => ({
        url: '/updatepassword',
        method: 'PATCH',
        body: Postdata,
      }),
    }),
    getDashboard: builder.query({
      query: () => '/dashboard',
      transformResponse: (response) => {
        console.log('Dashboard Summary Response:', response);
        return response;
      },
      providesTags: ['Sales']
    }),
  }),
});

export const {
  // Authentication Mutations
  useRegiterpostMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useUserlogoutMutation,
  useForgetpasswordMutation,
  useUpdatepasswordMutation,
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
  useEmailreportMutation,
  useGetDashboardQuery
} = UserApislice;
