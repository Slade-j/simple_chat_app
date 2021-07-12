const SET_PREVIOUS_CONVO = "SET_PREVIOUS_CONVO";

export const setPreviousConvo = (conversaton) => ({
    type: SET_PREVIOUS_CONVO,
    payload: conversaton
  });

const reducer = (state = null, action) => {
  switch (action.type) {
    case SET_PREVIOUS_CONVO: {
      return action.payload;
    }
    default:
      return state;
  }
};

export default reducer;
