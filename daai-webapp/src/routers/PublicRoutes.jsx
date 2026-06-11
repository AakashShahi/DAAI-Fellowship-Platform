import { Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AboutPage from '../pages/public/AboutPage'
import ApplyPage from '../pages/public/ApplyPage'
import ContactPage from '../pages/public/ContactPage'
import FellowshipPage from '../pages/public/FellowshipPage'
import HomePage from '../pages/public/HomePage'
import PathwayDetailPage from '../pages/public/PathwayDetailPage'
import ForgotPassword from '../pages/ForgotPassword'
import Login from '../pages/Login'
import Register from '../pages/Register'
import SetPassword from '../pages/SetPassword'

export const publicRouteElements = (
  <>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/fellowship" element={<FellowshipPage />} />
      <Route path="/fellowship/apply" element={<ApplyPage />} />
      <Route path="/fellowship/:pathwaySlug" element={<PathwayDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Route>
    <Route path="/login" element={<PublicLayout />}>
      <Route index element={<Login />} />
    </Route>
    <Route path="/forgot-password" element={<PublicLayout />}>
      <Route index element={<ForgotPassword />} />
    </Route>
    <Route path="/register" element={<PublicLayout />}>
      <Route index element={<Register />} />
    </Route>
    <Route path="/set-password" element={<PublicLayout />}>
      <Route index element={<SetPassword />} />
    </Route>
  </>
)
