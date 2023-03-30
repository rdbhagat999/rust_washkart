import React, { useState } from "react";

const DEFAULT_USER = {
  id: null,
  name: null,
  role: null,
  email: null,
  phone: null,
  full_address: null,
  google_plus_code_address: null,
  landmark: null,
  created: null,
  updated: null,
};

export const AuthContext = React.createContext(DEFAULT_USER);

export const AuthProvider = ({ children }) => {
  const [admins, setAdmins] = useState([]);
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contract, setContract] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        customers,
        setCustomers,
        orders,
        setOrders,
        admins,
        setAdmins,
        loader,
        setLoader,
        isSignedIn,
        setIsSignedIn,
        isAdmin,
        setIsAdmin,
        contract,
        contract,
        setContract,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
