import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HotkeysProvider } from '@blueprintjs/core';

import {Provider} from 'react-redux';

import store from './store'

import './index.css'

import MainPage      from './pages/MainPage'
import NewDashboard  from './pages/NewDashboard'
import Welcome from './pages/Welcome'
import ReportList from './pages/ReportList'
import ReportView from './pages/ReportView'
import Blacklist from './pages/Blacklist'
import ClosedSources  from './pages/ClosedSources'


const router = createBrowserRouter([
  {
    element: <MainPage />,
    children: [
        {
          path: "/",
          element: <Welcome />,
        },
        {
          path: "/dashboards",
          element: <ReportList  />,
        },
        {
          path: "/new_dashboard",
          element: <NewDashboard />,
        },
        {
          path: "/report_view",
          element: <ReportView  />
        },
        {
          path: "/blacklist",
          element: <Blacklist />
        },
        {
          path: "/closedsources",
          element: <ClosedSources  />

        }
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
