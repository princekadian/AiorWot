/* ============================================
   AiOrNot — Frontend Logic
   ============================================ */

// DOM Elements
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const detectBtn = document.getElementById('detectBtn');
const humanizeBtn = document.getElementById('humanizeBtn');
const resultsSection = document.getElementById('resultsSection');
const detectionResults = document.getElementById('detectionResults');
const humanizeResults = document.getElementById('humanizeResults');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const loadingSub = document.getElementById('loadingSub');
const errorToast = document.getElementById('errorToast');
const errorText = document.getElementById('errorText');

// Gauge elements
const gaugeFill = document.getElementById('gaugeFill');
const gaugeValue = document.getElementById('gaugeValue');
const gaugeLabel = document.getElementById('gaugeLabel');
const gaugeVerdict = document.getElementById('gaugeVerdict');
const verdictIcon = document.getElementById('verdictIcon');
const verdictText = document.getElementById('verdictText');

// Results elements
const reasoningText = document.getElementById('reasoningText');
const sentencesList = document.getElementById('sentencesList');
const humanizedOutput = document.getElementById('humanizedOutput');

// State
let lastHumanizedText = '';

// ============================================
// Character Count
// ============================================

textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});

// ============================================
// Detect AI Text
// ============================================

async function detectText() {
    const text = textInput.value.trim();
    
    if (!text) {
        showError('Please paste some text to analyze.');
        return;
    }
    
    if (text.split(/\s+/).length < 10) {
        showError('Please paste at least 10 words for accurate detection.');
        return;
    }
    
    showLoading('Analyzing your text...', 'Our AI is examining writing patterns');
    disableButtons(true);
    
    try {
        const response = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Server error (${response.status})`);
        }
        
        const data = await response.json();
        hideLoading();
        showDetectionResults(data);
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to analyze text. Please try again.');
    } finally {
        disableButtons(false);
    }
}

// ============================================
// Humanize Text
// ============================================

async function humanizeText() {
    const text = textInput.value.trim();
    
    if (!text) {
        showError('Please paste some text to humanize.');
        return;
    }
    
    if (text.split(/\s+/).length < 5) {
        showError('Please paste at least 5 words to humanize.');
        return;
    }
    
    showLoading('Humanizing your text...', 'Rewriting to sound naturally human');
    disableButtons(true);
    
    try {
        const response = await fetch('/api/humanize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Server error (${response.status})`);
        }
        
        const data = await response.json();
        hideLoading();
        showHumanizeResults(data);
        
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to humanize text. Please try again.');
    } finally {
        disableButtons(false);
    }
}

// ============================================
// Display Detection Results
// ============================================

