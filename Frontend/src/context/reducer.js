export const initialState = {
  navToggled: false,
  isLoading: false,
  isAuth: false,
  accessToken: null,
  admin: null,
  userId: null,

  booking: {
    checkIn: null,
    checkOut: null,
    guest: null,
    room: null,
    // roomType: null,
  },
  roomId: null,
};

export const actionTypes = {
  TOGGLE_NAV: "TOGGLE_NAV",
  LOADING: "LOADING",
  AUTH: "AUTH",
  BOOKING: "BOOKING",
  CHECK_RATES: "CHECK_RATES",
  SET_USER_ID: "SET_USER_ID",
};

const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case actionTypes.TOGGLE_NAV:
      return {
        ...state,
        navToggled: action.navToggled,
      };
      break;
    case actionTypes.LOADING:
      return {
        ...state,
        isLoading: action.isLoading,
      };
      break;
    case actionTypes.AUTH:
      return {
        ...state,
        isAuth: action.isAuth,
        accessToken: action.accessToken,
        admin: action.admin || null,
      };
      break;
    case actionTypes.BOOKING:
      return {
        ...state,
        booking: action.booking,
      };
      break;
    case actionTypes.CHECK_RATES:
      return {
        ...state,
        roomId: action.roomId,
      };
      break;
    case actionTypes.SET_USER_ID:
      return {
        ...state,
        userId: action.userId,
      };
      break;
    default:
      return state;
  }
};

export default reducer;
