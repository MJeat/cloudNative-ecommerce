import User from "../../models/User.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select(
    "email image description phone address role",
  );

  if (!users) {
    res.status(404).json({
      message: "No users found!",
    });
  }

  res.status(200).json({
    users,
  });
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, address, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        message: "No users found!",
      });
    }
    user.email = email;
    user.phone = phone;
    user.address = address;
    user.role = role;
    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });

  } catch (error) {
    
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        message: "No users found!",
      });
    }

    return res.status(200).json({ message: "User deleted successfully", user });

  } catch (error) {

    return res.status(500).json({ message: error.message });
  }
};
