import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  previewUnread: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: -0.17,
  },
  notification: {
    height: 20,
    minWidth: 20,
    backgroundColor: "#3F92FF",
    marginRight: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  singleDigit: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  multiDigits: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  count: {
    fontSize: 9,
    color: "white",
    fontWeight: "bold",
    letterSpacing: -0.5,
  }
}));

const ChatContent = (props) => {
  const classes = useStyles();

  const { conversation } = props;
  const { latestMessageText, otherUser } = conversation;
  const unreadCounts = JSON.parse(localStorage.getItem("unreadCounts"));
  // use values in state if local storage is empty or null.
  const isEmpty = unreadCounts && Object.keys(unreadCounts).length === 0;
  const unread = !unreadCounts || isEmpty ? conversation.unread : unreadCounts[conversation.id];

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={unread > 0 ? classes.previewUnread : classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
      {unread > 0 &&
        <Box className={`${classes.notification} ${unread < 10 ? classes.singleDigit : classes.multiDigits}`}>
          <Typography className={classes.count}>{unread}</Typography>
        </Box>}
    </Box>
  );
};

export default ChatContent;
