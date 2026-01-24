import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewListing from "./pages/NewListing";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Favorites from "./pages/Favorites";
import EditListing from "./pages/EditListing";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<ListingDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Create listing must be a static path so it doesn't get caught by /listing/:id */}
        <Route
          path="/listing/new"
          element={
            <ProtectedRoute>
              <NewListing />
            </ProtectedRoute>
          }
        />
        {/* Example protected route (we’ll build NewListing page later) */}
        <Route
          path="/new-listing"
          element={
            <ProtectedRoute>
              <NewListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listing/:id/edit"
          element={
            <ProtectedRoute>
              <EditListing />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
