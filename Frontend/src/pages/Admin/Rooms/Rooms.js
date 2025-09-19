import React, { useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import axios from "../../../axios";

import { useStateValue } from "../../../context/StateProvider";
import { actionTypes } from "../../../context/reducer";

import Sidebar from "./../Sidebar";
import Helmet from "react-helmet";

function Rooms() {
  const [state, dispatch] = useStateValue();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const history = useHistory();
  const sideBar = useRef();

  function logout() {
    dispatch({
      type: actionTypes.AUTH,
      isAuth: false,
      accessToken: null,
      admin: null,
    });
    try {
      localStorage.removeItem("adminAuth");
    } catch (e) {}
  }

  function toggleSidebar() {
    sideBar.current.classList.toggle("collapse");
  }

  useEffect(() => {
    if (state.isAuth === false) {
      return history.push("/login");
    }
  }, [state.isAuth, history]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/rooms");

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

  useEffect(() => {
    if (state.isAuth === true) {
      fetchRooms();
    }
  }, [state.isAuth, state.accessToken]);

  const handleDeleteRoom = async (roomId, roomName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${roomName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(`/api/rooms/${roomId}`);

      if (response.data.success) {
        setMessage({ type: "success", text: "Room deleted successfully!" });
        // Refresh the rooms list
        await fetchRooms();
      } else {
        setMessage({
          type: "danger",
          text: response.data.message || "Failed to delete room",
        });
      }
    } catch (err) {
      console.error("Error deleting room:", err);
      setMessage({
        type: "danger",
        text:
          err.response?.data?.message ||
          "Something went wrong while deleting the room",
      });
    }
  };

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
      <Helmet>
        <title>Rooms Management - Hotel Royal Blue Star</title>
      </Helmet>

      <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <Link to="/admin" className="navbar-brand col-md-3 col-lg-2 me-0 px-3">
          BSS Admin
        </Link>
        <button
          className="navbar-toggler position-absolute d-md-none collapsed"
          type="button"
          onClick={toggleSidebar}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="navbar-nav">
          <div className="nav-item text-nowrap">
            <Link to="" onClick={logout} className="nav-link px-3" href="#">
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <div className="container-fluid">
        <div className="row">
          <nav
            id="sidebarMenu"
            className="col-md-3 col-lg-2 d-md-block bg-light collapse"
            ref={sideBar}
          >
            <Sidebar />
          </nav>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Dashboard</h1>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <h2>Rooms</h2>
              <Link to="/admin/rooms/create" className="btn btn-lg btn-primary">
                Add Room
              </Link>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`} role="alert">
                {message.text}
              </div>
            )}

            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th scope="col">Room Name</th>
                    <th scope="col">Type</th>
                    <th scope="col">Max Occupancy</th>
                    <th scope="col">Rent Per Day</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <i className="fas fa-bed fa-2x mb-2"></i>
                          <p>
                            No rooms found.{" "}
                            <Link to="/admin/rooms/create">
                              Create your first room
                            </Link>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room._id}>
                        <td>
                          <strong>{room.name}</strong>
                          {room.description && (
                            <div className="text-muted small">
                              {room.description.length > 50
                                ? `${room.description.substring(0, 50)}...`
                                : room.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info">{room.type}</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {room.maxCount} guests
                          </span>
                        </td>
                        <td>
                          <strong className="text-success">
                            ${room.rentPerDay}
                          </strong>
                          <div className="text-muted small">per night</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              room.isAvailable ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {room.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Link
                              to={`/admin/rooms/edit/${room._id}`}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Room"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                handleDeleteRoom(room._id, room.name)
                              }
                              title="Delete Room"
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Rooms;
