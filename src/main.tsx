import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HotkeysProvider } from '@blueprintjs/core';

import {Provider} from 'react-redux';

import store from './store'

import './index.css'

import MainPage      from './pages/MainPage'
import NewDashboard  from './pages/NewDashboard'



const router = createBrowserRouter([
  {
    element: <MainPage />,
    children: [
        {
          path: "/",
          element: <div />,
        },
        {
          path: "/dataset",
          element: <div  />,
        },
        {
          path: "/new_dashboard",
          element: <NewDashboard />,
        },
      ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HotkeysProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </HotkeysProvider>
  </React.StrictMode>
)
