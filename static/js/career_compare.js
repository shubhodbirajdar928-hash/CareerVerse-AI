// =====================================
// Career Compare AI
// =====================================


const compareBtn = document.getElementById("compareBtn");


compareBtn.onclick = async function(){


    const career1 = document.getElementById("career1").value.trim();

    const career2 = document.getElementById("career2").value.trim();

    const country = document.getElementById("country").value.trim();
    
   


    if(!career1 || !career2){

        alert("Please enter both careers.");

        return;

    }



    compareBtn.disabled = true;

    compareBtn.innerHTML = "Comparing Careers...";



    const result = document.getElementById("result");



    result.innerHTML = `

    <div style="padding:50px">

        <h2>🤖 AI is comparing careers...</h2>

        <p>Please wait...</p>

    </div>

    `;



    try{


        const response = await fetch("/compare-api",{


            method:"POST",


            headers:{


                "Content-Type":"application/json"


            },

body: JSON.stringify({

career1: career1,

career2: career2,

country: country

})


        });



        const data = await response.json();



        compareBtn.disabled = false;

        compareBtn.innerHTML="Compare Careers";



        if(data.success === false){
            result.innerHTML = `
                <div class="error-card" style="border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); padding: 26px; border-radius: 16px; margin-top: 20px; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <i class="fa-solid fa-circle-exclamation" style="font-size: 1.6rem; color: #ef4444;"></i>
                        <h3 style="color: var(--text-heading, #f4f4f5); margin: 0; font-size: 1.2rem;">Invalid Career Input</h3>
                    </div>
                    <p style="color: var(--text-primary, #e4e4e7); font-size: 0.96rem; line-height: 1.6; margin-bottom: 16px;">${data.error || "Unable to compare careers. Please enter valid job titles."}</p>
                    <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--border, rgba(255,255,255,0.1)); padding: 12px 16px; border-radius: 10px; font-size: 0.86rem; color: var(--text-secondary, #a1a1aa);">
                        💡 <strong>Try Real Careers:</strong> <code>Software Engineer</code>, <code>Data Scientist</code>, <code>Doctor</code>, <code>Lawyer</code>, <code>Pilot</code>, <code>Chef</code>, <code>Civil Engineer</code>
                    </div>
                </div>
            `;
            return;
        }





        result.innerHTML = `
        <div class="compare-grid">
            ${createCareerCard(data.career1, true, country)}
            ${createCareerCard(data.career2, false, country)}
        </div>

        <!-- HEAD-TO-HEAD DECISION MATRIX TABLE -->
        <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; margin-bottom: 40px;">
            <div style="margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
                <h3 style="color: var(--text-heading); font-size: 1.35rem; font-weight: 800; margin: 0 0 6px 0; display: flex; align-items: center; gap: 10px;">
                    ⚔️ Head-to-Head Strategic Decision Matrix
                </h3>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.88rem;">
                    Location-verified parameters for <strong>${c1Name}</strong> vs <strong>${c2Name}</strong> in <strong>${country || 'Target Market'}</strong>.
                </p>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border);">
                            <th style="padding: 14px; color: var(--text-muted); font-weight: 700; width: 25%;">Decision Dimension</th>
                            <th style="padding: 14px; color: #60a5fa; font-weight: 800; width: 37.5%;">🚀 ${c1Name}</th>
                            <th style="padding: 14px; color: #fde047; font-weight: 800; width: 37.5%;">⚡ ${c2Name}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">🌱 Entry Level Pay</td>
                            <td style="padding: 14px; color: #22c55e; font-weight: 700;">${c1Bench.fresher || 'Market Rate'}</td>
                            <td style="padding: 14px; color: #22c55e; font-weight: 700;">${c2Bench.fresher || 'Market Rate'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">⚡ Mid Level Pay</td>
                            <td style="padding: 14px; color: var(--accent); font-weight: 700;">${c1Bench.mid || 'Market Rate'}</td>
                            <td style="padding: 14px; color: var(--accent); font-weight: 700;">${c2Bench.mid || 'Market Rate'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">👑 Senior Lead Pay</td>
                            <td style="padding: 14px; color: #a855f7; font-weight: 700;">${c1Bench.senior || 'Market Rate'}</td>
                            <td style="padding: 14px; color: #a855f7; font-weight: 700;">${c2Bench.senior || 'Market Rate'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">🔥 Market Job Demand</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c1.demand || (c1.demand_score > 85 ? 'Very High' : 'High')}</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c2.demand || (c2.demand_score > 85 ? 'Very High' : 'High')}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">⏳ Preparation Time</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c1.learning_time || '3-4 Years'}</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c2.learning_time || '3-4 Years'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">🏢 Top Employers</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c1Orgs}</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c2Orgs}</td>
                        </tr>
                        <tr>
                            <td style="padding: 14px; color: var(--text-heading); font-weight: 700;">🏙️ Primary Hiring Cities</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c1Cities}</td>
                            <td style="padding: 14px; color: var(--text-secondary);">${c2Cities}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- NEW FEATURE: CAREER SWITCHABILITY & TRANSITION ROADMAP -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; padding: 28px; margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <h3 style="color: #60a5fa; font-size: 1.15rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
                    🔄 Cross-Role Transition & Skill Switchability
                </h3>
                <span style="font-size: 0.72rem; color: #3b82f6; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 4px 12px; border-radius: 20px; font-weight: 700;">
                    Flexibility Analysis
                </span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6; margin-bottom: 16px;">
                Transitioning between <strong>${c1Name}</strong> and <strong>${c2Name}</strong> involves shared foundational expertise with target skill bridges.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 14px;">
                    <strong style="color: #60a5fa; font-size: 0.84rem; display: block; margin-bottom: 6px;">⚡ Transferable Core Skills</strong>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); display: block; line-height: 1.5;">
                        Analytical Thinking, Problem Solving, Core Domain Knowledge, Technical Documentation
                    </span>
                </div>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 14px;">
                    <strong style="color: var(--accent); font-size: 0.84rem; display: block; margin-bottom: 6px;">🎯 Specialized Bridge Training</strong>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); display: block; line-height: 1.5;">
                        6-12 Months Targeted Upskilling & Applied Portfolio Development
                    </span>
                </div>
            </div>
        </div>

        <!-- WINNER RECOMMENDATION BOX -->
        <div class="winner-box">
            <h2>🏆 Strategic Career Recommendation</h2>
            <h1>${data.winner}</h1>
            <div class="winner-content">
                <h3>Strategic Decision Rationale</h3>
                <p>${data.reason}</p>
                <h3>Strategic Advice</h3>
                <p>${data.recommendation}</p>
            </div>
            <div class="decision-badge">
                ✨ Optimal Choice Based On Market Mobility & Salary Trajectory
            </div>
        </div>
        `;



    }



    catch(error){


        console.error(error);



        compareBtn.disabled=false;


        compareBtn.innerHTML="Compare Careers";



        result.innerHTML=`

        <h2>

        ❌ Unable to compare careers.

        </h2>

        `;


    }



};





