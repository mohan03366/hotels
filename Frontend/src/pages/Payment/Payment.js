import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import axios from "../../axios";
import "./Payment.css";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Payment = () => {
  const history = useHistory();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [bookingData, setBookingData] = useState(null);

  const bookingId =
    (location.state && location.state.bookingId) ||
    (() => {
      try {
        return localStorage.getItem("pendingBookingId");
      } catch {
        return null;
      }
    })();
  const quote =
    (location.state && location.state.quote) ||
    (() => {
      try {
        const raw = localStorage.getItem("pendingQuote");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    async function initializePayment() {
      try {
        console.log(
          "Payment component loaded. BookingId:",
          bookingId,
          "Quote:",
          quote
        );

        if (!bookingId && !quote) {
          setError("Payment session missing. Please start booking again.");
          setTimeout(() => history.push("/"), 3000);
          return;
        }

        // Show payment options immediately instead of trying Razorpay first
        setShowPaymentOptions(true);
        setStatus("Select your preferred payment method");
      } catch (e) {
        console.error("Payment initialization error:", e);
        setError(
          "Failed to initialize payment: " + (e.message || "Unknown error")
        );
      }
    }

    initializePayment();
  }, [bookingId, history]);

  const handlePaymentMethod = async (method) => {
    setSelectedPaymentMethod(method);
    setLoading(true);
    setError(null);

    try {
      if (method === "razorpay") {
        await handleRazorpayPayment();
      } else if (method === "upi") {
        await handleUPIPayment();
      } else if (method === "card") {
        await handleCardPayment();
      } else if (method === "netbanking") {
        await handleNetBankingPayment();
      } else if (method === "wallet") {
        await handleWalletPayment();
      } else if (method === "cod") {
        await handleCODPayment();
      }
    } catch (e) {
      console.error("Payment method error:", e);
      setError(
        `Failed to process ${method} payment: ${e.message || "Unknown error"}`
      );
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setStatus("Loading Razorpay SDK...");
      const ok = await loadRazorpayScript();
      if (!ok) {
        throw new Error("Failed to load Razorpay. Check your connection.");
      }

      setStatus("Creating payment order...");
      const payload = bookingId ? { bookingId } : { quote };
      console.log("Creating order with payload:", payload);

      const { data } = await axios.post("/api/payment/create-order", payload);
      console.log("Create order response:", data);

      if (!data?.success) {
        throw new Error(data?.message || "Could not initiate payment");
      }

      const { order, keyId } = data.data;
      console.log("Order created successfully:", order);

      setStatus("Opening payment gateway...");
      setLoading(false);

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Royal Hotel",
        description: `Booking ${order.receipt}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying...", response);
            const verifyRes = await axios.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data && verifyRes.data.success) {
              const booking = verifyRes.data.data?.booking;
              const payment = verifyRes.data.data?.payment;
              try {
                localStorage.removeItem("pendingBookingId");
              } catch {}
              history.push({
                pathname: "/receipt",
                state: { booking, payment },
              });
            } else {
              alert(verifyRes.data?.message || "Payment verification failed");
              setShowPaymentOptions(true);
              setLoading(false);
            }
          } catch (e) {
            console.error("verify error", e);
            alert("Payment verification error");
            setShowPaymentOptions(true);
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            alert("Payment cancelled");
            setShowPaymentOptions(true);
            setLoading(false);
          },
        },
        theme: { color: "#28a745" },
      };

      const rzp = new window.Razorpay(options);
      try {
        if (bookingId) localStorage.setItem("pendingBookingId", bookingId);
        if (quote) localStorage.setItem("pendingQuote", JSON.stringify(quote));
      } catch {}
      rzp.open();
    } catch (e) {
      throw e;
    }
  };

  const handleUPIPayment = async () => {
    setStatus("Processing UPI payment...");
    // For now, redirect to Razorpay UPI options
    setTimeout(() => {
      handleRazorpayPayment();
    }, 1000);
  };

  const handleCardPayment = async () => {
    setStatus("Processing card payment...");
    // For now, redirect to Razorpay card options
    setTimeout(() => {
      handleRazorpayPayment();
    }, 1000);
  };

  const handleNetBankingPayment = async () => {
    setStatus("Processing net banking payment...");
    // For now, redirect to Razorpay net banking options
    setTimeout(() => {
      handleRazorpayPayment();
    }, 1000);
  };

  const handleWalletPayment = async () => {
    setStatus("Processing wallet payment...");
    // For now, redirect to Razorpay wallet options
    setTimeout(() => {
      handleRazorpayPayment();
    }, 1000);
  };

  const handleCODPayment = async () => {
    setStatus("Processing Cash on Delivery...");
    try {
      // Create booking with COD status
      const payload = {
        bookingId: bookingId,
        paymentMethod: "cod",
        paymentStatus: "pending",
      };

      const { data } = await axios.post("/api/payment/cod", payload);
      if (data?.success) {
        alert("Booking confirmed! You can pay cash on arrival.");
        history.push("/receipt");
      } else {
        throw new Error(data?.message || "Could not process COD booking");
      }
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: "razorpay",
      name: "Razorpay Gateway",
      description: "Credit/Debit Cards, UPI, Net Banking, Wallets",
      icon: "fas fa-credit-card",
      color: "primary",
    },
    {
      id: "upi",
      name: "UPI Payment",
      description: "Paytm, Google Pay, PhonePe, BHIM",
      icon: "fas fa-mobile-alt",
      color: "success",
    },
    {
      id: "card",
      name: "Card Payment",
      description: "Credit & Debit Cards",
      icon: "fas fa-credit-card",
      color: "info",
    },
    {
      id: "netbanking",
      name: "Net Banking",
      description: "All major banks",
      icon: "fas fa-university",
      color: "warning",
    },
    {
      id: "wallet",
      name: "Digital Wallets",
      description: "Paytm, Mobikwik, Freecharge",
      icon: "fas fa-wallet",
      color: "secondary",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you arrive",
      icon: "fas fa-money-bill-wave",
      color: "dark",
    },
  ];

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-credit-card mr-2"></i>
                Choose Payment Method
              </h4>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center mb-4">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                  <h5 className="text-primary">{status}</h5>
                  <p className="text-muted">Please wait...</p>
                </div>
              )}

              {error && (
                <div className="alert alert-danger mb-4">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>Payment Error:</strong> {error}
                  <button
                    className="btn btn-sm btn-outline-danger ml-2"
                    onClick={() => {
                      setError(null);
                      setShowPaymentOptions(true);
                      setLoading(false);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {showPaymentOptions && !loading && (
                <>
                  <div className="row">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="col-md-6 mb-3">
                        <div
                          className={`card payment-method-card border-${method.color} h-100`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handlePaymentMethod(method.id)}
                        >
                          <div className="card-body text-center">
                            <i
                              className={`${method.icon} fa-2x text-${method.color} mb-3`}
                            ></i>
                            <h6 className="card-title">{method.name}</h6>
                            <p className="card-text text-muted small">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-4">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => history.push("/")}
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Home
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
