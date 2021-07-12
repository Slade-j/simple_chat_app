import React, { Component } from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent } from "../Sidebar";
import { withStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { setIsActive } from "../../store/conversations";
import { connect } from "react-redux";
import { recentlyRead } from "../../store/utils/thunkCreators";

const styles = {
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
};

class Chat extends Component {

  getLastMessage = (messages) => {
    for (let i = messages.length - 1; i >= 0 ; i--) {
      const latestMessage = messages[i]
      if (latestMessage.senderId !== this.props.userId) {
        return latestMessage.id;
      }
    }
  }

  handleClick = async (conversation) => {
    const previousConversation = this.props.previousConversation;

    await this.props.setActiveChat(conversation.otherUser.username);
    await this.props.setIsActive(conversation.id);
    conversation.id && localStorage.setItem("active-convo", JSON.stringify(conversation.id));

    const body = {
      previousConversation: previousConversation ?
        { otherUser: previousConversation.otherUser.id, id: previousConversation.id } :
        null,
      currentConversation: { otherUser: conversation.otherUser.id, id: conversation.id ? conversation.id : null },
      user: this.props.userId,
      lastRead: previousConversation ? this.getLastMessage(previousConversation.messages) : null,
    };
    await this.props.recentlyRead(body);
  };

  render() {
    const { classes } = this.props;
    const otherUser = this.props.conversation.otherUser;
    return (
      <Box
        onClick={() => this.handleClick(this.props.conversation)}
        className={classes.root}
      >
        <BadgeAvatar
          photoUrl={otherUser.photoUrl}
          username={otherUser.username}
          online={otherUser.online}
          sidebar={true}
        />
        <ChatContent conversation={this.props.conversation} />
      </Box>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    },
    setIsActive: (id) => {
      dispatch(setIsActive(id));
    },
    recentlyRead: (body) => {
      dispatch(recentlyRead(body));
    }
  };
};

export default connect(null, mapDispatchToProps)(withStyles(styles)(Chat));
