const winston = require("winston");
const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  route: String,
  ipAddress: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", LogSchema);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "warn.log", level: "warn" }),
    new winston.transports.File({ filename: "info.log", level: "info" }),
  ],
});

logger.info = async (route, ipAddress, message) => {
  const logEntry = new Log({ route, ipAddress, message });
  await logEntry.save();
};

logger.error = async (route, ipAddress, message) => {
  const logEntry = new Log({ route, ipAddress, message });
  await logEntry.save();
};

module.exports = logger;
