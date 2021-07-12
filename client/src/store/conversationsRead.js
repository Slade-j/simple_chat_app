import { readMapConverter } from "./utils/reducerFunctions";

const SET_READ_MAP = "SET_READ_MAP";
const OPEN_CONVERSATIION = "OPEN_CONVERSATIION";
const CLOSE_CONVERSATION = "CLOSE_CONVERSATION";

export const setReadMap = (map) => ({
    type: SET_READ_MAP,
    payload: map
  });

export const openConversation = (conversationId) => ({
  type: OPEN_CONVERSATIION,
  payload: conversationId
})

export const closeConversation = (conversationId) => ({
  type: CLOSE_CONVERSATION,
  payload: conversationId
})

const reducer = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case SET_READ_MAP:
      return readMapConverter(action.payload);
    case OPEN_CONVERSATIION:
      newState = Object.assign({}, state);
      newState[action.payload] = true;
      return newState;
    case CLOSE_CONVERSATION:
      newState = Object.assign({}, state);
      newState[action.payload] = false;
      return newState;
    default:
      return state;
  }
};

export default reducer;
