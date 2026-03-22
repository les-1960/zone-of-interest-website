/**
 * script.js - Zone of Interest Dashboard
 */

// --- 1. Clock Logic ---
function updateClock() {
    const timeElement = document.getElementById("time");
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-GB', { hour12: false, 
    timeZoneName: 'short'});
    }
}

// --- 2. Date & Weather (Simplified Labels) ---
function updateDashboardData() {
    // Update Date
    const dateElement = document.getElementById("date");
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options).toUpperCase();
    }

    // Update Weather (Smart NY Simulation)
    const weatherElement = document.getElementById("weather");
    if (weatherElement) {
        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth(); // March is 2
        
        let temp;
        let condition;

        // Morning/Day/Night Logic for NY in March
        if (hour >= 6 && hour < 18) {
            temp = 48;
            condition = "SUNNY";
        } else if (hour >= 18 && hour < 22) {
            temp = 44;
            condition = "PARTLY CLOUDY";
        } else {
            temp = 36;
            condition = "CLEAR";
        }

        // Seasonal Check: If it were Jan/Feb, we'd add "SNOW"
        // Since it's March 14, it's mostly "CHILLY" or "RAINY"
        if (month === 2 && Math.random() > 0.8) {
            condition = "LIGHT RAIN";
        }

        weatherElement.textContent = `NEW YORK | ${condition} | ${temp}°F`;
    }
}

// --- 3. NASA APOD Logic ---
async function fetchNASAData() {
    // 1. IMPORTANT: Replace this key if you continue to get 403 or 429 errors.
    // Get your own at: https://api.nasa.gov/
    const API_KEY = "3fvGTWok7HzImafg0Cbhgze1TnQmeesAVW5kIfXS"; 
    const NASA_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
    
    try {
        const response = await fetch(NASA_URL);
        
        // Log the status code to the console for debugging
        console.log(`NASA API Response Status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`NASA_OFFLINE (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        const title = document.getElementById('apod-title');
        const img = document.getElementById('apod-image');
        const desc = document.getElementById('apod-explanation');
        const copy = document.getElementById('apod-copyright');

        if (title) title.textContent = data.title ? data.title.toUpperCase() : "TITLE UNAVAILABLE";
        if (desc) desc.textContent = data.explanation || "No explanation provided.";
        if (copy) copy.textContent = data.copyright ? `SOURCE: ${data.copyright.toUpperCase()}` : "";

        // Handle Image vs Video
        if (img) {
            if (data.media_type === 'image') {
                img.src = data.url;
                img.style.display = 'block';
                img.onerror = () => {
                    img.style.display = 'none';
                    systemLog("IMAGE RENDER ERROR");
                };
            } else {
                img.style.display = 'none';
                if (desc) {
                    desc.innerHTML += `<br><br><strong>FEATURED CONTENT:</strong> <a href="${data.url}" target="_blank" style="color:#39FF14;">WATCH VIDEO</a>`;
                }
                systemLog("NASA CONTENT: VIDEO TYPE DETECTED");
            }
        }
        
        systemLog("NASA DATA SYNCED");

    } catch (error) {
        console.error("NASA API Error:", error);
        systemLog(`NASA SYNC FAILED: ${error.message}`);
        
        // Optional: Add a fallback visual if the sync fails
        const title = document.getElementById('apod-title');
        if (title) title.textContent = "COSMIC DATA UNAVAILABLE";
    }
}

// --- 4. System Log (Status Bar) ---
function systemLog(message) {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const logText = `[${timestamp}] ${message}`;
    
    const statusBar = document.getElementById("status-bar");
    if (statusBar) {
        statusBar.textContent = logText;
    }
    console.log(logText);
}




// --- 5. Initialization ---
function initializeSystem() {
    updateClock();
    updateDashboardData();
    fetchNASAData(); // This runs in the background

    // Trigger the Pulse immediately on boot
    const statusBar = document.getElementById("status-bar");
    if (statusBar) {
        statusBar.classList.add("system-active");
        systemLog("SYSTEM BOOT COMPLETE");
    }

    // Set Intervals
    setInterval(updateClock, 1000);
    setInterval(updateDashboardData, 1800000); // Refresh weather every 30 mins
}

// Run the boot sequence
initializeSystem();

// Function to create a synthetic sonar "Ping"
// Variable to track the number of pings
// Variable to track pings
let pingCount = 0;
const MAX_PINGS = 5;

// The function that plays the sound
function playSonarPing() {
    if (pingCount < MAX_PINGS) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        
        pingCount++;
    }
}

// Store the interval in a variable so we can clear it
const sonarInterval = setInterval(playSonarPing, 4000);

document.getElementById("status-bar").addEventListener("click", () => {
    // Reset and start
    pingCount = 0;
    
    // Clear any existing interval to prevent overlapping beeps
    if (typeof window.sonarInterval !== 'undefined') clearInterval(window.sonarInterval);
    
    // Start the sequence
    playSonarPing(); // First beep immediately
    window.sonarInterval = setInterval(playSonarPing, 4000); // Subsequent beeps
    
    systemLog("SONAR ACTIVATED: 5 PINGS");
});

//Message Window Logic

function addMessage(text, type = 'received') {
    const body = document.getElementById('msg-body');
    const msg = document.createElement('div');
    msg.className = `msg bubble-${type}`;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight; // Auto-scroll to bottom
}

// Example: Trigger a message when the sonar is activated
document.getElementById("status-bar").addEventListener("click", () => {
    addMessage("Sonar sequence initiated...", "received");
});

