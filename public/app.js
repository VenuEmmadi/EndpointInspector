// State variables
let selectedEnv = "dev";
let serviceCurrentStatus = {};
let services = [];

// Highlight the active button
function highlightActiveEnv(env) {
    document.querySelectorAll(".env-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    document.getElementById(env).classList.add("active");
}

// Fetch configuration and update the environment
function fetchConfig(env) {
    fetch(`/config/${env}`)
        .then((res) => res.json())
        .then((data) => {
            services = data;
            renderHealthBoxes(); // Render boxes for the selected environment
            updateHealthStatus(); // Update health status immediately after rendering
        })
        .catch((err) => {
            console.error("Failed to load configurations:", err);
            alert(`Failed to load configurations for environment: ${env}`);
        });
}

// Render initial health boxes
function renderHealthBoxes() {
    const container = document.getElementById("health-boxes");
    container.innerHTML = ""; // Clear the container for new environment services
    services.forEach((service) => {
        const box = document.createElement("div");
        box.className = "health-box";
        box.id = `health-box-${service.id}`;
        box.innerHTML = `
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <p>Status: <span id="status-${service.id}">Loading...</span></p>
        `;
        box.addEventListener("click", () => showApiDetails(service)); // Add click event listener
        container.appendChild(box);
    });
}

// Update health statuses for all services
function updateHealthStatus() {
    if (!services || services.length === 0) return;

    // Fetch status for each service
    services.forEach((service) => {
        fetch(`/health/${selectedEnv}/${service.id}`)
            .then((res) => {
                if (res.ok) {
                    serviceCurrentStatus[service.id] = 200; // Service is available
                } else {
                    serviceCurrentStatus[service.id] = res.status; // Service is unavailable
                }
                updateHealthBox(service, serviceCurrentStatus[service.id]);
            })
            .catch(() => {
                serviceCurrentStatus[service.id] = 500; // Service unavailable on error
                updateHealthBox(service, 500);
            });
    });
}

// Update individual health box
function updateHealthBox(service, statusCode) {
    const statusEl = document.getElementById(`status-${service.id}`);
    if (!statusEl) return; // Guard against missing elements (e.g., if service changed)
    const box = document.getElementById(`health-box-${service.id}`);
    if (statusCode === 200) {
        box.className = "health-box available";
        statusEl.textContent = "Available";
        statusEl.style.color = "#28a745";
    } else {
        box.className = "health-box unavailable";
        statusEl.textContent = "Unavailable";
        statusEl.style.color = "#dc3545";
    }
}

// Show API details in a modal
function showApiDetails(service) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");

    modalBody.innerHTML = `
        <h2>${service.name}</h2>
        <p><strong>Description:</strong> ${service.description}</p>
        <p><strong>Environment:</strong> ${selectedEnv}</p>
        <p><strong>URL:</strong> <a href="${service.url}" target="_blank">${service.url}</a></p>
        <p><strong>Contact:</strong> <a href="mailto:${service.contact}">${service.contact}</a></p>
    `;

    modal.style.display = "block"; // Show the modal
}

// Close the modal
function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
}

// Handle environment selection
function selectEnv(env) {
    selectedEnv = env;
    highlightActiveEnv(env);
    fetchConfig(env); // Reload configuration and update environment
}

// Initialize with default environment
highlightActiveEnv(selectedEnv);
fetchConfig(selectedEnv);

// Add click listener for closing modal
window.addEventListener("click", (event) => {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        closeModal();
    }
});
