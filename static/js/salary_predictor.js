// ==========================================
// AI SALARY PREDICTOR ENGINE
// ==========================================

const btn = document.getElementById("predictBtn");

if (btn) {
    btn.onclick = async function () {
        const role = document.getElementById("role").value.trim();
        const qualification = document.getElementById("qualification").value.trim();
        const experience = document.getElementById("experience").value.trim();
        const skills = document.getElementById("skills").value.trim();
        const country = document.getElementById("country").value.trim();
        const city = document.getElementById("city").value.trim();

        if (role === "") {
            alert("Please enter a Target Job Role.");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Benchmarking Compensation...`;

        const result = document.getElementById("result");
        result.style.display = "block";
        result.innerHTML = `
            <div style="text-align:center; padding: 60px 20px;">
                <i class="fa-solid fa-brain" style="font-size: 2.5rem; color: var(--accent); margin-bottom: 16px;"></i>
                <h2>AI is predicting salary benchmarks...</h2>
                <p style="color: var(--text-secondary);">Analyzing real-time pay bands for <strong>${role}</strong> in <strong>${country || 'India'}</strong>.</p>
            </div>
        `;

        try {
            const response = await fetch("/salary-predictor-api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role,
                    qualification,
                    experience,
                    skills,
                    country,
                    city
                })
            });

            const data = await response.json();
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-sack-dollar"></i> Predict Salary Range Now`;

            if (!response.ok || data.success === false) {
                result.innerHTML = `
                    <div style="border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); padding: 26px; border-radius: 16px; margin: 24px auto; max-width: 800px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: left;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fa-solid fa-circle-exclamation" style="font-size: 1.6rem; color: #ef4444;"></i>
                            <h3 style="color: var(--text-heading); margin: 0; font-size: 1.2rem;">Invalid Input Warning</h3>
                        </div>
                        <p style="color: var(--text-primary); font-size: 0.96rem; line-height: 1.6; margin-bottom: 16px;">${data.error || "Unable to predict salary."}</p>
                        <div style="background: var(--bg-card); border: 1px solid var(--border); padding: 12px 16px; border-radius: 10px; font-size: 0.86rem; color: var(--text-secondary);">
                            💡 <strong>Suggested Roles:</strong> <code>AI Engineer</code>, <code>Full Stack Developer</code>, <code>Data Scientist</code><br>
                            🌍 <strong>Suggested Countries:</strong> <code>India</code>, <code>USA</code>, <code>Germany</code>, <code>UK</code>, <code>Canada</code>
                        </div>
                    </div>
                `;
                result.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            const targetRole = data.role || role;
            const targetCountry = data.country || country || "India";
            const targetCity = data.city || city || "National Average";
            const isIndia = targetCountry.toLowerCase().includes("india") || (data.estimated_salary || "").includes("₹");
            const estimatedSalary = data.estimated_salary || (isIndia ? "₹10.0L - ₹22.0L / yr" : "$95,000 - $150,000 / yr");
            const percentiles = data.percentiles || {
                p25: isIndia ? "₹7.5L / yr" : "$75,000 / yr",
                p50: isIndia ? "₹14.0L / yr" : "$110,000 / yr",
                p75: isIndia ? "₹22.0L / yr" : "$150,000 / yr",
                p90: isIndia ? "₹35.0L / yr" : "$210,000 / yr"
            };

            result.innerHTML = `
                <div class="salary-dashboard-wrapper" style="display: flex; flex-direction: column; gap: 24px; max-width: 950px; margin: 0 auto; text-align: left;">
                    
                    <!-- HERO SALARY PREDICTION CARD -->
                    <div class="salary-card hero-card" style="background: linear-gradient(135deg, rgba(250, 204, 21, 0.08) 0%, var(--bg-card) 100%); border: 1px solid var(--accent); border-radius: 20px; padding: 32px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
                        <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 1px;">💰 AI COMPENSATION BENCHMARK</span>
                        <h2 style="font-size: 1.8rem; color: var(--text-heading); margin: 6px 0 0;">${targetRole}</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 4px;">🌍 <strong>${targetCountry}</strong> — ${targetCity}</p>
                        
                        <h1 style="font-size: 3.5rem; font-weight: 800; color: var(--accent); margin: 16px 0 10px; line-height: 1;">${estimatedSalary}</h1>
                        <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0;">Estimated Annual Package based on current hiring data & experience fit.</p>
                    </div>

                    <!-- 4 STAT CARDS -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">🔥 Hiring Demand</span>
                            <h3 style="font-size: 1.5rem; color: var(--accent); margin: 6px 0 0; font-weight: 800;">${data.market_demand || 85}%</h3>
                        </div>
                        <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">🚀 Pay Growth</span>
                            <h3 style="font-size: 1.5rem; color: var(--accent); margin: 6px 0 0; font-weight: 800;">${data.growth_score || 82}%</h3>
                        </div>
                        <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">🎯 AI Confidence</span>
                            <h3 style="font-size: 1.5rem; color: var(--accent); margin: 6px 0 0; font-weight: 800;">${data.confidence_score || 88}%</h3>
                        </div>
                        <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; text-align: center;">
                            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">💱 Currency</span>
                            <h3 style="font-size: 1.1rem; color: #22c55e; margin: 8px 0 0; font-weight: 700;">${data.currency || (isIndia ? '₹ INR' : '$ USD')}</h3>
                        </div>
                    </div>

                    <!-- PERCENTILE DISTRIBUTION BAR -->
                    <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px;">
                        <h3 style="color: var(--accent); font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-chart-column"></i> Salary Percentile Distribution in ${targetCountry}
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
                            <div style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 10px; padding: 14px;">
                                <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 600;">25th Percentile (Entry)</span>
                                <h4 style="color: var(--text-heading); font-size: 1.05rem; margin: 4px 0 0; font-weight: 700;">${percentiles.p25}</h4>
                            </div>
                            <div style="background: var(--bg-primary); border: 1px solid var(--accent); border-radius: 10px; padding: 14px;">
                                <span style="font-size: 0.76rem; color: var(--accent); font-weight: 600;">50th Percentile (Median)</span>
                                <h4 style="color: var(--accent); font-size: 1.05rem; margin: 4px 0 0; font-weight: 800;">${percentiles.p50}</h4>
                            </div>
                            <div style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 10px; padding: 14px;">
                                <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 600;">75th Percentile (High)</span>
                                <h4 style="color: var(--text-heading); font-size: 1.05rem; margin: 4px 0 0; font-weight: 700;">${percentiles.p75}</h4>
                            </div>
                            <div style="background: var(--bg-primary); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 10px; padding: 14px;">
                                <span style="font-size: 0.76rem; color: #22c55e; font-weight: 600;">90th Percentile (Lead)</span>
                                <h4 style="color: #22c55e; font-size: 1.05rem; margin: 4px 0 0; font-weight: 800;">${percentiles.p90}</h4>
                            </div>
                        </div>
                    </div>

                    <!-- 2-COLUMN GRID -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <!-- LEFT COLUMN -->
                        <div style="display: flex; flex-direction: column; gap: 24px;">
                            <!-- SALARY PROGRESSION -->
                            <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px;">
                                <h3 style="color: var(--accent); font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-timeline"></i> Experience Salary Growth Timeline
                                </h3>
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    ${(data.salary_progression || []).map(item => `
                                        <div style="background: rgba(20, 20, 20, 0.8); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-size: 0.88rem; color: var(--text-primary); font-weight: 600;">⚡ ${item.level}</span>
                                            <strong style="color: var(--accent); font-size: 0.95rem;">${item.salary}</strong>
                                        </div>
                                    `).join("")}
                                </div>
                            </div>

                            <!-- TOP COMPANIES -->
                            <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px;">
                                <h3 style="color: var(--accent); font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-building"></i> Top Hiring Companies in ${targetCountry}
                                </h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    ${(data.top_companies || []).map(company => `
                                        <div style="background: var(--accent-soft); border: 1px solid rgba(250, 204, 21, 0.3); color: var(--accent); padding: 8px 14px; border-radius: 100px; font-size: 0.85rem; font-weight: 600;">
                                            🏢 ${company}
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT COLUMN -->
                        <div style="display: flex; flex-direction: column; gap: 24px;">
                            <!-- RECOMMENDED SKILLS FOR PAY BOOST -->
                            <div class="salary-card" style="background: rgba(34, 197, 94, 0.03); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 16px; padding: 24px;">
                                <h3 style="color: #22c55e; font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-bolt"></i> High-Value Skills to Boost Pay (+30%)
                                </h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    ${(data.recommended_skills || []).map(skill => `
                                        <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 8px 14px; border-radius: 100px; font-size: 0.85rem; font-weight: 600;">
                                            💡 ${skill}
                                        </div>
                                    `).join("")}
                                </div>
                            </div>

                            <!-- BEST CITIES -->
                            <div class="salary-card" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px;">
                                <h3 style="color: var(--accent); font-size: 1.15rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-city"></i> Highest Paying Hiring Hubs
                                </h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                    ${(data.best_cities || []).map(c => `
                                        <div style="background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-heading); padding: 8px 14px; border-radius: 100px; font-size: 0.85rem; font-weight: 600;">
                                            🏙️ ${c}
                                        </div>
                                    `).join("")}
                                </div>
                            </div>

                            <!-- AI SALARY ADVICE -->
                            <div class="salary-card ai-card" style="background: rgba(250, 204, 21, 0.04); border: 1px solid var(--accent); border-radius: 16px; padding: 24px;">
                                <h3 style="color: var(--accent); font-size: 1.15rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-robot"></i> Executive Salary Negotiation Advice
                                </h3>
                                <p style="color: var(--text-heading); font-size: 0.95rem; line-height: 1.65; margin: 0; font-weight: 500;">
                                    ${data.recommendation || 'Focus on building portfolio proof with high-value technical skills to command upper percentile pay.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            result.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            console.error(error);
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-sack-dollar"></i> Predict Salary Range Now`;
            result.innerHTML = `
                <div class="salary-card" style="border-color: #ef4444; background: rgba(239, 68, 68, 0.05); text-align: center; max-width: 800px; margin: 24px auto;">
                    <h2 style="color: #ef4444; justify-content: center;"><i class="fa-solid fa-triangle-exclamation"></i> Unable to predict salary</h2>
                    <p style="color: var(--text-secondary);">Please check your inputs and try again.</p>
                </div>
            `;
        }
    };
}