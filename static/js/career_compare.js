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



        ${createCareerCard(data.career1)}



        ${createCareerCard(data.career2)}



        </div>


<div class="comparison-summary">


<h2>
📊 AI Career Comparison
</h2>



<div class="compare-metric">


<h3>
💰 Salary Potential
</h3>


<div class="bar-row">

<span>
${data.career1.name}
</span>

<div class="bar">

<div class="fill"
style="width:${data.career1.salary_score}%">

</div>

</div>


<b>
${data.career1.salary_score}
</b>


</div>



<div class="bar-row">

<span>
${data.career2.name}
</span>

<div class="bar">

<div class="fill"
style="width:${data.career2.salary_score}%">

</div>

</div>


<b>
${data.career2.salary_score}
</b>


</div>


</div>





<div class="compare-metric">


<h3>
📈 Industry Demand
</h3>


<div class="bar-row">

<span>
${data.career1.name}
</span>

<div class="bar">

<div class="fill"
style="width:${data.career1.demand_score}%">

</div>

</div>

<b>
${data.career1.demand_score}
</b>

</div>



<div class="bar-row">

<span>
${data.career2.name}
</span>

<div class="bar">

<div class="fill"
style="width:${data.career2.demand_score}%">

</div>

</div>

<b>
${data.career2.demand_score}
</b>

</div>


</div>





<div class="compare-metric">


<h3>
🚀 Future Growth
</h3>


<div class="bar-row">

<span>
${data.career1.name}
</span>

<div class="bar">

<div class="fill"
style="width:${data.career1.growth_score}%">

</div>

</div>

<b>
${data.career1.growth_score}
</b>

</div>



<div class="bar-row">

<span>
${data.career2.name}
</span>

<div class="bar">

<div class="fill"
style="width:${data.career2.growth_score}%">

</div>

</div>

<b>
${data.career2.growth_score}
</b>

</div>


</div>


</div>


        <div class="winner-box">


<h2>🏆 AI Career Recommendation</h2>


<h1>${data.winner}</h1>


<div class="winner-content">


<h3>Why AI selected this?</h3>

<p>
${data.reason}
</p>


<h3>Career Advice</h3>

<p>
${data.recommendation}
</p>


</div>


<div class="decision-badge">

✨ Best Career Choice Based On Future Growth

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





// =====================================
// Career Card Generator
// =====================================

function createCareerCard(career){
    if (!career) return '';

    const salary = career.salary || {};
    const orgs = Array.isArray(career.organizations) ? career.organizations : [];
    const topCities = Array.isArray(career.top_cities) ? career.top_cities : [];

    const renderedCities = topCities.map(city => {
        if (typeof city === 'string') {
            return `
                <div class="city-box" style="padding: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                    <h4 style="margin: 0 0 4px 0;">🏙️ ${city}</h4>
                </div>
            `;
        }
        const cityName = city.city || city.name || "Hub City";
        const cityCountry = city.country || "";
        const cityDemand = city.demand || "High";
        const companiesStr = Array.isArray(city.companies) ? city.companies.join(", ") : (city.companies || "");
        const reasonStr = city.reason || "";

        return `
            <div class="city-box" style="padding: 10px; margin-bottom: 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <h4 style="margin: 0 0 4px 0;">🏙️ ${cityName}</h4>
                ${cityCountry ? `<p style="margin: 2px 0;">🌍 ${cityCountry}</p>` : ''}
                ${cityDemand ? `<p style="margin: 2px 0;">🔥 ${cityDemand}</p>` : ''}
                ${companiesStr ? `<p style="margin: 2px 0;">🏢 ${companiesStr}</p>` : ''}
                ${reasonStr ? `<p style="margin: 2px 0; font-size: 0.85rem; opacity: 0.8;">${reasonStr}</p>` : ''}
            </div>
        `;
    }).join("");

    return `
        <div class="compare-card">
            <div class="section-box title-box">
                <h2>🚀 ${career.name || "Career Role"}</h2>
            </div>

            <div class="section-box">
                <h3>💰 Salary</h3>
                <p>🌍 ${salary.country || "Target Country"}</p>
                <h2>${salary.amount || "Market Rate"}</h2>
                <p>💱 ${salary.currency || ""}</p>
            </div>

            <div class="section-box opportunity-box">
                <h3>🚀 Career Opportunity Score</h3>
                <h1>${career.overall_score || 85}/100</h1>
                <p>Based on:</p>
                <div class="score-factors">
                    <span>💰 Salary</span>
                    <span>📈 Demand</span>
                    <span>🚀 Growth</span>
                    <span>⚖️ Stability</span>
                    <span>🌎 Future Scope</span>
                </div>
            </div>

            <div class="section-box">
                <h3>📊 Performance</h3>
                <p>💰 Salary Score: <b>${career.salary_score || 85}/100</b></p>
                <p>📈 Demand: <b>${career.demand_score || 80}/100</b></p>
                <p>🚀 Growth: <b>${career.growth_score || 85}/100</b></p>
                <p>⏳ Learning Time: <b>${career.learning_time || "3-4 Years"}</b></p>
            </div>

            <div class="section-box">
                <h3>🏢 Top Organizations</h3>
                ${orgs.length ? orgs.map(org => `
                    <div class="list-item">✔ ${typeof org === 'object' ? (org.name || JSON.stringify(org)) : org}</div>
                `).join("") : '<p>Top Industry Employers</p>'}
            </div>

            <div class="section-box">
                <h3>🏙️ Top Hiring Cities</h3>
                ${renderedCities || '<p>Global Hiring Hubs</p>'}
            </div>
        </div>
    `;
}