import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import axios from "../../axios";

import "./CheckRoomsAndRates.css";

import { useStateValue } from "../../context/StateProvider";
import { actionTypes } from "../../context/reducer";

function CheckRoomsAndRates() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [state, dispatch] = useStateValue();

  const history = useHistory();

  useEffect(() => {
    if (state.booking.checkIn === null) {
      history.push("/");
    }
  }, [state.booking.checkIn, history]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/rooms/available");

        if (response.data.success) {
          setRooms(response.data.data);
          setMessage({ type: "", text: "" });
        } else {
          setMessage({
            type: "danger",
            text: response.data.message || "Failed to load rooms",
          });
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setMessage({
          type: "danger",
          text:
            err.response?.data?.message ||
            "Something went wrong while loading rooms",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  function handleBook(id) {
    dispatch({
      type: actionTypes.CHECK_RATES,
      roomId: id,
    });

    history.push("/user-details");
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mt-5 mb-5">
        <h1 className="text-center check_rooms_and_rate__title">
          Available Rooms and Rates
        </h1>

        {message.text && (
          <div className={`alert alert-${message.type} mt-3 mb-4`} role="alert">
            {message.text}
          </div>
        )}

        <div className="row">
          {rooms.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="text-muted">
                <i className="fas fa-bed fa-3x mb-3"></i>
                <h4>No rooms available</h4>
                <p>
                  Sorry, there are no rooms available for your selected dates.
                </p>
                <Link className="button mt-3" to="/">
                  Go Back and Select Different Dates
                </Link>
              </div>
            </div>
          ) : (
            rooms.map((room) => (
              <div className="col-lg-4 col-md-6 mt-4" key={room._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-img-container">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        className="card-img-top rooms__room"
                        alt={room.name}
                        onError={(e) => {
                          e.target.src = "/placeholder-room.jpg";
                        }}
                      />
                    ) : (
                      <div className="card-img-top rooms__room d-flex align-items-center justify-content-center bg-light">
                        <i className="fas fa-bed fa-3x text-muted"></i>
                      </div>
                    )}
                    <div className="card-img-overlay">
                      <span className="badge bg-success">{room.type}</span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{room.name}</h5>

                    {room.description && (
                      <p className="card-text text-muted small">
                        {room.description.length > 100
                          ? `${room.description.substring(0, 100)}...`
                          : room.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="row mb-3">
                        <div className="col-6">
                          <small className="text-muted">Max Guests</small>
                          <div className="fw-bold">{room.maxCount}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Price</small>
                          <div className="fw-bold text-success">
                            ${room.rentPerDay}/night
                          </div>
                        </div>
                      </div>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted">Amenities</small>
                          <div className="d-flex flex-wrap gap-1">
                            {room.amenities
                              .slice(0, 3)
                              .map((amenity, index) => (
                                <span
                                  key={index}
                                  className="badge bg-light text-dark small"
                                >
                                  {amenity}
                                </span>
                              ))}
                            {room.amenities.length > 3 && (
                              <span className="badge bg-light text-dark small">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleBook(room._id)}
                        className="button w-100"
                      >
                        Book From ${room.rentPerDay}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="d-flex align-items-center justify-content-center mt-5">
          <Link className="button" to="/">
            <i className="fas fa-arrow-left me-2"></i>
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckRoomsAndRates;
