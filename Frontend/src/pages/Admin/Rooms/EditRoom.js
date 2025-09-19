import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useHistory } from "react-router-dom";
import Sidebar from "../Sidebar";

import axios from "../../../axios";

import { useStateValue } from "../../../context/StateProvider";
import { actionTypes } from "../../../context/reducer";
import "./CreateRoom.css";

function EditRoom(props) {
  const [state, dispatch] = useStateValue();
  const history = useHistory();

  const [formData, setFormData] = useState({
    name: "",
    rentPerDay: "",
    type: "",
    maxCount: "",
    images: "",
    description: "",
    amenities: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const sideBar = useRef();

  // Room type options based on backend model
  const roomTypes = [
    "Single",
    "Double",
    "Deluxe",
    "Suite",
    "Family",
    "Standard",
  ];

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

  const roomId = props.match.params.id;

  useEffect(() => {
    if (state.isAuth === false) {
      return history.push("/login");
    }
  }, [state.isAuth]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/rooms/${roomId}`);

        if (response.data.success) {
          const room = response.data.data;
          setFormData({
            name: room.name || "",
            rentPerDay: room.rentPerDay || "",
            type: room.type || "",
            maxCount: room.maxCount || "",
            images: room.images ? room.images.join(", ") : "",
            description: room.description || "",
            amenities: room.amenities ? room.amenities.join(", ") : "",
          });
        } else {
          setMessage({
            type: "danger",
            text: response.data.message || "Failed to load room data",
          });
        }
      } catch (err) {
        console.error("Error fetching room:", err);
        setMessage({
          type: "danger",
          text:
            err.response?.data?.message ||
            "Something went wrong while loading room data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId, state.accessToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Room name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Room name cannot exceed 100 characters";
    }

    if (!formData.rentPerDay) {
      newErrors.rentPerDay = "Rent per day is required";
    } else if (
      isNaN(formData.rentPerDay) ||
      parseFloat(formData.rentPerDay) < 0
    ) {
      newErrors.rentPerDay = "Rent must be a positive number";
    }

    if (!formData.type) {
      newErrors.type = "Room type is required";
    }

    if (!formData.maxCount) {
      newErrors.maxCount = "Maximum count is required";
    } else if (
      isNaN(formData.maxCount) ||
      parseInt(formData.maxCount) < 1 ||
      parseInt(formData.maxCount) > 10
    ) {
      newErrors.maxCount = "Maximum count must be between 1 and 10";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    if (formData.images.trim()) {
      const imageUrls = formData.images.split(",").map((url) => url.trim());
      const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

      for (let i = 0; i < imageUrls.length; i++) {
        if (!urlRegex.test(imageUrls[i])) {
          newErrors.images =
            "Please provide valid image URLs separated by commas";
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" }); // Clear previous messages

    // Prepare data for backend
    const roomData = {
      name: formData.name.trim(),
      rentPerDay: parseFloat(formData.rentPerDay),
      type: formData.type,
      maxCount: parseInt(formData.maxCount),
      images: formData.images.trim()
        ? formData.images.split(",").map((url) => url.trim())
        : [],
      description: formData.description.trim(),
      amenities: formData.amenities.trim()
        ? formData.amenities.split(",").map((item) => item.trim())
        : [],
    };

    axios
      .put(`/api/rooms/${roomId}`, roomData)
      .then((response) => {
        if (response.data.success) {
          setMessage({ type: "success", text: "Room updated successfully!" });
          setTimeout(() => {
            history.push("/admin/rooms");
          }, 1500);
        } else {
          setMessage({
            type: "danger",
            text: response.data.message || "Something went wrong",
          });
        }
      })
      .catch((err) => {
        console.error("Error updating room:", err);
        if (err.response?.data?.message) {
          setMessage({ type: "danger", text: err.response.data.message });
        } else {
          setMessage({
            type: "danger",
            text: "Something went wrong while updating the room",
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
      <Helmet>
        <title>Edit Room - Royal Blue Star</title>
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
              <h2>Edit Room</h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="needs-validation form-container"
              noValidate
            >
              {message.text && (
                <div className={`alert alert-${message.type}`} role="alert">
                  {message.text}
                </div>
              )}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label required-field">
                      Room Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter room name..."
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="rentPerDay"
                      className="form-label required-field"
                    >
                      Rent Per Day ($)
                    </label>
                    <input
                      type="number"
                      id="rentPerDay"
                      name="rentPerDay"
                      className={`form-control ${
                        errors.rentPerDay ? "is-invalid" : ""
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={formData.rentPerDay}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.rentPerDay && (
                      <div className="invalid-feedback">
                        {errors.rentPerDay}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="type" className="form-label required-field">
                      Room Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className={`form-select ${
                        errors.type ? "is-invalid" : ""
                      }`}
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select room type</option>
                      {roomTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <div className="invalid-feedback">{errors.type}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="maxCount"
                      className="form-label required-field"
                    >
                      Maximum Occupancy
                    </label>
                    <input
                      type="number"
                      id="maxCount"
                      name="maxCount"
                      className={`form-control ${
                        errors.maxCount ? "is-invalid" : ""
                      }`}
                      placeholder="1-10"
                      min="1"
                      max="10"
                      value={formData.maxCount}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.maxCount && (
                      <div className="invalid-feedback">{errors.maxCount}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="images" className="form-label">
                      Image URLs
                    </label>
                    <textarea
                      id="images"
                      name="images"
                      className={`form-control ${
                        errors.images ? "is-invalid" : ""
                      }`}
                      placeholder="Enter image URLs separated by commas..."
                      rows="3"
                      value={formData.images}
                      onChange={handleInputChange}
                    />
                    {errors.images && (
                      <div className="invalid-feedback">{errors.images}</div>
                    )}
                    <div className="form-text">
                      Enter valid image URLs separated by commas (optional)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="amenities" className="form-label">
                      Amenities
                    </label>
                    <textarea
                      id="amenities"
                      name="amenities"
                      className="form-control"
                      placeholder="Enter amenities separated by commas..."
                      rows="3"
                      value={formData.amenities}
                      onChange={handleInputChange}
                    />
                    <div className="form-text">
                      Enter amenities separated by commas (optional)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="description"
                      className="form-label required-field"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="5"
                      className={`form-control ${
                        errors.description ? "is-invalid" : ""
                      }`}
                      placeholder="Enter room description (minimum 10 characters)..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.description && (
                      <div className="invalid-feedback">
                        {errors.description}
                      </div>
                    )}
                    <div className="form-text">
                      Description must be at least 10 characters long
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Link to="/admin/rooms" className="btn btn-secondary me-md-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Room"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

export default EditRoom;
