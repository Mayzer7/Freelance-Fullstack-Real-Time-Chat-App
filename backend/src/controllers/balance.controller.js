import User from "../models/user.model.js";

export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: "Error getting balance", error: error.message });
  }
};

export const updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number') {
      return res.status(400).json({ message: "Amount must be a number" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.balance += amount;
    if (user.balance < 0) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    await user.save();
    res.json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: "Error updating balance", error: error.message });
  }
}; 