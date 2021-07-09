const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const { onlineUsers,  activeConversations } = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
// TODO: for scalability, implement lazy loading
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "unread1", "unread2", "user1Id", "user2Id"],
      order: [["createdAt", "DESC"], [Message, "createdAt", "ASC"]],
      include: [
        { model: Message },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    // create active conversation map for frontend to track recently read messages
    const activeConvoMap = {};

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set currentUserId to filter on frontend
      convoJSON.currentUserId = userId;

      // map activConversation values
      activeConvoMap[convoJSON.id] = activeConversations.conversationStatus(convoJSON.id)

      // set unread count
      if (convoJSON.user1Id === userId) {
        convoJSON.unread = convoJSON.unread1;
      } else if (convo.user2Id === userId) {
        convoJSON.unread = convoJSON.unread2
      }

      delete convoJSON.user1Id;
      delete convoJSON.user2Id;

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set lastRead messages of conversation
      convoJSON.lastRead = [convoJSON.lastRead1, convoJSON.lastRead2]

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      convoJSON.latestMessageText = convoJSON.messages[convoJSON.messages.length - 1].text;

      // set isActive for determining if there are unread messages
      convoJSON.isActive = false;

      conversations[i] = convoJSON;
    }

    res.json({ conversations, activeConvoMap });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
