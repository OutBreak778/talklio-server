import User from "../../models/user-model.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select(
        "fullName email avatar status lastActive isVerified role createdAt updatedAt"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        lastActive: user.lastActive,
        isVerified: user.isVerified,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};