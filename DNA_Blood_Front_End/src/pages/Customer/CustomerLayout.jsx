import React from "react";
import Footer from "../../components/customer/Footer";

const CustomerLayout = ({ children }) => (
  <>
    {children}
    <Footer />
  </>
);

export default CustomerLayout;