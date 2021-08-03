import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  setLastRead,
} from "./store/conversations";
import { openConversation, closeConversation } from "./store/conversationsRead";

const getSocket = (token) => io.connect(window.location.origin, { query: { token } });

export const getSocketEvents = (socket) => {

  return (
    socket.on("connect", () => {
      console.log("connected to server");

      socket.on("add-online-user", (id) => {
        store.dispatch(addOnlineUser(id));
      });

      socket.on("remove-offline-user", (id) => {
        store.dispatch(removeOfflineUser(id));
      });

      socket.on("opened-conversation", (conversationId) => {
        store.dispatch(openConversation(conversationId));
      });

      socket.on("closed-conversation", (conversationId) => {
        store.dispatch(closeConversation(conversationId));
      });

      socket.on("last-read", (data) => {
        if (data.lastRead) {
        store.dispatch(setLastRead(data.lastRead, data.conversationId));
        }
      });

      socket.on("new-message", (data) => {
        store.dispatch(setNewMessage(data.message, data.recipientId, data.sender));
      });
    })
  )
}

export default getSocket;
