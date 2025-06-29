import React from "react";
import Footer from "../../components/Footer";

const CustomerLayout = ({ children }) => (
  <>
    {children}
    <Footer />
  </>
);

export default CustomerLayout;