function showDetectionResults(data) {
    const score = Math.round(data.score || 0);
    
    // Show results section
    resultsSection.classList.remove('hidden');
    detectionResults.classList.remove('hidden');
    
    // Animate gauge
    animateGauge(score);
    
    // Set verdict
    setVerdict(score);
    
    // Set reasoning
    if (data.reasoning) {
        reasoningText.textContent = data.reasoning;
        document.getElementById('reasoningSection').classList.remove('hidden');
    }
    
    // Render sentence analysis
    if (data.sentences && data.sentences.length > 0) {
        renderSentences(data.sentences);
        document.getElementById('sentencesSection').classList.remove('hidden');
    }
    
    // Scroll to results
    setTimeout(() => {
        detectionResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// ============================================
// Gauge Animation
// ============================================

function animateGauge(targetScore) {
    const circumference = 2 * Math.PI * 85; // r=85
    const offset = circumference - (targetScore / 100) * circumference;
    
    // Update SVG gradient based on score
    updateGaugeColor(targetScore);
    
    // Animate the fill
    gaugeFill.style.strokeDasharray = circumference;
    gaugeFill.style.strokeDashoffset = circumference;
    
    requestAnimationFrame(() => {
        gaugeFill.style.strokeDashoffset = offset;
    });
    
    // Animate number
    animateNumber(gaugeValue, 0, targetScore, 1200);
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function updateGaugeColor(score) {
    // Add inline SVG gradient since we need dynamic colors
    let gradientDef = gaugeFill.closest('svg').querySelector('#gaugeGradient');
    if (!gradientDef) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gaugeGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('id', 'gaugeStop1');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('id', 'gaugeStop2');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        gaugeFill.closest('svg').prepend(defs);
        gradientDef = gradient;
    }
    
    const stop1 = document.getElementById('gaugeStop1');
    const stop2 = document.getElementById('gaugeStop2');
    
    if (score <= 30) {
        stop1.setAttribute('stop-color', '#34d399');
        stop2.setAttribute('stop-color', '#6ee7b7');
    } else if (score <= 65) {
        stop1.setAttribute('stop-color', '#fbbf24');
        stop2.setAttribute('stop-color', '#fb923c');
    } else {
        stop1.setAttribute('stop-color', '#f87171');
        stop2.setAttribute('stop-color', '#c084fc');
    }
}

// ============================================
// Verdict
// ============================================

function setVerdict(score) {
    gaugeVerdict.className = 'gauge-verdict';
    
    if (score <= 30) {
        verdictIcon.textContent = '✅';
        verdictText.textContent = 'Likely Human Written';
        gaugeVerdict.classList.add('verdict-human');
        gaugeLabel.textContent = 'AI Generated';
    } else if (score <= 65) {
        verdictIcon.textContent = '⚠️';
        verdictText.textContent = 'Mixed / Uncertain';
        gaugeVerdict.classList.add('verdict-mixed');
        gaugeLabel.textContent = 'AI Generated';
    } else {
        verdictIcon.textContent = '🤖';
        verdictText.textContent = 'Likely AI Generated';
        gaugeVerdict.classList.add('verdict-ai');
        gaugeLabel.textContent = 'AI Generated';
    }
}

// ============================================
// Sentence Analysis
// ============================================

function renderSentences(sentences) {
    sentencesList.innerHTML = '';
    
    sentences.forEach(s => {
        const score = Math.round(s.score || 0);
        let category = 'human';
        if (score > 65) category = 'ai';
        else if (score > 30) category = 'mixed';
        
        const item = document.createElement('div');
        item.className = `sentence-item ${category}`;
        item.innerHTML = `
            <span class="sentence-score">${score}%</span>
            <span class="sentence-text">${escapeHtml(s.text)}</span>
        `;
        sentencesList.appendChild(item);
    });
}

// ============================================
// Humanize Results
// ============================================

function showHumanizeResults(data) {
    lastHumanizedText = data.humanizedText || '';
    
    resultsSection.classList.remove('hidden');
    humanizeResults.classList.remove('hidden');
    humanizedOutput.textContent = lastHumanizedText;
    
    // Reset copy button
    document.getElementById('copyBtnText').textContent = 'Copy to Clipboard';
    
    setTimeout(() => {
        humanizeResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// ============================================
// Copy Humanized Text
// ============================================

async function copyHumanized() {
    if (!lastHumanizedText) return;
    
    try {
        await navigator.clipboard.writeText(lastHumanizedText);
        const btn = document.getElementById('copyBtnText');
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = 'Copy to Clipboard';
        }, 2000);
    } catch {
        showError('Failed to copy. Please select and copy manually.');
    }
}

// ============================================
// Re-detect Humanized Text
// ============================================

function redetectHumanized() {
    if (!lastHumanizedText) return;
    textInput.value = lastHumanizedText;
    charCount.textContent = lastHumanizedText.length;
    detectText();
}

// ============================================
// Clear All
// ============================================

function clearAll() {
    textInput.value = '';
    charCount.textContent = '0';
    resultsSection.classList.add('hidden');
    detectionResults.classList.add('hidden');
    humanizeResults.classList.add('hidden');
    lastHumanizedText = '';
    
    // Reset gauge
    gaugeFill.style.strokeDashoffset = 534;
    gaugeValue.textContent = '0';
}

// ============================================
// Loading / Error Helpers
// ============================================

function showLoading(text, sub) {
    loadingText.textContent = text || 'Processing...';
    loadingSub.textContent = sub || 'This may take a few seconds';
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function disableButtons(disabled) {
    detectBtn.disabled = disabled;
    humanizeBtn.disabled = disabled;
}

let errorTimeout;
function showError(message) {
    errorText.textContent = message;
    errorToast.classList.remove('hidden');
    errorToast.classList.add('visible');
    
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        errorToast.classList.remove('visible');
        errorToast.classList.add('hidden');
    }, 4000);
}

// ============================================
// Escape HTML
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Nav Tab Highlighting (cosmetic)
// ============================================

document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-link[data-tab]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});
