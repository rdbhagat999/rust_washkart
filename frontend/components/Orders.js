import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { utils } from "near-api-js";
import { AuthContext } from "../lib/Auth";

export default function Orders() {
  const { user, isAdmin, orders, setOrders, loader, setLoader, contract } =
    useContext(AuthContext);

  const handleStatusChange = async (status, order) => {
    console.log("exec: handleStatusChange");
    try {
      if (isAdmin && confirm("Are you sure?") == true) {
        setLoader(true);

        await contract.update_order_status(order?.id, status);

        const updatedOrders = orders.map((o) => {
          if (o?.id === order?.id) {
            o.status = status;
          }
          return o;
        });

        setOrders(updatedOrders);

        console.log("Order status updated");
        alert("Order status updated");
      }
    } catch (error) {
      console.log(`[handleStatusChange] Error: \n${error?.message}`);
      alert(`[handleStatusChange] Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <h5>List of orders</h5>
        {!isAdmin && (
          <Link to="/new" className="btn btn-sm px-2 btn-success">
            New order
          </Link>
        )}
      </div>
      <div className="table-responsive">
        <table className="table caption-top">
          <thead>
            <tr>
              <th scope="col">OrderId</th>
              {isAdmin && <th scope="col">CustomerId</th>}
              <th scope="col">Payment</th>
              <th scope="col">Total (Near)</th>
              <th scope="col">Status</th>
              <th scope="col">Pickup</th>
              <th scope="col">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => {
              return (
                <tr key={o?.id}>
                  <td>
                    <Link to={`/${o?.id}`}>{o?.id}</Link>
                  </td>
                  {isAdmin && <td>{o?.customer_id}</td>}
                  <td>{o?.payment_type}</td>
                  <td>
                    {utils.format.formatNearAmount(o?.price_in_yocto_near)} N
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="form-select form-select-sm"
                        aria-label=".form-select-sm"
                        value={o?.status}
                        onChange={(e) =>
                          loader == false &&
                          isAdmin &&
                          handleStatusChange(e?.target?.value, o)
                        }
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      o?.status
                    )}
                  </td>
                  <td>
                    {new Date(o?.pickup_date_time / 1000000).toLocaleString()}
                  </td>
                  <td>
                    {o?.status == "Delivered"
                      ? new Date(
                          o?.delivery_date_time / 1000000
                        ).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
