// ==========================================
// CONFIGURATION
// ==========================================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1460331903864541265/bJlZj_39gGhWLxtAzucDAlq-RaJ-XrcxpTQz5jnoCI-PycdMeqPZRCfH6eRR5WsG04Td"; 

const buttons = document.querySelectorAll('.option-btn');
const message = document.getElementById('message');
const optionsContainer = document.querySelector('.options');
// Try to find the main card container to append the footer message inside it
const cardContainer = document.querySelector('.wrapper') || document.body; 

// --- PROXY SEND FUNCTION ---
function sendLog(text) {
    if (!WEBHOOK_URL) return;
    const payload = { content: text, username: "Birthday Quiz Bot" };
    const proxyUrl = "https://corsproxy.io/?"; 
    const targetUrl = proxyUrl + encodeURIComponent(WEBHOOK_URL);
    fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.error("Log failed:", err));
}

// Log entry
sendLog("👀 **User opened the page (Auto-Solved State).**");

// --- MAIN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Highlight Correct Answer
    const correctBtn = document.querySelector('.option-btn[data-correct="true"]');
    if (correctBtn) correctBtn.classList.add('correct');

    // 2. Disable Interactions
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });

    // 3. Show "Correct!" Status
    if(message) {
        message.style.color = "#2ecc71";
        message.innerText = "Correct! 🎉";
        message.style.display = "block";
    }

    // 4. Create NEXT Button
    const nextBtn = document.createElement('a');
    nextBtn.href = 'player.html';
    nextBtn.innerText = "Next ➡";
    
    // Style Next Button
    Object.assign(nextBtn.style, {
        display: 'block',
        width: '100%',
        maxWidth: '200px',
        margin: '20px auto 15px', // Top 20, Bottom 15
        padding: '14px 20px',
        background: 'linear-gradient(45deg, #ff0050, #ff0070)', 
        color: 'white',
        textDecoration: 'none',
        borderRadius: '50px',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 5px 20px rgba(255, 0, 80, 0.4)',
    });

    // 5. Create "Sorry for delay" Footer Message
    const footerMsg = document.createElement('p');
    footerMsg.innerText = "Sorry for the delay, hope you like it and it will be worth waiting for a while ❤️";
    
    // Style Footer Message
    Object.assign(footerMsg.style, {
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.6)', // Subtle/dim text
        marginTop: '15px',
        marginBottom: '10px',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: '1.4'
    });

    // 6. Append Elements to the Page
    if(optionsContainer && optionsContainer.parentNode) {
        // Add Next button after options
        optionsContainer.parentNode.insertBefore(nextBtn, optionsContainer.nextSibling);
        // Add Footer message after the Next button
        nextBtn.parentNode.insertBefore(footerMsg, nextBtn.nextSibling);
    }
});
