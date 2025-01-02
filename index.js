const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();

// In-memory cache for configurations
let configCache = {};

// Serve static frontend files
app.use(express.static("public"));

// Serve the frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint to fetch configuration for a specific environment
app.get("/config/:env", (req, res) => {
    const env = req.params.env || "default";
    if (configCache[env]) {
        res.json(configCache[env]);
    } else {
        res.status(404).send(`Configuration for environment '${env}' not found.`);
    }
});

// Endpoint to perform health check for a specific API
app.get("/health/:env/:id", async (req, res) => {
    const { env, id } = req.params;
    const service = configCache[env]?.find((s) => s.id === id);

    if (!service) {
        return res.status(404).send(`Service with ID '${id}' not found in environment '${env}'.`);
    }

    try {
        await axios.get(service.url);
        res.status(200).send("Service is available");
    } catch (error) {
        res.status(500).send("Service is unavailable");
    }
});

// Load configurations from JSON files
function loadConfigurations() {
    const configDir = path.join(__dirname, "config");
    const files = fs.readdirSync(configDir);

    files.forEach((file) => {
        if (file.endsWith("-config.json")) {
            const env = file.replace("-config.json", "");
            const content = JSON.parse(fs.readFileSync(path.join(configDir, file), "utf-8"));
            configCache[env] = content;
        }
    });

    console.log("Configurations loaded:", Object.keys(configCache));
}

// Load configurations on startup
loadConfigurations();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
