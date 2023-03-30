import "regenerator-runtime/runtime";
import React, { useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";

import { AuthContext } from "./lib/Auth";

import Header from "./components/Header";
import Spinner from "./components/Spinner";
import Home from "./components/Home";
import OrderForm from "./components/OrderForm";
import Feedback from "./components/Feedback";
import ProjectDemo from "./components/ProjectDemo";
import UserForm from "./components/UserForm";

import "./assets/global.css";

export default function App({ isSignedIn, accountId, contract, wallet }) {
  const {
    setUser,
    setIsSignedIn,
    setLoader,
    setIsAdmin,
    setOrders,
    setContract,
  } = useContext(AuthContext);

  const fetchOrdersForCustomer = async () => {
    console.log("exec: [fetchOrdersForCustomer]");
    try {
      setLoader(true);
      const result =
        accountId && (await contract.get_orders_by_customer_id(accountId));
      setOrders(result);
    } catch (error) {
      setLoader(false);
      console.error(`[fetchOrdersForCustomer] ${error?.message}`);
    } finally {
      console.log("finally: [fetchOrdersForCustomer]");
    }
  };

  const fetchCurrentUser = async () => {
    console.log("exec: [fetchCurrentUser]");
    try {
      setLoader(true);
      const result =
        accountId && (await contract.get_customer_by_account_id(accountId));
      await fetchOrdersForCustomer();
      setUser(result);
    } catch (error) {
      console.error(`[fetchCurrentUser] ${error?.message}`);
      setLoader(false);
    } finally {
      console.log("finally: [fetchCurrentUser]");
    }
  };

  const fetchOrdersForAdmin = async () => {
    console.log("exec: [fetchOrdersForAdmin]");
    try {
      setLoader(true);
      const result = accountId && (await contract.get_order_list());
      setOrders(result);
    } catch (error) {
      setLoader(false);
      console.error(`[fetchOrdersForAdmin] ${error?.message}`);
    } finally {
      console.log("finally: [fetchOrdersForAdmin]");
    }
  };

  const isAdmin = async () => {
    console.log("exec: [isAdmin]");
    try {
      setUser({ id: accountId });
      setLoader(true);
      const result = accountId && (await contract.check_is_admin(accountId));
      setIsAdmin(result);

      if (result) {
        setUser({ id: accountId, role: "Admin" });
        accountId && (await fetchOrdersForAdmin());
      } else {
        accountId && (await fetchCurrentUser());
      }
    } catch (error) {
      console.error(`[isAdmin] ${error?.message}`);
    } finally {
      setLoader(false);
      console.log("finally: [isAdmin]");
    }
  };

  useEffect(() => {
    setIsSignedIn(isSignedIn);
    (async () => {
      setContract(contract);
      isSignedIn && (await isAdmin());
    })();
  }, []);

  return (
    <>
      <Header wallet={wallet} />
      <main className="container mb-4">
        {isSignedIn && <Spinner />}
        <Routes path="/" element={<Home />}>
          <Route path="account" element={<UserForm />} />
          <Route path="about" element={<ProjectDemo />} />
          <Route path="new" element={<OrderForm />} />
          <Route path=":orderId" element={<Feedback />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
