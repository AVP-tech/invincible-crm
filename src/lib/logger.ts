type LogLevel = "info" | "warn" | "error";

type LogMetadata = Record<string, unknown> | undefined;

function writeLog(level: LogLevel, message: string, metadata?: LogMetadata) {
  if (typeof window !== "undefined") {
    return;
  }

  const entry = JSON.stringify({
    level,
    message,
    metadata,
    timestamp: new Date().toISOString()
  });

  const stream = level === "error" ? process.stderr : process.stdout;
  stream.write(`${entry}\n`);
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown error"
  };
}

export const logger = {
  info(message: string, metadata?: LogMetadata) {
    writeLog("info", message, metadata);
  },
  warn(message: string, metadata?: LogMetadata) {
    writeLog("warn", message, metadata);
  },
  error(message: string, error?: unknown, metadata?: LogMetadata) {
    writeLog("error", message, {
      ...metadata,
      ...(error ? { error: normalizeError(error) } : {})
    });
  }
};
