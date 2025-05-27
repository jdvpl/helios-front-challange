'use client'
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from 'react-toastify';

export default function StoreProvider({ children }: { children: React.ReactNode; }) {
  return (
    <>
      <Provider store={store}>{children}</Provider>
      <ToastContainer
        position="top-right" autoClose={5000} hideProgressBar={false}
        newestOnTop={false} closeOnClick rtl={false}
        pauseOnFocusLoss draggable pauseOnHover theme="dark"
      />
    </>
  );
}