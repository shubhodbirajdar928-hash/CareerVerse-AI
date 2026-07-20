const btn = document.getElementById("predictBtn");


// ==========================================
// SALARY PREDICTOR AI
// ==========================================

btn.onclick = async function () {


    const role = document.getElementById("role").value.trim();
    const qualification = document.getElementById("qualification").value.trim();
    const experience = document.getElementById("experience").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const country = document.getElementById("country").value.trim();
    const city = document.getElementById("city").value.trim();



    if(role === ""){

        alert("Please enter a Job Role.");
        return;

    }



    btn.disabled = true;

    btn.innerHTML = "🤖 Predicting Salary...";



    const result = document.getElementById("result");

    result.style.display="block";



    result.innerHTML = `

    <div style="text-align:center;padding:70px">

        <h2>🤖 AI is predicting your salary...</h2>

        <p>
        Analyzing market demand, location and career growth...
        </p>

    </div>

    `;



    try{


        const response = await fetch("/salary-predictor-api",{


            method:"POST",


            headers:{


                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                role,
                qualification,
                experience,
                skills,
                country,
                city

            })


        });




        const data = await response.json();




        btn.disabled=false;

        btn.innerHTML="Predict Salary";




        if(data.success === false){


            result.innerHTML = `

            <div class="salary-card">

            <h2>❌ ${data.error}</h2>

            </div>

            `;

            return;

        }






        result.innerHTML = `



<div class="salary-dashboard">





<!-- =========================
SALARY PREDICTION
========================= -->


<div class="salary-card hero-card">


<h2>
💰 Salary Prediction
</h2>


<h1 class="main-salary">

${data.estimated_salary}

</h1>


<div class="salary-info">


<p>
🌍 Country:
<b>${data.country}</b>
</p>


<p>
💱 Currency:
<b>${data.currency}</b>
</p>


</div>


</div>








<!-- =========================
ANALYTICS
========================= -->


<div class="salary-grid">



<div class="salary-card">


<h2>
🔥 Market Demand
</h2>


<h1>
${data.market_demand}%
</h1>


<div class="progress">

<div class="progress-fill"
style="width:${data.market_demand}%">

</div>

</div>


<p>
Current hiring demand for this role.
</p>


</div>







<div class="salary-card">


<h2>
🚀 Growth Potential
</h2>


<h1>
${data.growth_score}%
</h1>


<div class="progress">

<div class="progress-fill"
style="width:${data.growth_score}%">

</div>

</div>


<p>
Future career growth possibility.
</p>


</div>







<div class="salary-card">


<h2>
🎯 AI Confidence
</h2>


<h1>
${data.confidence_score}%
</h1>


<p>
Prediction reliability based on market data.
</p>


</div>



</div>








<!-- =========================
SALARY PROGRESSION
========================= -->


<div class="salary-card full-card">


<h2>
📈 Salary Growth Timeline
</h2>


<div class="timeline">


${(data.salary_progression || []).map(item=>`


<div class="timeline-item">


<h3>
${item.level}
</h3>


<p>
${item.salary}
</p>


</div>


`).join("")}



</div>


</div>








<!-- =========================
COMPANIES
========================= -->


<div class="salary-card">


<h2>
🏢 Top Hiring Companies
</h2>


<div class="chip-box">


${(data.top_companies || []).map(company=>`


<span class="chip">

${company}

</span>


`).join("")}



</div>


</div>









<!-- =========================
CITIES
========================= -->


<div class="salary-card">


<h2>
🏙️ Best Career Cities
</h2>


<div class="chip-box">


${(data.best_cities || []).map(city=>`


<span class="chip">

${city}

</span>


`).join("")}



</div>


</div>









<!-- =========================
SKILLS
========================= -->


<div class="salary-card">


<h2>
🧠 Skills To Increase Salary
</h2>


<div class="chip-box">


${(data.recommended_skills || []).map(skill=>`


<span class="chip">

${skill}

</span>


`).join("")}



</div>


</div>









<!-- =========================
AI ADVICE
========================= -->


<div class="salary-card ai-card">


<h2>
🤖 AI Salary Advice
</h2>


<p>
${data.recommendation}
</p>


</div>






</div>



`;





result.scrollIntoView({

    behavior:"smooth",

    block:"start"

});





    }



    catch(error){


        console.error(error);



        btn.disabled=false;

        btn.innerHTML="Predict Salary";



        result.innerHTML=`


        <div class="salary-card">


        <h2>
        ❌ Unable to predict salary.
        </h2>


        <p>
        Please try again.
        </p>


        </div>


        `;


    }



};