const mongoose = require("mongoose");

const recoveryCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  recoveryCode: {
    type: String,
    required: true,
  },
});

const RecoveryCode = mongoose.model("RecoveryCode", recoveryCodeSchema);

module.exports = RecoveryCode;
