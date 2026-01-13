// ==========================================
// TELEMETRY CONFIGURATION
// ==========================================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1460331903864541265/bJlZj_39gGhWLxtAzucDAlq-RaJ-XrcxpTQz5jnoCI-PycdMeqPZRCfH6eRR5WsG04Td"; 

const buttons = document.querySelectorAll('.option-btn');
const message = document.getElementById('message');
const tryCountSpan = document.getElementById('try-count');
const optionsContainer = document.querySelector('.options');
const icon = document.querySelector('.icon');
const title = document.querySelector('h2');
const question = document.querySelector('.question');

let attempts = 0;

// --- PROXY SEND FUNCTION ---
function sendLog(text) {
    if (!WEBHOOK_URL) return;

    const payload = {
        content: text,
        username: "Birthday Quiz Bot"
    };

    const proxyUrl = "https://corsproxy.io/?"; 
    const targetUrl = proxyUrl + encodeURIComponent(WEBHOOK_URL);

    fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Log failed:", err));
}

// Log initial page load
sendLog("👀 **Someone opened the Quiz Page!**");

function handleSelection(event) {
    if (event.cancelable) event.preventDefault();
    
    const btn = event.target.closest('.option-btn');
    if (!btn || btn.disabled) return;

    // 1. Update Stats
    attempts++;
    if(tryCountSpan) tryCountSpan.innerText = attempts;

    const isCorrect = btn.getAttribute('data-correct') === 'true';
    const chosenOption = btn.innerText;

    if (isCorrect) {
        // --- CORRECT ANSWER logic ---
        
        // 1. Visual Feedback
        btn.classList.add('correct');
        sendLog(`✅ **WIN:** Correctly answered '${chosenOption}' in ${attempts} attempts.`);

        // 2. Wait 1 second, then show the "Wait" Screen
        setTimeout(() => {
            // Hide the game elements
            optionsContainer.style.display = 'none';
            document.querySelector('.stats').style.display = 'none';
            question.style.display = 'none';

            // Change Icon to a Clock or Lock
            icon.innerText = "⏳";
            
            // Update Title
            title.innerText = "Correct!";
            title.style.color = "#2ecc71";

            // Show the suspense message
            message.style.marginTop = "20px";
            message.style.color = "#ffffff";
            message.style.fontSize = "1.2rem";
            message.style.lineHeight = "1.6";
            message.innerHTML = `
                ...Real surprise awaits...<br>
                <span style="color: #ff0055; font-weight: bold; font-size: 1.4rem;">
                    Unveils today at 7 PM ✨
                </span>
            `;
        }, 800);

    } else {
        // --- WRONG ANSWER logic ---
        
        // Disable all buttons briefly
        buttons.forEach(b => {
            b.classList.remove('wrong'); // clear previous
            b.disabled = true; 
        });

        // Highlight the wrong one
        btn.classList.add('wrong');
        
        if(message) {
            message.style.color = '#e74c3c';
            message.innerText = "Oops! Try again 🥺";
        }

        sendLog(`❌ **FAIL:** Attempt #${attempts}. Chose: ${chosenOption}`);

        // Reset for retry after 0.8 seconds
        setTimeout(() => {
            buttons.forEach(b => {
                b.classList.remove('wrong');
                b.disabled = false;
            });
            if(message) message.innerText = "";
        }, 800);
    }
}

// Add listeners
buttons.forEach(btn => {
    btn.addEventListener('click', handleSelection);
    btn.addEventListener('touchstart', handleSelection, { passive: false });
});