// =====================================
// CAREER REALITY AI DASHBOARD ENGINE
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    // Quick role selection
    document.querySelectorAll('.role-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const input = document.getElementById('career');
            if (input) {
                input.value = pill.getAttribute('data-role');
                input.focus();
            }
        });
    });
});

const realityBtn = document.getElementById("realityBtn");

realityBtn.onclick = async function() {
    const careerInput = document.getElementById("career");
    const countryInput = document.getElementById("country");
    const result = document.getElementById("result");

    const career = careerInput.value.trim();
    const country = countryInput.value.trim();

    if (!career) {
        alert("Please enter a target career role.");
        return;
    }

    realityBtn.disabled = true;
    realityBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uncovering Unfiltered Reality...`;

    result.innerHTML = `
        <div class="reality-card loading-card" style="text-align: center; padding: 50px 20px;">
            <div class="ai-loader" style="margin: 0 auto 20px;"></div>
            <h2>🤖 Uncovering Real-World Industry Truths...</h2>
            <p style="color: var(--text-secondary);">Analyzing workload stress, salary benchmarks, and daily responsibilities for <strong>${career}</strong>.</p>
        </div>
    `;
    result.scrollIntoView({ behavior: "smooth", block: "center" });

    try {
        const response = await fetch("/career-reality-api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ career, country })
        });

        const data = await response.json();
        realityBtn.disabled = false;
        realityBtn.innerHTML = `<i class="fa-solid fa-masks-theater"></i> Reveal Unfiltered Career Reality`;

        if (data.success === false) {
            result.innerHTML = `
                <div class="reality-card error-card">
                    <h2>❌ Analysis Error</h2>
                    <p>${data.error || "Unable to retrieve career reality metrics."}</p>
                </div>
            `;
            return;
        }

        const isIndia = (country || "India").toLowerCase().includes("india") || (data.salary_reality || "").includes("₹");
        const fresherSal = data.fresher_salary || (isIndia ? "₹4.5L - ₹8L / yr" : "$65k - $85k / yr");
        const midSal = data.mid_salary || (isIndia ? "₹12L - ₹20L / yr" : "$110k - $145k / yr");
        const seniorSal = data.senior_salary || (isIndia ? "₹24L - ₹45L / yr" : "$160k - $240k / yr");

        let html = `
            <div class="reality-dashboard-wrapper">
                <!-- HERO SCORE METER -->
                <div class="reality-card reality-score-card">
                    <div class="score-header">
                        <div>
                            <span class="reality-badge-pill"><i class="fa-solid fa-gauge-high"></i> CAREER REALITY SCORE</span>
                            <h2>${data.career || career}</h2>
                            <p class="score-status-text">${data.reality_status || 'Realistic Industry Profile'}</p>
                        </div>
                        <div class="score-circle-display">
                            <span class="score-number">${data.reality_score || 85}</span>
                            <small>/100</small>
                        </div>
                    </div>

                    <div class="reality-progress-bar">
                        <div class="reality-progress-fill" style="width: ${data.reality_score || 85}%;"></div>
                    </div>

                    <!-- 4 KEY METRICS -->
                    <div class="reality-metrics-grid">
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-code"></i> Technical Difficulty</span>
                            <strong class="m-val">${data.technical_difficulty || 75}%</strong>
                        </div>
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-fire"></i> Competition Level</span>
                            <strong class="m-val">${data.competition_level || 80}%</strong>
                        </div>
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-graduation-cap"></i> Learning Curve</span>
                            <strong class="m-val">${data.learning_difficulty || 70}%</strong>
                        </div>
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-heart-pulse"></i> Stress & Burnout Risk</span>
                            <strong class="m-val stress-val">${data.stress_level || 'Moderate to High'}</strong>
                        </div>
                    </div>
                </div>

                <!-- 2-COLUMN DASHBOARD -->
                <div class="reality-grid-2col">
                    <!-- LEFT COLUMN -->
                    <div class="reality-col">
                        <!-- DAY IN THE LIFE -->
                        <div class="reality-card">
                            <h2><i class="fa-solid fa-clock"></i> A Day In This Career</h2>
                            <ul class="reality-list icon-list">
                                ${(data.daily_work || []).map(item => `
                                    <li><i class="fa-solid fa-circle-dot list-icon"></i> <span>${item}</span></li>
                                `).join("")}
                            </ul>
                        </div>

                        <!-- HIDDEN TRUTHS -->
                        <div class="reality-card warning-card">
                            <h2><i class="fa-solid fa-triangle-exclamation"></i> Hidden Truths & Hard Realities</h2>
                            <ul class="reality-list warning-list">
                                ${(data.hidden_truths || []).map(item => `
                                    <li><i class="fa-solid fa-triangle-exclamation list-icon-warn"></i> <span>${item}</span></li>
                                `).join("")}
                            </ul>
                        </div>

                        <!-- INDUSTRY REALITY -->
                        <div class="reality-card">
                            <h2><i class="fa-solid fa-building"></i> Industry Reality & Market Context</h2>
                            <p class="industry-text">${data.industry_reality || 'Standard growth profile across target hiring organizations.'}</p>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="reality-col">
                        <!-- SALARY BREAKDOWN -->
                        <div class="reality-card salary-reality-card">
                            <h2><i class="fa-solid fa-sack-dollar"></i> Compensation & Salary Realities</h2>
                            <p class="salary-overview-text">${data.salary_reality || 'Competitive market compensation based on skill and region.'}</p>
                            
                            <div class="reality-salary-tiers">
                                <div class="r-tier-box fresher">
                                    <small>🌱 Entry Level (0-2 Yrs)</small>
                                    <h4>${fresherSal}</h4>
                                </div>
                                <div class="r-tier-box mid">
                                    <small>⚡ Mid Level (3-6 Yrs)</small>
                                    <h4>${midSal}</h4>
                                </div>
                                <div class="r-tier-box senior">
                                    <small>🏆 Experienced (7+ Yrs)</small>
                                    <h4>${seniorSal}</h4>
                                </div>
                            </div>
                        </div>

                        <!-- WHO SHOULD AVOID THIS -->
                        <div class="reality-card danger-card">
                            <h2><i class="fa-solid fa-ban"></i> Who Should Avoid This Career?</h2>
                            <ul class="reality-list danger-list">
                                ${(data.not_for_you || []).map(item => `
                                    <li><i class="fa-solid fa-circle-xmark list-icon-danger"></i> <span>${item}</span></li>
                                `).join("")}
                            </ul>
                        </div>

                        <!-- AI VERDICT -->
                        <div class="reality-card ai-verdict-card">
                            <h2><i class="fa-solid fa-robot"></i> AI Final Verdict</h2>
                            <p class="verdict-text">${data.ai_verdict || 'A high-impact career path suitable for dedicated professionals.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        result.innerHTML = html;
        result.scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (error) {
        console.error(error);
        realityBtn.disabled = false;
        realityBtn.innerHTML = `<i class="fa-solid fa-masks-theater"></i> Reveal Unfiltered Career Reality`;
        result.innerHTML = `
            <div class="reality-card error-card">
                <h2>❌ Analysis Failed</h2>
                <p>Something went wrong during career reality synthesis. Please try again.</p>
            </div>
        `;
    }
};