import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'

/** Must be Fragment or Route — not a custom component — for use under <Routes>. */
export const publicRouteElements = (
  <Fragment>
    <Route path="/login" element={<PublicLayout />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/register" element={<PublicLayout />}>
      <Route index element={<Register />} />
    </Route>
  </Fragment>
)
