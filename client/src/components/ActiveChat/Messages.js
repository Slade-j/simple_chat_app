import React, { useEffect, useState } from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId, isLive, lastRead } = props;
  const [ recentlyRead, setRecentlyRead ] = useState('')

  useEffect(() => {
    setRecentlyRead(lastRead)
  }, [lastRead])

  useEffect(() => {
    if(!messages.length) return;

    // check to see if ohter user has conversation active
    if (isLive) {
      for (let i = messages.length - 1; i >= 0 ; i--) {
        const latestMessage = messages[i]
        if (latestMessage.senderId === userId) {
          setRecentlyRead(latestMessage.id);
          return;
        }
      }
    }
  }, [messages.length, isLive])


  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time} isRead={recentlyRead === message.id} otherUser={otherUser} />
        ) : (
          <OtherUserBubble key={message.id} text={message.text} time={time} otherUser={otherUser} />
        );
      })}
    </Box>
  );
};

export default Messages;
