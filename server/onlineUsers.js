class OnlineUsersMap {

  addOnlineUser(id) {
    this[id] = true;
  }

  removeOnlineUser(id) {
    this[id] = false;
  }

  isOnline(id) {
    return this[id];
  }
}


const onlineUsers = new OnlineUsersMap();

module.exports = onlineUsers;
const onlineUsers = [];

class ActiveConversationsMap {

  activateConversation (conversationId) {
    if (!this[conversationId] || this[conversationId] == 0) {
      this[conversationId] = 1;
    } else if (this[conversationId] >= 1) {
      this[conversationId] = 2;
    }
  }

  deactivateConversation (conversationId) {
    this[conversationId] = this[conversationId] <= 1 ? 0 : 1
  }

  conversationStatus (conversationId) {
    return this[conversationId] ? this[conversationId] : 0;
  }
}

class LastReadMessagesMap {

  setLastRead (conversationId, userId, messageId) {
    const userMessages = {};
    if (this[conversationId]) {
      this[coversationId][userId] = messageId
    } else {
      userMessages[userId] = messageId;
      this[conversationId] = userMessages;
    }
  }
}

const activeConversations = new ActiveConversationsMap();
const recentlyRead = new LastReadMessagesMap();

module.exports = { onlineUsers, activeConversations };
