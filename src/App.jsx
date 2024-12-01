import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Userroute } from './routes/Userroute';
import { Provider } from 'react-redux';
import { Store } from './Store.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
      <Provider store={Store}>
        <ToastContainer />
        <Router>
          <Routes>
            <Route path="/*" element={<Userroute />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
};

export default App;
