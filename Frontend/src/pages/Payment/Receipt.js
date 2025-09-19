import React from "react";
import { useHistory, useLocation, Link } from "react-router-dom";

const Receipt = () => {
  const history = useHistory();
  const location = useLocation();
  const booking = (location.state && location.state.booking) || null;
  const payment = (location.state && location.state.payment) || null;

  if (!booking || !payment) {
    // Fallback
    return (
      <div className="container mt-5 mb-5">
        <h4 className="text-center">Receipt unavailable</h4>
        <div className="text-center mt-3">
          <Link to="/">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h3 className="text-center">Payment Receipt</h3>
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">
            Booking #{booking.bookCode || booking._id}
          </h5>
          <p className="card-text mb-1">
            <strong>Status:</strong> {booking.paymentStatus}
          </p>
          <p className="card-text mb-1">
            <strong>Amount:</strong> ₹{(booking.totalAmount || 0).toFixed(2)}
          </p>
          <p className="card-text mb-1">
            <strong>Payment ID:</strong> {payment.razorpayPaymentId}
          </p>
          <p className="card-text mb-1">
            <strong>Order ID:</strong> {payment.razorpayOrderId}
          </p>
          <p className="card-text mb-1">
            <strong>Email:</strong> {booking.userEmail}
          </p>
          <p className="card-text mb-1">
            <strong>Check-in:</strong>{" "}
            {new Date(booking.checkInDate).toDateString()}
          </p>
          <p className="card-text mb-1">
            <strong>Check-out:</strong>{" "}
            {new Date(booking.checkOutDate).toDateString()}
          </p>
          <div className="mt-3 d-flex">
            <button
              className="btn btn-primary mr-2"
              onClick={() => window.print()}
            >
              Print
            </button>
            <Link className="btn btn-outline-primary" to="/">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
