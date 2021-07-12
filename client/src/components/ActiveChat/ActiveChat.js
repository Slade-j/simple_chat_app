import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect, useDispatch } from "react-redux";
import { setPreviousConvo } from "../../store/previousConversation";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column"
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between"
  }
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user } = props;
  const conversationsRead = props.conversationsRead;
  const conversation = props.conversation || {};
  const dispatch = useDispatch();

  // set unread message count to zero in local storage
  useEffect(() => {
    if (!conversation.id) return;
    const unreadCounts = JSON.parse(localStorage.getItem("unreadCounts"));

    if (unreadCounts) unreadCounts[conversation.id] = 0;

    localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));
  }, [conversation]);

  // set previously active conversation to track read messages
  useEffect(() => {
    if (!conversation.id) return;

    dispatch(setPreviousConvo(conversation));
  }, [conversation, dispatch])

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              isLive={conversationsRead[conversation.id]}
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              userId={user.id}
              lastRead={conversation.lastRead}
            />
            <Input
              conversation={conversation}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => {
  const lastActiveConvo = localStorage.getItem("active-convo") ?
    JSON.parse(localStorage.getItem("active-convo")) :
      null;
  return {
    conversationsRead: state.conversationsRead,
    user: state.user,
    conversation:
      state.conversations &&
      state.conversations.find(
        (conversation) => {
          return state.activeConversation ?
            conversation.otherUser.username === state.activeConversation :
            conversation.id === lastActiveConvo;
        }
      )
  };
};

export default connect(mapStateToProps, null)(ActiveChat);
