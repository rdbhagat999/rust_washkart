import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { AuthContext } from "../lib/Auth";
import { isEmpty } from "../lib/utils";

export default function OrderForm() {
  const navigate = useNavigate();
  const { user, loader, setLoader, isSignedIn, contract } =
    useContext(AuthContext);

  const [totalPrice, setTotalPrice] = useState(3);

  const calculate_price = (weight) => {
    const w = parseInt(weight, 10);
    if (w <= 3000) {
      console.log("p=3");
      setTotalPrice(3);
    } else if (w <= 7000) {
      console.log("p=7");
      setTotalPrice(7);
    } else if (w <= 10000) {
      console.log("p=10");
      setTotalPrice(10);
    } else {
      console.log("invalid weight");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignedIn) {
      if (confirm("Are you sure?") != true) {
        console.log("action cancelled");
        return false;
      }

      if (!user?.full_address || !user?.phone) {
        alert(
          "Please update account information before attempting to create an order."
        );
        console.error(
          "Please update account information before attempting to create an order."
        );
        return;
      }

      const { inputDescription, inputWeight } = e.target.elements;

      const isFormValid =
        !isEmpty(inputDescription.value) && !isEmpty(inputWeight.value);

      if (isFormValid) {
        try {
          setLoader(true);

          await contract.create_order(
            nanoid(),
            user?.id,
            inputDescription.value,
            inputWeight.value,
            totalPrice
          );

          alert("order created");
          console.log("order created");
        } catch (error) {
          console.error(`[createOrder] ${error?.message}`);
          alert(`[createOrder] Error: \n${error?.message}`);
        } finally {
          setLoader(false);
        }
      } else {
        console.error("invalid_input");
        alert("Invalid input");
        return;
      }
    } else {
      console.error("You must be logged in");
      alert("You must be logged in");
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      navigate(`/`);
    }
  }, [isSignedIn, navigate]);

  return (
    <form onSubmit={(e) => loader == false && handleSubmit(e)}>
      <div className="form-floating mb-3">
        <textarea
          type="text"
          className="form-control form-control-sm"
          id="inputDescription"
          defaultValue=""
          placeholder="2 shirts, 5 t-shirts, 3 pants, 2 pajamas, 3 jeans"
          aria-describedby="descriptionHelp"
        />
        <label htmlFor="inputDescription">Order details</label>
        <div id="descriptionHelp" className="form-text">
          Example: 2 shirts, 5 t-shirts, 3 pants, 2 pajamas, 3 jeans.
        </div>
      </div>

      <div className="form-floating mb-3">
        <input
          type="number"
          className="form-control form-control-sm"
          id="inputWeight"
          min={1000}
          max={10000}
          step={100}
          defaultValue={1500}
          placeholder="Total weight (Grams)"
          onChange={(e) => calculate_price(e?.target?.value)}
        />
        <label htmlFor="inputWeight">Total weight (grams)</label>
        <div id="weightHelp" className="form-text">
          Total weight must be between 1000 gm and 10,000 gm.
        </div>
      </div>

      <div className="form-floating mb-3">
        <input
          type="number"
          className="form-control-plaintext form-control-plaintext-sm"
          id="inputPrice"
          min={3}
          max={10}
          step={1}
          value={totalPrice}
          placeholder="Price (Near)"
          readOnly={true}
        />
        <label htmlFor="inputPrice">Price (Near)</label>
        <div id="priceHelp" className="form-text">
          Minimum order price is 3 Near.
        </div>
      </div>

      <h6 className="text-danger">
        Order cannot be cancelled by customer once placed.
      </h6>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={user?.role === "Admin" || loader === true}
      >
        Submit
      </button>
    </form>
  );
}
