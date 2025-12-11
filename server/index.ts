import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { initMongoDB } from "./mongodb";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server...");
    // Initialize MongoDB for activity tracking
    try {
      await initMongoDB();
      console.log("MongoDB initialized");
    } catch (mongoError) {
      console.warn("MongoDB connection warning:", mongoError instanceof Error ? mongoError.message : mongoError);
      // Continue startup even if MongoDB is not available initially
    }

    console.log("Registering routes...");
    await registerRoutes(httpServer, app);
    console.log("Routes registered");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error(`Error [${status}]: ${message}`);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      console.log("Production mode: serving static");
      serveStatic(app);
    } else {
      console.log("Development mode: setting up Vite...");
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
      console.log("Vite setup complete");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || "5000", 10);
    
    // Windows compatibility: reusePort is not supported on Windows
    // Use simpler listen syntax for cross-platform compatibility
    const isWindows = process.platform === 'win32';
    
    console.log(`About to start listening on port ${port}...`);
    
    if (isWindows) {
      // Windows: use localhost or just port
      console.log("Windows detected, using 127.0.0.1");
      const server = httpServer.listen(port, "127.0.0.1");
      server.on('listening', () => {
        log(`serving on port ${port} (http://localhost:${port})`);
      });
      server.on('error', (err: any) => {
        console.error("Server error:", err.message);
        process.exit(1);
      });
    } else {
      // Unix/Linux: can use 0.0.0.0 and reusePort
      httpServer.listen(
        {
          port,
          host: "0.0.0.0",
          reusePort: true,
        },
        () => {
          log(`serving on port ${port}`);
        },
      );
    }
    
    console.log("Server setup complete, waiting for connections...");
    
  } catch (error) {
    console.error("Server startup error:", error instanceof Error ? error.message : error);
    console.error("Stack:", error instanceof Error ? error.stack : "");
    process.exit(1);
  }
})().catch((err) => {
  console.error("Unhandled promise rejection:", err instanceof Error ? err.message : err);
  console.error("Stack:", err instanceof Error ? err.stack : "");
});
