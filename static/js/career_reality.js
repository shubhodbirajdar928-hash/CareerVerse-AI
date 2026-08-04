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

        if (!response.ok || data.success === false) {
            result.innerHTML = `
                <div style="border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); padding: 26px; border-radius: 16px; margin: 24px auto; max-width: 900px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: left;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.6rem; color: #ef4444;"></i>
                        <h3 style="color: var(--text-heading); margin: 0; font-size: 1.2rem;">Invalid Input Warning</h3>
                    </div>
                    <p style="color: var(--text-primary); font-size: 0.96rem; line-height: 1.6; margin-bottom: 16px;">${data.error || "The entered career or country name is invalid or not recognized."}</p>
                    <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 12px 16px; border-radius: 10px; font-size: 0.86rem; color: var(--text-secondary);">
                        💡 <strong>Suggested Careers:</strong> <code>Software Engineer</code>, <code>Data Scientist</code>, <code>Doctor</code>, <code>Lawyer</code><br>
                        🌍 <strong>Suggested Countries:</strong> <code>India</code>, <code>USA</code>, <code>Germany</code>, <code>UK</code>, <code>Canada</code>
                    </div>
                </div>
            `;
            result.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        const isIndia = (country || "India").toLowerCase().includes("india") || (data.salary_reality || "").includes("₹");
        const fresherSal = data.fresher_salary && data.fresher_salary !== "--" ? data.fresher_salary : (isIndia ? "₹5.0L - ₹9.0L / yr" : "$65,000 - $90,000 / yr");
        const midSal = data.mid_salary && data.mid_salary !== "--" ? data.mid_salary : (isIndia ? "₹12.0L - ₹22.0L / yr" : "$110,000 - $155,000 / yr");
        const seniorSal = data.senior_salary && data.senior_salary !== "--" ? data.senior_salary : (isIndia ? "₹25.0L - ₹48.0L / yr" : "$165,000 - $250,000 / yr");

        const techDiff = data.technical_difficulty || 75;
        const compLvl = data.competition_level || 80;
        const learnDiff = data.learning_difficulty || 70;

        let html = `
            <div class="reality-dashboard-wrapper">
                <!-- HERO SCORE METER -->
                <div class="reality-card reality-score-card">
                    <div class="score-header">
                        <div>
                            <span class="reality-badge-pill"><i class="fa-solid fa-gauge-high"></i> CAREER REALITY VERDICT</span>
                            <h2>${data.career || career} <span style="font-size: 0.95rem; color: var(--text-secondary); font-weight: 500;">(${country || 'Global'})</span></h2>
                            <p class="score-status-text">${data.reality_status || 'Realistic Industry Profile & Assessment'}</p>
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
                            <strong class="m-val">${techDiff} / 100</strong>
                        </div>
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-fire"></i> Competition Level</span>
                            <strong class="m-val">${compLvl} / 100</strong>
                        </div>
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-graduation-cap"></i> Learning Curve</span>
                            <strong class="m-val">${learnDiff} / 100</strong>
                        </div>
                        <div class="metric-pill-box">
                            <span class="m-label"><i class="fa-solid fa-heart-pulse"></i> Stress & Burnout Risk</span>
                            <strong class="m-val stress-val">${data.stress_level || 'Moderate to High Risk'}</strong>
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
                                ${(data.daily_work && data.daily_work.length ? data.daily_work : [
                                    "Executing core daily operational tasks and technical deliverables",
                                    "Aligning with cross-functional stakeholders and team leads",
                                    "Reviewing quality benchmarks and resolving complex bottlenecks",
                                    "Adapting to tight deadlines and real-time client requirements",
                                    "Engaging in continuous professional learning and skill upgrades"
                                ]).map(item => `
                                    <li><i class="fa-solid fa-circle-dot list-icon"></i> <span>${item}</span></li>
                                `).join("")}
                            </ul>
                        </div>

                        <!-- HIDDEN TRUTHS -->
                        <div class="reality-card warning-card">
                            <h2><i class="fa-solid fa-triangle-exclamation"></i> Hidden Truths & Hard Realities</h2>
                            <ul class="reality-list warning-list">
                                ${(data.hidden_truths && data.hidden_truths.length ? data.hidden_truths : [
                                    "Entry-level compensation requires proven hands-on portfolio proof",
                                    "Frequent overtime during critical product release and launch cycles",
                                    "Rapid technological changes require self-driven off-hours learning",
                                    "High accountability for system failures or missed milestones",
                                    "Promotion criteria heavily depend on measurable business impact"
                                ]).map(item => `
                                    <li><i class="fa-solid fa-triangle-exclamation list-icon-warn"></i> <span>${item}</span></li>
                                `).join("")}
                            </ul>
                        </div>

                        <!-- INDUSTRY REALITY -->
                        <div class="reality-card">
                            <h2><i class="fa-solid fa-building"></i> Industry Reality & Market Context</h2>
                            <p class="industry-text" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.65; margin: 0;">${data.industry_reality || 'Steady industry demand with strong long-term growth opportunities for skilled professionals.'}</p>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div class="reality-col">
                        <!-- SALARY BREAKDOWN -->
                        <div class="reality-card salary-reality-card">
                            <h2><i class="fa-solid fa-sack-dollar"></i> Compensation & Salary Realities</h2>
                            <p class="salary-overview-text" style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 16px;">${data.salary_reality || 'Realistic compensation tiers based on experience and region.'}</p>
                            
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
                                ${(data.not_for_you && data.not_for_you.length ? data.not_for_you : [
                                    "Individuals who prefer repetitive tasks without problem-solving",
                                    "Anyone uncomfortable with continuous learning and tech updates",
                                    "Professionals looking for low-stress jobs with no accountability"
                                ]).map(item => `
                                    <li><i class="fa-solid fa-circle-xmark list-icon-danger"></i> <span>${item}</span></li>
                                `).join("")}
                            </ul>
                        </div>

                        <!-- AI VERDICT -->
                        <div class="reality-card ai-verdict-card">
                            <h2><i class="fa-solid fa-robot"></i> AI Strategic Reality Verdict</h2>
                            <p class="verdict-text" style="color: var(--text-heading); font-size: 0.95rem; line-height: 1.65; margin: 0;">${data.ai_verdict || 'A highly rewarding career path for dedicated professionals willing to invest in continuous upskilling.'}</p>
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