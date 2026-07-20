const btn = document.getElementById("checkBtn");


// ==========================================
// AI CAREER MATCH
// ==========================================

btn.onclick = async function () {


    const career = document.getElementById("career").value.trim();
    const qualification = document.getElementById("qualification").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const strengths = document.getElementById("strengths").value.trim();
    const experience = document.getElementById("experience").value.trim();
    const country = document.getElementById("country").value.trim();



    if(career === ""){

        alert("Please enter your Dream Career.");
        return;

    }



    btn.disabled = true;

    btn.innerHTML = "🤖 Analyzing Profile...";



    const result = document.getElementById("result");


    result.style.display="block";


    result.innerHTML = `

    <div style="text-align:center;padding:60px">

    <h2>🤖 AI is analyzing your career profile...</h2>

    <p>Please wait...</p>

    </div>

    `;



    try{


        const response = await fetch("/career-match-api",{


            method:"POST",


            headers:{


                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                career:career,

                qualification:qualification,

                skills:skills,

                strengths:strengths,

                experience:experience,

                country:country

            })


        });



        const data = await response.json();



        btn.disabled=false;

        btn.innerHTML="Check Career Match";



        if(data.success === false){


            result.innerHTML = `

            <div class="career-card">

            <h2>❌ ${data.error}</h2>

            </div>

            `;

            return;

        }






        result.innerHTML = `



<div class="career-dashboard">



<!-- SCORE -->

<div class="career-card score-card">


<h2>🎯 Career Match Score</h2>


<div class="score-circle">


<h1>

${data.match_percentage}%

</h1>


<p>

${data.match_status}

</p>


</div>


</div>






<!-- IDENTITY -->

<div class="career-card">


<h2>🧬 Career Identity</h2>


<h3 class="identity">

${data.career_identity}

</h3>


<p>

${data.profile_summary}

</p>


</div>







<!-- ANALYSIS -->


<div class="stats-grid">


<div class="career-card">

<h3>🛠 Skill Match</h3>

<h1>

${data.skill_match_score}%

</h1>

</div>




<div class="career-card">

<h3>💡 Interest Match</h3>

<h1>

${data.interest_match_score}%

</h1>

</div>




<div class="career-card">

<h3>🔥 Industry Demand</h3>

<h1>

${data.industry_demand_score}%

</h1>

</div>


</div>







<!-- STRENGTHS -->

<div class="career-card">


<h2>✅ Your Strengths</h2>


<div class="chip-container">


${(data.strengths || []).map(item=>`

<div class="green-chip">

✔ ${item}

</div>


`).join("")}


</div>


</div>







<!-- MISSING SKILLS -->


<div class="career-card">


<h2>⚠️ Missing Skills</h2>


<div class="chip-container">


${(data.missing_skills || []).map(item=>`

<div class="red-chip">

✖ ${item}

</div>


`).join("")}


</div>


</div>







<!-- ADVANTAGES -->


<div class="career-card">


<h2>🏆 Career Advantages</h2>


<ul>

${(data.career_advantages || []).map(item=>`

<li>

${item}

</li>


`).join("")}

</ul>


</div>







<!-- RISKS -->


<div class="career-card">


<h2>🚨 Career Risks</h2>


<ul>


${(data.career_risks || []).map(item=>`

<li>

${item}

</li>


`).join("")}


</ul>


</div>








<!-- ACTIONS -->


<div class="career-card">


<h2>🚀 Recommended Actions</h2>


<ul>


${(data.recommended_actions || []).map(item=>`

<li>

${item}

</li>


`).join("")}


</ul>


</div>








<!-- READINESS -->


<div class="career-card">


<h2>📈 Career Readiness</h2>


<h1>

${data.career_readiness}

</h1>


</div>







<!-- AI ADVICE -->


<div class="career-card ai-card">


<h2>🤖 AI Career Advice</h2>


<p>

${data.personalized_advice}

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

        btn.innerHTML="Check Career Match";



        result.innerHTML=`

        <div class="career-card">

        <h2>❌ Unable to analyze career.</h2>

        <p>Please try again.</p>

        </div>

        `;


    }



};