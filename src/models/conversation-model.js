const { default: mongoose } = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    name: {
      type: String, // group name
    },

    avatar: {
      type: String, // group image
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: {
      type: Date,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Object, // future extensions
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);