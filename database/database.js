const mongoose = require("mongoose");
async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/aitu", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
}

module.exports = {
  connectToDatabase,
  mongoose,
};
