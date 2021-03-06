const { Op, Sequelize } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const Conversation = db.define("conversation", {
  user1Id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  user2Id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  unread1: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  unread2: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lastRead1: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  lastRead2: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },

});

// find conversation given two user Ids

Conversation.findConversation = async function (user1Id, user2Id) {
  const conversation = await Conversation.findOne({
    where: {
      user1Id: {
        [Op.or]: [user1Id, user2Id]
      },
      user2Id: {
        [Op.or]: [user1Id, user2Id]
      }
    }
  });

  // return conversation or null if it doesn't exist
  return conversation;
};

module.exports = Conversation;
