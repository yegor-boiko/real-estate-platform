import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListingsList from "./components/ListingsList";
import ListingDetails from "./components/ListingDetails";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListingsList />} />
        <Route path="/listings/:id" element={<ListingDetails />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