function createCareerCard(career, isPrimary, countryTarget) {
    if (!career) return '';

    const accentColor = isPrimary ? "#3b82f6" : "#facc15";
    const accentBg = isPrimary ? "rgba(59, 130, 246, 0.08)" : "rgba(250, 204, 21, 0.08)";
    const borderColor = isPrimary ? "rgba(59, 130, 246, 0.45)" : "rgba(250, 204, 21, 0.45)";
    const badgeLabel = isPrimary ? "🚀 PRIMARY ROLE 1" : "⚡ COMPARISON ROLE 2";
    const badgeColor = isPrimary ? "#60a5fa" : "#fde047";

    const salaryBench = career.salary_benchmark || {};
    const fresherPay = salaryBench.fresher || "Data unavailable";
    const midPay = salaryBench.mid || "Data unavailable";
    const seniorPay = salaryBench.senior || "Data unavailable";
    const countryName = salaryBench.country || countryTarget || "Target Market";

    const demandRating = career.demand || (career.demand_score > 85 ? "Very High" : "High");
    const growthOutlook = career.growth || (career.growth_score > 85 ? "Fast Growing" : "Growing");
    const learningTime = career.learning_time || "3-4 Years Dedicated Preparation";

    const orgs = Array.isArray(career.organizations) ? career.organizations : [];
    const topCities = Array.isArray(career.top_cities) ? career.top_cities : [];
    const timeline = Array.isArray(career.future_timeline) ? career.future_timeline : [];

    const renderedCities = topCities.map(city => {
        if (typeof city === 'string') {
            return `<span style="font-size: 0.76rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; color: var(--text-secondary); font-weight: 600;">🏙️ ${city}</span>`;
        }
        const cityName = city.city || city.name || "Hub City";
        return `<span style="font-size: 0.76rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; color: var(--text-secondary); font-weight: 600;">🏙️ ${cityName} (${city.demand || 'High'})</span>`;
    }).join(" ");

    return `
        <div class="compare-card" style="border: 1px solid ${borderColor}; box-shadow: 0 10px 30px rgba(0,0,0,0.4); border-radius: 18px; padding: 24px;">
            
            <!-- Card Header -->
            <div style="background: ${accentBg}; border: 1px solid ${borderColor}; border-radius: 14px; padding: 18px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: ${badgeColor}; letter-spacing: 1.2px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                    ${badgeLabel}
                </span>
                <h2 style="color: var(--text-heading); font-size: 1.45rem; margin: 0; font-weight: 800;">
                    ${career.name || "Career Role"}
                </h2>
            </div>

            <!-- Country Salary Ranges -->
            <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                    <span style="font-size: 0.82rem; font-weight: 800; color: ${accentColor}; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-coins"></i> ${countryName} Salary Ranges
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                    <div style="background: rgba(34, 197, 94, 0.06); border: 1px solid rgba(34, 197, 94, 0.25); border-radius: 10px; padding: 10px;">
                        <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; display: block;">🌱 Entry Level</span>
                        <strong style="color: #22c55e; font-size: 0.88rem; display: block; margin-top: 4px;">${fresherPay}</strong>
                    </div>
                    <div style="background: rgba(250, 204, 21, 0.06); border: 1px solid rgba(250, 204, 21, 0.25); border-radius: 10px; padding: 10px;">
                        <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; display: block;">⚡ Mid Level</span>
                        <strong style="color: var(--accent); font-size: 0.88rem; display: block; margin-top: 4px;">${midPay}</strong>
                    </div>
                    <div style="background: rgba(168, 85, 247, 0.06); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 10px; padding: 10px;">
                        <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; display: block;">👑 Senior Lead</span>
                        <strong style="color: #a855f7; font-size: 0.88rem; display: block; margin-top: 4px;">${seniorPay}</strong>
                    </div>
                </div>
            </div>

            <!-- Opportunity Score & Market Indicators -->
            <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-heading);">🚀 Opportunity Fit Index</span>
                    <span style="font-size: 1.4rem; font-weight: 900; color: ${accentColor};">${career.overall_score || 85}/100</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 10px;">
                        <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; display: block;">🔥 JOB DEMAND</span>
                        <strong style="color: #22c55e; font-size: 0.86rem;">${demandRating}</strong>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 10px; padding: 10px;">
                        <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; display: block;">🚀 FUTURE GROWTH</span>
                        <strong style="color: #3b82f6; font-size: 0.86rem;">${growthOutlook}</strong>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.78rem; color: var(--text-secondary);">
                    ⏳ <strong>Preparation Curve:</strong> ${learningTime}
                </div>
            </div>

            <!-- 5-Year Progression Timeline -->
            ${timeline.length ? `
            <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <h4 style="margin: 0 0 10px; font-size: 0.85rem; color: var(--text-heading); font-weight: 800;">
                    📈 5-Year Promotion & Title Escalation
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${timeline.map(step => `
                        <div style="font-size: 0.78rem; color: var(--text-secondary); background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; border-left: 3px solid ${accentColor};">
                            ${step}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Top Organizations -->
            <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <h4 style="margin: 0 0 10px; font-size: 0.85rem; color: var(--text-heading); font-weight: 800;">
                    🏢 Prime Hiring Employers
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${orgs.length ? orgs.map(org => `
                        <span style="font-size: 0.76rem; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; color: var(--text-secondary); font-weight: 600;">
                            ${typeof org === 'object' ? (org.name || JSON.stringify(org)) : org}
                        </span>
                    `).join('') : '<span style="font-size: 0.78rem; color: var(--text-muted);">Major Industry Employers</span>'}
                </div>
            </div>

            <!-- Top Hiring Cities -->
            <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border); border-radius: 14px; padding: 18px;">
                <h4 style="margin: 0 0 10px; font-size: 0.85rem; color: var(--text-heading); font-weight: 800;">
                    🏙️ Top Hiring Hub Cities
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${renderedCities || '<span style="font-size: 0.78rem; color: var(--text-muted);">Global Talent Hubs</span>'}
                </div>
            </div>
        </div>
    `;
}