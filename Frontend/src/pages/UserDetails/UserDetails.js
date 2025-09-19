import React, { useEffect, useRef, useState } from "react";

import countryList from "../../data/country_list.json";

import { Link, useHistory } from "react-router-dom";

import axios from "../../axios";

import "./UserDetails.css";

import { useStateValue } from "../../context/StateProvider";
import { actionTypes } from "../../context/reducer";

function UserDetails() {
  const [state, dispatch] = useStateValue();

  const skipPayment = useRef();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [address, setAddress] = useState();
  const [address2, setAddress2] = useState();
  const [zip, setZip] = useState();
  const [city, setCity] = useState();
  const [statee, setState] = useState();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [nights, setNights] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const history = useHistory();

  function clearFormFields() {
    // Clear all form fields
    setName("");
    setEmail("");
    setPhone("");
    setCountry("");
    setAddress("");
    setAddress2("");
    setZip("");
    setCity("");
    setState("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedRoom) {
      alert("Room data not loaded. Please go back and re-select room.");
      return;
    }

    // Basic validation
    if (!name || !email) {
      setFormError("Name and Email are required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }
    setFormError("");

    // Build quote and redirect to payment (no skip payment)
    try {
      setSubmitting(true);
      const quote = {
        userEmail: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone ? phone.trim() : undefined,
        address: {
          street: address ? address.trim() : undefined,
          street2: address2 ? address2.trim() : undefined,
          city: city ? city.trim() : undefined,
          state: statee ? statee.trim() : undefined,
          zip: zip ? zip.trim() : undefined,
          country: country ? country.trim() : undefined,
        },
        checkInDate: state.booking.checkIn,
        checkOutDate: state.booking.checkOut,
        bookingInfo: [
          {
            pax: [
              {
                name: name.trim(),
                adultStatus: "adult",
                gender: "other",
                age: 0,
              },
            ],
            roomType: selectedRoom.type,
            roomId: selectedRoom._id,
            roomAmount: selectedRoom.rentPerDay,
          },
        ],
      };
      // Compute total amount
      const ci = new Date(state.booking.checkIn);
      const co = new Date(state.booking.checkOut);
      const diffMs = Math.abs(co - ci);
      const nightsComputed = Math.max(
        1,
        Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      );
      quote.totalAmount = selectedRoom.rentPerDay * nightsComputed;
      try {
        localStorage.setItem("pendingQuote", JSON.stringify(quote));
      } catch {}
      history.push({ pathname: "/payment", state: { quote } });
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (state.booking.checkIn === null || !state.roomId) {
      history.push("/");
      return;
    }

    // compute nights
    const checkIn = new Date(state.booking.checkIn);
    const checkOut = new Date(state.booking.checkOut);
    const diffMs = Math.abs(checkOut - checkIn);
    const nightsComputed = Math.max(
      1,
      Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    );
    setNights(nightsComputed);

    // fetch selected room
    axios
      .get(`/api/rooms/${state.roomId}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setSelectedRoom(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, [state.booking.checkIn, state.booking.checkOut, state.roomId, history]);
  return (
    <div className="user_details__container">
      <div className="container mb-5 mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h4 className="text-center">Please Fill Out the Form Below</h4>
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="alert alert-danger mt-2" role="alert">
                  {formError}
                </div>
              )}
              <label htmlFor="full_name" className="mt-3">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                className="form-control"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <label htmlFor="email" className="mt-3">
                Email
              </label>
              <input
                type="text"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <label htmlFor="phone" className="mt-3">
                Phone (09XXXXXXXX)
              </label>
              <input
                type="text"
                id="phone"
                className="form-control"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
              <label htmlFor="country" className="mt-3">
                Country
              </label>
              <select
                className="form-control"
                id="country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                }}
              >
                {countryList.map((country) => (
                  <option value={country.code} key={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>

              <label htmlFor="full_name" className="mt-3">
                Address
              </label>
              <input
                type="text"
                id="address"
                className="form-control"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
              />
              <label htmlFor="email" className="mt-3">
                Address 2
              </label>
              <input
                type="text"
                id="address2"
                className="form-control"
                value={address2}
                onChange={(e) => {
                  setAddress2(e.target.value);
                }}
              />
              <label htmlFor="phone" className="mt-3">
                ZIP Code
              </label>
              <input
                type="text"
                id="zip"
                className="form-control"
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value);
                }}
              />
              <label htmlFor="phone" className="mt-3">
                City
              </label>
              <input
                type="text"
                id="city"
                className="form-control"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                }}
              />

              <label htmlFor="phone" className="mt-3">
                State
              </label>
              <input
                type="text"
                id="state"
                className="form-control"
                value={statee}
                onChange={(e) => {
                  setState(e.target.value);
                }}
              />

              <button
                type="submit"
                className="button w-100 mt-3"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : `Confirm Reservation${
                      selectedRoom
                        ? ` - $${selectedRoom.rentPerDay * nights}`
                        : ""
                    }`}
              </button>

              <div className="d-flex align-items-center justify-content-center">
                <Link to="/" className=" mt-3">
                  Go To Home Page
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
