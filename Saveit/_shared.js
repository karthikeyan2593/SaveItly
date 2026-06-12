const API = 'http://localhost:5005';
let videoUrl = '';
let videoTitle = '';

// Get Info Logic
async function getInfo() {
    const input = document.getElementById('urlInput');
    if(!input) return;
    videoUrl = input.value.trim();
    
    if (!videoUrl) return;

    showLoading(true);
    showError(false);
    hideResult();

    try {
        const res = await fetch(`${API}/api/download/info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoUrl, quality: 'best' })
        });

        const data = await res.json();
        showLoading(false);

        if (!data.success) {
            showError(true, data.error || 'Failed to fetch video info!');
            return;
        }

        videoTitle = data.title;
        const titleEl = document.getElementById('videoTitle');
        if(titleEl) titleEl.textContent = data.title;
        
        const thumbImg = document.getElementById('thumbnail');
        if(thumbImg) {
            thumbImg.referrerPolicy = "no-referrer"; 
            thumbImg.src = data.thumbnail || 'placeholder.jpg';
        }

        const tableContainer = document.getElementById("download-table-container");
        const tbody = document.getElementById("download-tbody");

        if (tableContainer && tbody) {
            if (data.formats && data.formats.length > 0) {
                tbody.innerHTML = ""; 

                // Inline styles to force Dark Theme and avoid white background
                tableContainer.style.background = "rgba(255, 255, 255, 0.03)";
                tableContainer.style.border = "1px solid rgba(255, 255, 255, 0.05)";
                tableContainer.style.borderRadius = "16px";
                tableContainer.style.padding = "20px";
                tableContainer.style.marginTop = "25px";
                
                let table = tableContainer.querySelector("table");
                if(table) {
                    table.style.width = "100%";
                    table.style.borderCollapse = "collapse";
                }

                data.formats.forEach(format => {
                    const tr = document.createElement("tr");
                    tr.style.borderBottom = "1px solid rgba(255, 255, 255, 0.05)";

                    tr.innerHTML = `
                        <td style="padding: 15px 10px; color: #f2f2f2; font-weight: 600; font-size: 15px; text-align: left;">
                            ${format.quality || "N/A"} <br>
                            <span style="background: rgba(232, 255, 71, 0.1); color: #e8ff47; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-top: 5px; display: inline-block; border: 1px solid rgba(232, 255, 71, 0.2);">
                                ${format.ext || "mp4"}
                            </span>
                        </td>
                        <td style="padding: 15px 10px; color: #ccc; font-size: 14px; text-align: center;">
                            ${format.fileSize || "N/A"}
                        </td>
                        <td style="padding: 15px 10px; text-align: right;">
                            <a href="${format.url}" target="_blank" style="background: linear-gradient(135deg, #e8ff47 0%, #b2cc00 100%); color: #111 !important; padding: 10px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; font-size: 14px; box-shadow: 0 4px 15px rgba(232, 255, 71, 0.2);">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                                Download
                            </a>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });

                // User Hint for new tab downloads
                let hintMsg = document.getElementById("dl-hint");
                if(!hintMsg) {
                    hintMsg = document.createElement("p");
                    hintMsg.id = "dl-hint";
                    hintMsg.style.cssText = "color: #888; font-size: 13px; text-align: center; margin-top: 20px; line-height: 1.5;";
                    hintMsg.innerHTML = "💡 <b>Note:</b> If the video plays in a new tab, click the <b>three dots (⋮)</b> and select <b>Download</b>.";
                    tableContainer.appendChild(hintMsg);
                }

                tableContainer.style.display = "block"; 
            } else {
                tableContainer.style.display = "none";
            }
        }

        showResult();
    } catch (err) {
        showLoading(false);
        showError(true, 'Server connection failed! (Make sure API is running)');
    }
}

// Paste Button Logic
async function pasteUrl(inputId = 'urlInput', btnId = 'pasteBtn') {
    const btn = document.getElementById(btnId);
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            document.getElementById(inputId || 'urlInput').value = text;
            if(btn) {
                btn.textContent = '📋 Pasted!';
                btn.classList.add('pasted');
                setTimeout(() => {
                    btn.textContent = '📋 Paste';
                    btn.classList.remove('pasted');
                }, 2000);
            }
        }
    } catch (err) {
        alert('Clipboard permission required!');
    }
}

// Helper Functions
function showLoading(show) { 
    const el = document.getElementById('loading');
    if(el) el.classList.toggle('show', show); 
}
function showError(show, msg = '') { 
    const box = document.getElementById('errorBox');
    if(box) {
        box.textContent = msg;
        box.classList.toggle('show', show); 
    }
}
function showResult() { 
    const el = document.getElementById('resultSection');
    if(el) el.classList.add('show'); 
}
function hideResult() { 
    const el = document.getElementById('resultSection');
    if(el) el.classList.remove('show'); 
}

// Enter Key Press
document.getElementById('urlInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getInfo();
});