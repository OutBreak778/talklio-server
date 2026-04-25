const { default: mongoose } = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "file", "audio", "system"],
      default: "text",
    },

    content: {
      text: String,

      media: [
        {
          url: String,
          type: String, // image, video, file, audio
          mimeType: String,
          size: Number,
        },
      ],

      thumbnail: String,
      caption: String,

      metadata: {
        type: Object, // links, location, etc.
      },
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    deliveredTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deliveredAt: Date,
      },
    ],

    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: Date,
      },
    ],

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: String,
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: Date,

    isDeletedGlobally: {
      type: Boolean,
      default: false,
    },

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isPinned: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date, // for disappearing messages
    },
  },
  { timestamps: true }
);

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

module.exports = mongoose.model("Message", messageSchema);