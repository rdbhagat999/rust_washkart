import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { utils } from "near-api-js";
import { AuthContext } from "../lib/Auth";

export default function Feedback() {
  let params = useParams();
  // let orderId = params?.orderId;
  //   let params = useParams();

  const {
    user,
    orders,
    loader,
    setLoader,
    setOrders,
    isSignedIn,
    isAdmin,
    contract,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [order, setOrder] = useState({
    description: "",
    payment_type: "Prepaid",
    price_in_yocto_near: "0",
    customer_feedback: "None",
    customer_feedback_comment: "",
  });

  const [feedbackRating, setFeedbackRating] = useState(
    order?.customer_feedback || "None"
  );
  const [feedbackComment, setFeedbackComment] = useState(
    order?.customer_feedback_comment || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignedIn) {
      if (confirm("Are you sure?") != true) {
        console.log("action cancelled");
        return false;
      }

      if (order?.status != "Delivered") {
        alert("Order must be Delivered to submit feedback.");
        return;
      }

      if (user?.role === "Admin") {
        alert("Only customers can submit feedback.");
        return;
      }

      const { inputRating, inputFeedbackComment } = e.target.elements;

      try {
        setLoader(true);

        await contract.submit_feedback(
          orderId,
          inputRating?.value,
          inputFeedbackComment?.value
        );

        const updatedOrders = orders.map((o) => {
          if (o?.id === orderId) {
            o.customer_feedback = inputRating?.value;
            o.customer_feedback_comment = inputFeedbackComment?.value;
          }
          return o;
        });
        setOrders(updatedOrders);
        alert("Feedback submitted");
        console.log("Feedback submitted");
      } catch (error) {
        console.log(error?.message);
        alert(`[submitCustomerFeedbackByOrderId] Error: \n${error?.message}`);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      if (!params?.orderId) {
        navigate(`/orders`);
      }
      if (orders?.length) {
        setLoader(true);
        const found = orders.find((o) => o?.id == params?.orderId);

        if (found) {
          setOrder(Object.assign({}, order, found));
          setFeedbackRating(found?.customer_feedback);
          setFeedbackComment(found?.customer_feedback_comment);
        }
        console.log(found);
        setLoader(false);
      }
    } else {
      navigate(`/`);
      setLoader(false);
    }
  }, [
    isSignedIn,
    navigate,
    setOrder,
    setFeedbackRating,
    setFeedbackComment,
    orders,
    params?.orderId,
  ]);

  return (
    <div className="container">
      <div className="row mb-3">
        <div className="col-sm-6 col-lg-6">
          <h4>Order Details</h4>
          <div className="mb-1 row">
            <label htmlFor="staticOrderId" className="col-sm-2 col-form-label">
              OrderId
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticOrderId"
                value={params?.orderId}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label
              htmlFor="staticDescription"
              className="col-sm-2 col-form-label"
            >
              Description
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticDescription"
                value={order?.description}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label
              htmlFor="staticPaymentType"
              className="col-sm-2 col-form-label"
            >
              Payment
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticPaymentType"
                value={order?.payment_type}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label htmlFor="staticTotal" className="col-sm-2 col-form-label">
              Total
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticTotal"
                value={
                  utils.format.formatNearAmount(order?.price_in_yocto_near) +
                  " N"
                }
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label htmlFor="staticStatus" className="col-sm-2 col-form-label">
              Status
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticStatus"
                value={order?.status}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label htmlFor="staticStatus" className="col-sm-2 col-form-label">
              Created
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticPickupDateTime"
                value={new Date(
                  order?.pickup_date_time / 1000000
                ).toLocaleString()}
              />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-6">
          {order?.status === "Delivered" && (
            <>
              <h4>Feedback Form</h4>
              <form
                onSubmit={(e) => loader == false && !isAdmin && handleSubmit(e)}
              >
                <div className="mb-3">
                  <label htmlFor="inputRating" className="form-label">
                    Rating
                  </label>
                  <select
                    id="inputRating"
                    className="form-select form-select-sm mb-3"
                    aria-label=".form-select-sm"
                    readOnly={user?.role === "Admin"}
                    value={feedbackRating}
                    onChange={(e) =>
                      user?.role === "Customer" &&
                      setFeedbackRating(e?.target?.value)
                    }
                  >
                    <option value="None">None</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Bad">Bad</option>
                    <option value="Worst">Worst</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="inputFeedbackComment" className="form-label">
                    Comment
                  </label>
                  <textarea
                    className="form-control"
                    id="inputFeedbackComment"
                    placeholder="Cutomer feedback comment"
                    readOnly={user?.role === "Admin"}
                    value={feedbackComment}
                    onChange={(e) =>
                      user?.role === "Customer" &&
                      setFeedbackComment(e?.target?.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={user?.role === "Admin" || loader === true}
                >
                  Submit
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
