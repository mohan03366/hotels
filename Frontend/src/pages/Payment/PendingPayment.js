import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "../../axios";

const PendingPayment = () => {
  const history = useHistory();
  const [bookingId, setBookingId] = useState("");
  const [inputId, setInputId] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pendingBookingId");
      if (saved) setBookingId(saved);
    } catch {}
  }, []);

  const resume = (id) => {
    if (!id) {
      alert("Enter a booking ID to resume payment");
      return;
    }
    history.push({ pathname: "/payment", state: { bookingId: id } });
  };

  return (
    <div className="container mt-5 mb-5">
      <h3 className="text-center">Pending Payment</h3>
      <div className="card mt-4">
        <div className="card-body">
          <p>If your payment was interrupted, you can resume it here.</p>
          {bookingId ? (
            <div className="mb-3">
              <strong>Detected pending booking:</strong> {bookingId}
              <div className="mt-2">
                <button
                  className="btn btn-primary"
                  onClick={() => resume(bookingId)}
                >
                  Resume Payment
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-3">
            <label>Enter Booking ID</label>
            <input
              type="text"
              className="form-control"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Booking ID"
            />
            <button
              className="btn btn-outline-primary mt-2"
              onClick={() => resume(inputId)}
            >
              Resume by ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingPayment;
