const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const qs = require("querystring");
const User = require("../models/user");
const RecoveryCode = require("../models/recoveryCode");

async function register(req, res) {
  try {
    const { username, email, password, phone } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      role: "user",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    req.session.token = token;
    console.log("Tokenses:", req.session.token);
    console.log("Tokenlog:", token);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function passwordRecovery(req, res) {
  try {
    const { userVkId } = req.body;

    const recoveryCode = Math.floor(1000 + Math.random() * 9000);
    const userId = getUserIdFromToken(req.session.token);
    await RecoveryCode.create({
      userId,
      recoveryCode,
    });

    const vkApiUrl = "https://api.vk.com/method/messages.send";
    const accessToken = process.env.VK_ACCESS_TOKEN;
    const vkApiResponse = await axios.post(
      vkApiUrl,
      qs.stringify({
        user_id: userVkId,
        message: `Your password recovery code is: ${recoveryCode}`,
        random_id: Math.floor(Math.random() * 999999),
        access_token: accessToken,
        v: "5.131", // VK API version
      }),
    );

    // Handle VK API response, check for errors, etc.
    if (vkApiResponse.data.error) {
      console.error("VK API error:", vkApiResponse.data.error);
      return res.status(500).json({ error: "Error sending recovery code" });
    }
    res.redirect("/api/confirmRecoveryCode");
  } catch (error) {
    console.error("Error during password recovery:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword, code } = req.body;
    const userId = getUserIdFromToken(req.session.token);

    const recoveryCode = await RecoveryCode.findOne({
      userId: userId,
      recoveryCode: code,
    });
    console.log(recoveryCode);
    if (!recoveryCode) {
      await RecoveryCode.deleteOne({ userId, code });
      return res.status(400).json({ error: "Invalid recovery code" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and delete the recovery code
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    // Remove the used recovery code from the collection

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// async function getUserIdByPhoneNumber(phone) {
//   const vkApiUrl = "https://api.vk.com/method/users.search";
//
//   const accessToken = process.env.VK_ACCESS_TOKEN;
//
//   try {
//     const vkApiResponse = await axios.post(
//       vkApiUrl,
//       qs.stringify({ access_token: accessToken, v: "5.131" }),
//     );
//
//     // Handle VK API response, check for errors, etc.
//     if (vkApiResponse.data.error) {
//       console.error("VK API error:", vkApiResponse.data.error);
//       return null;
//     }
//
//     // Extract the user ID from the VK API response
//     const userId = vkApiResponse.data.response.items[0].id;
//     return userId;
//   } catch (error) {
//     console.error("Error making VK API request:", error.message);
//     return null;
//   }
// }

function getUserIdFromToken(token) {
  try {
    const decodedToken = jwt.verify(
      token,
      "T#h&iSis@S3cUreJWTS3cr3tK3y!FoR#YoUrA2PPL1C4T!oN",
    );
    return decodedToken.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

module.exports = {
  register,
  login,
  getUserIdFromToken,
  passwordRecovery,
  updatePassword,
};
