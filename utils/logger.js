const winston = require("winston");
const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "neo4j+s://f879b711.databases.neo4j.io",
  neo4j.auth.basic("neo4j", "tHAcdkwu1m5Z63nbHTxz8c_OZZ9CjxBP30EgzjHJGHw"),
);

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "warn.log", level: "warn" }),
    new winston.transports.File({ filename: "info.log", level: "info" }),
  ],
});

logger.info = async (level, route, ipAddress, message) => {
  const session = driver.session(); // Create a new session for each log entry
  try {
    await session.run(
      "CREATE (log:Log {level: $level, route: $route, ipAddress: $ipAddress, message: $message})",
      {
        route,
        ipAddress,
        message,
      },
    );
  } finally {
    await session.close(); // Close the session after the log entry is created
  }
};

module.exports = logger;
