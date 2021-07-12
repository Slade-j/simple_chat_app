
export const addMessageToStore = (state, payload) => {
  const { message, sender, recipientId } = payload;
  const unreadCounts = JSON.parse(localStorage.getItem("unreadCounts"));

  // if sender isn't null, that means the message needs to be put in a brand new convo
  // use recipiantId so new conversations will only be displayed to recipiant
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      currentUserId: recipientId,
      messages: [message],
      unread: 1,
      isActive: false
    };
    newConvo.latestMessageText = message.text;

    // set localStorage count for tracking unread messages
    unreadCounts[newConvo.id] = 1;
    localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));

    return [newConvo, ...state];
  }

  const newState = state.map((convo) => {
    const convoCopy = { ...convo };
    if (convo.id === message.conversationId) {
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      !convoCopy.isActive && convoCopy.unread++;
      // set localStorage count for tracking unread messages
      !convoCopy.isActive && unreadCounts[convoCopy.id]++
    }

    return convoCopy;
  });

  localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));
  return newState;
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, data) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  data.users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, currentUserId: data.userId, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  const newState = [];
  state.forEach((convo) => {
    if (convo.otherUser.id === recipientId) {
      const newConvo = { ...convo };
      newConvo.id = message.conversationId;
      newConvo.messages.push(message);
      newConvo.latestMessageText = message.text;
      newState.unshift(newConvo);
    } else {
      newState.push(convo);
    }
  });
  return newState;
};

export const setConvoIsActive = (state, conversationId) => {
  return state.map(convo => {
    const convoCopy = { ...convo }
    if (convo.id === conversationId) {
      convoCopy.isActive = true;
      convoCopy.unread = 0;
      return convoCopy
    } else {
      convoCopy.isActive = false;
      return convoCopy;
    }
  })
}

// converts values from server to booleans
export const readMapConverter = (map) => {
  // check if there is an active conversation
  const currentChannel = localStorage.getItem("active-convo") ?
  JSON.parse(localStorage.getItem("active-convo")) :
    null;

  for (const conversationId in map) {
    switch (map[conversationId]) {
      case 0:
        map[conversationId] = false;
        break;
      case 1:
        // if the value is one and the ids match the value was due to users active conversation
        map[conversationId] = map[conversationId] === 1 && conversationId === currentChannel ?
          false :
          true;
        break;
      case 2:
        map[conversationId] = true
        break;
      default:
    }
  }
  return map
}

export const setLastReadMessage = (state, payload) => {
  const { messageId, conversationId } = payload;

  return state.map(convo => {
    if (convo.id === conversationId) {
      convo.lastRead = messageId
      return convo
    } else {
      return convo
    }
  })
}
