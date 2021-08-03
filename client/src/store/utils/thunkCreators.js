import { AccordionSummary } from "@material-ui/core";
import axios from "axios";
import getSocket, { getSocketEvents } from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
} from "../conversations";
import { setReadMap } from "../conversationsRead";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// Initialize socket to be set by login, regester, or fetchUser on refresh.
export let socket;

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      const token = localStorage.getItem("messenger-token");
      socket = getSocket(token);
      getSocketEvents(socket);
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket = getSocket(data.token);
    getSocketEvents(socket);
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket = getSocket(data.token)
    getSocketEvents(socket);
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

const saveLastRead =  async (conversationId, lastReadMessageId, userId) => {
  await axios.patch("api/conversations", { conversationId, lastReadMessageId, userId });
}

export const logout = (logoutParameters) => async (dispatch) => {
  const { conversationId, id, lastRead } = logoutParameters;

  try {
    // logout posts unreadCounts so a single call to backend can handle updating unread columns in conversations
    await axios.post("/auth/logout", logoutParameters);
    localStorage.removeItem("unreadCounts");
    localStorage.removeItem("messenger-token");
    localStorage.removeItem("active-convo");
    dispatch(gotUser({}));
    socket.emit("logout", {id, conversationId, lastRead });
    await saveLastRead(conversationId, lastRead, id)
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data.conversations));
    dispatch(setReadMap(data.activeConvoMap));
    return data;
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
    isNewConversation: data.isNewConversation,
    conversationId: data.conversationId
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);

    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
      localStorage.setItem("active-convo", data.conversationId);
    } else {
      dispatch(setNewMessage(data.message));
    }

    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

export const recentlyRead = (body) => async (dispatch) => {
  const { previousConversation, currentConversation, lastRead, user } = body;

  socket.emit("live-conversation", body);

  if (previousConversation && previousConversation.id !== currentConversation.id) {
    await saveLastRead(previousConversation.id, lastRead, user);
  }
}

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
