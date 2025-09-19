import React, { useEffect, useRef } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { useStateValue } from "./context/StateProvider";
import { actionTypes } from "./context/reducer";

import "./App.css";
import "./style/css/all.min.css";
import "./style/css/bootstrap.min.css";
import "./style/css/buttons.css";

import Home from "./pages/Home";
import Login from "./pages/Login/Login";
import Room from "./pages/Room/Room";

import User from "./pages/Admin/User";
import Rooms from "./pages/Admin/Rooms/Rooms";
import CreateRoom from "./pages/Admin/Rooms/CreateRoom";
import EditRoom from "./pages/Admin/Rooms/EditRoom";
import CheckRoomsAndRates from "./pages/CheckRoomsAndRates/CheckRoomsAndRates";
import UserDetails from "./pages/UserDetails/UserDetails";
import Booking from "./pages/Admin/Booking/Booking";
import Payment from "./pages/Payment/Payment";
import Receipt from "./pages/Payment/Receipt";
import PendingPayment from "./pages/Payment/PendingPayment";

function App() {
  const [state, dispatch] = useStateValue();

  const loading = useRef();

  useEffect(() => {
    if (state.isLoading === true) {
      loading.current.classList.remove("d-none");
    } else if (state.isLoading === false) {
      loading.current.classList.add("d-none");
    }
  }, [state.isLoading]);

  // Bootstrap auth from localStorage on app load
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("adminAuth");
      if (storedAuth) {
        const { token, admin } = JSON.parse(storedAuth);
        if (token) {
          dispatch({
            type: actionTypes.AUTH,
            isAuth: true,
            accessToken: token,
            admin: admin || null,
          });
        }
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div className="loader d-none" ref={loading}>
        <div className="spinner-border text-light" role="status"></div>
      </div>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route
          exact
          path="/check-rooms-and-rates"
          component={CheckRoomsAndRates}
        />
        <Route exact path="/user-details" component={UserDetails} />
        <Route exact path="/payment" component={Payment} />
        <Route exact path="/receipt" component={Receipt} />
        <Route exact path="/pending-payment" component={PendingPayment} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/room/:id" component={Room} />

        <Route
          exact
          path="/admin"
          render={(props) =>
            state.isAuth ? <User {...props} /> : <Redirect to="/login" />
          }
        />
        <Route
          exact
          path="/admin/rooms"
          render={(props) =>
            state.isAuth ? <Rooms {...props} /> : <Redirect to="/login" />
          }
        />
        <Route
          exact
          path="/admin/booking"
          render={(props) =>
            state.isAuth ? <Booking {...props} /> : <Redirect to="/login" />
          }
        />
        <Route
          exact
          path="/admin/rooms/create"
          render={(props) =>
            state.isAuth ? <CreateRoom {...props} /> : <Redirect to="/login" />
          }
        />
        <Route
          exact
          path="/admin/rooms/edit/:id"
          render={(props) =>
            state.isAuth ? <EditRoom {...props} /> : <Redirect to="/login" />
          }
        />
      </Switch>
    </div>
  );
}

export default App;
