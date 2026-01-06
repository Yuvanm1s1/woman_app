const log4js = require("log4js");
const path = require("path");

// Configure the logger
log4js.configure({
  appenders: {
    // 1. File Appender (The fix is here)
    file: { 
      type: "file", 
      filename: path.join(__dirname, "../../logs/transactions.log"),
      // 'messagePassThrough' writes the raw JSON string we send, without adding timestamps/prefixes again.
      layout: { type: "messagePassThrough" } 
    },
    // 2. Console Appender (Keep this standard so you can read it in terminal)
    console: { type: "stdout" } 
  },
  categories: { 
    default: { appenders: ["file", "console"], level: "info" } 
  }
});

const logger = log4js.getLogger();

/**
 * Helper to log a structured transaction.
 */
function logTransaction(component, user_id, input, output, startTime) {
  const endTime = Date.now();
  const latency = endTime - startTime;

  // Estimate tokens (Rough rule: 1 token ≈ 4 chars)
  const inputStr = JSON.stringify(input);
  const outputStr = JSON.stringify(output);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    user_id: user_id || "anonymous",
    component: component,
    latency_ms: latency,
    token_usage_est: {
      input: Math.ceil(inputStr.length / 4),
      output: Math.ceil(outputStr.length / 4)
    },
    payload: {
      input: input,
      output: output
    }
  };

  // We manually stringify here, so messagePassThrough writes valid JSON lines
  logger.info(JSON.stringify(logEntry));
}

module.exports = { logTransaction };