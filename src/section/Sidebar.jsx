import { useState } from 'react';
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from '@material-tailwind/react';
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  InboxIcon,
  PowerIcon,
} from '@heroicons/react/24/solid';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Logo from '../assets/logo-svg.svg';
import { Productlist } from './Productlist';
import { Customerlist } from './Customerlist';
import { Saleslist } from './Saleslist';
import Dashboard from "./Dashboard"
import { toast } from 'react-toastify';
import { useUserlogoutMutation } from '../api/Userapi';
import { useDispatch } from 'react-redux';
import { clearUserInfo, clearUserToken, logout } from '../api/authslice';

export const Sidebar = () => {
  const [open, setOpen] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showProductList, setShowProductList] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [ShowSalesList, setShowSalesList] = useState(false);
  const [ShowDashboard, setShowDashboard]= useState(false)
  const [userlogout] = useUserlogoutMutation();
  const dispatch = useDispatch();
  console.log(selectedItem);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const handleProductClick = () => {
    setSelectedItem('Products');
    setShowProductList(true);
    setShowCustomerList(false);
    setShowSalesList(false);
    setShowDashboard(false);

    // Hide customer list when products are selected
  };

  const handleCustomerClick = () => {
    setSelectedItem('Customers');
    setShowCustomerList(true);
    setShowProductList(false);
    setShowSalesList(false);
    setShowDashboard(false);

    // Hide product list when customers are selected
  };
  const handleSlaesList = () => {
    setSelectedItem('Sales');
    setShowSalesList(true);
    setShowProductList(false);
    setShowCustomerList(false);
    setShowDashboard(false);

  };
  const handleDashboard = () => {
    setSelectedItem('Dashboard');
    setShowDashboard(true);
    setShowProductList(false);
    setShowCustomerList(false);
    setShowSalesList(false);

  };

  const handlelogout = async () => {
    try {
      await userlogout().unwrap();
      localStorage.removeItem('userInfo');
      dispatch(clearUserInfo());
      dispatch(clearUserToken());
      dispatch(logout())
      toast.success('logout successfully');
    } catch (error) {
      console.error(error);
      toast.error('Logout error occurred');
    }
  };

  return (
    <div className="flex">
      <Card className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 bg-blue-gray-100 rounded-full shadow-lg">
            <img
              src={Logo}
              alt="Company Logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <Typography
            variant="h6"
            color="blue-gray"
            className="mt-4 text-center font-bold"
          >
            CHRONO
          </Typography>
          <Typography
            variant="small"
            color="gray"
            className="text-center font-normal"
          >
            Watches For Every Occasion
          </Typography>
        </div>

        <List>
          <Accordion>
            <AccordionHeader
              onClick={() => handleDashboard()}
              className="border-b-0 p-3"
            >
              <ListItemPrefix>
                <PresentationChartBarIcon className="h-5 w-5" />
              </ListItemPrefix>
              <Typography color="blue-gray" className="mr-auto font-normal">
                Dashboard
              </Typography>
            </AccordionHeader>
          </Accordion>
          <Accordion
            open={open === 2}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 2 ? 'rotate-180' : ''
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 2}>
              <AccordionHeader
                onClick={() => handleOpen(2)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <ShoppingBagIcon className="h-5 w-5" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  E-Commerce
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  onClick={handleProductClick}
                  className="cursor-pointer"
                >
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  Products
                </ListItem>
              </List>
              <List className="p-0">
                <ListItem
                  onClick={handleCustomerClick}
                  className="cursor-pointer"
                >
                  <ListItemPrefix>
                    <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  Customers
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>
          <hr className="my-2 border-blue-gray-50" />
          <ListItem onClick={handleSlaesList}>
            <ListItemPrefix>
              <InboxIcon className="h-5 w-5" />
            </ListItemPrefix>
            Sales
          </ListItem>
          <ListItem onClick={handlelogout}>
            <ListItemPrefix>
              <PowerIcon className="h-5 w-5" />
            </ListItemPrefix>
            Log Out
          </ListItem>
        </List>
      </Card>

      {showProductList && (
        <div className="flex-grow ml-4">
          <Productlist />
        </div>
      )}

      {showCustomerList && (
        <div className="flex-grow ml-4">
          <Customerlist />
        </div>
      )}
      {ShowSalesList && (
        <div className="flex-grow ml-4">
          <Saleslist />
        </div>
      )}
      {ShowDashboard && (
        <div className="flex-grow ml-4">
        <Dashboard />
      </div>
      )}
    </div>
  );
};
