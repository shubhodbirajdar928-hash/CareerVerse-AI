// =====================================
// AI Skill Gap Analyzer
// =====================================


const analyzeBtn = document.getElementById("analyzeBtn");


analyzeBtn.onclick = async function(){


    const career = document.getElementById("career").value.trim();

    const skills = document.getElementById("skills").value.trim();



    if(!career){

        alert("Please enter your dream career.");

        return;

    }



    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML = "Analyzing Skills...";



    const result = document.getElementById("result");



    result.innerHTML = `

    <div class="loading-box">

        <h2>🤖 AI is analyzing your skill gap...</h2>

        <p>Please wait...</p>

    </div>

    `;



    try{


        const response = await fetch("/skill-gap-api",{


            method:"POST",


            headers:{


                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                career:career,

                skills:skills

            })


        });



        const data = await response.json();



        analyzeBtn.disabled = false;

        analyzeBtn.innerHTML="🔍 Analyze Skill Gap";



        if(data.success === false){


            result.innerHTML = `

            <h2>❌ ${data.error}</h2>

            `;

            return;

        }



        result.innerHTML = `


        <div class="result-card">


        <h2>🧠 Skill Gap Analysis</h2>



        <div class="score-box">


        <h3>Skill Readiness</h3>

        <h1>${data.skill_gap_score}%</h1>


        </div>





        <div class="info-box">


        <h3>🎯 Career Level</h3>

        <p>${data.career_level}</p>


        </div>





        <div class="info-box">


        <h3>✅ Your Current Skills</h3>


        <ul>

        ${data.existing_skills.map(skill =>

        `<li>${skill}</li>`

        ).join("")}


        </ul>


        </div>





        <div class="info-box">


        <h3>❌ Missing Skills</h3>


        <ul>

        ${data.missing_skills.map(skill =>

        `<li>${skill}</li>`

        ).join("")}


        </ul>


        </div>





        <div class="info-box">


        <h3>🔥 Priority Skills</h3>


        <ol>

        ${data.priority_skills.map(skill =>

        `<li>${skill}</li>`

        ).join("")}


        </ol>


        </div>





        <div class="info-box">


        <h3>📈 Industry Demand Match</h3>


        <h1>

        ${data.industry_demand_match}%

        </h1>


        </div>





        <div class="info-box">


        <h3>🔥 Skill Gap Severity</h3>


        <p>${data.gap_severity}</p>


        </div>





        <div class="advice-box">


        <h3>🤖 AI Recommendation</h3>


        <p>${data.recommendation}</p>


        </div>



        </div>


        `;



    }


    catch(error){


        console.error(error);


        analyzeBtn.disabled=false;

        analyzeBtn.innerHTML="🔍 Analyze Skill Gap";


        result.innerHTML=`

        <h2>
        ❌ Unable to analyze skills.
        </h2>

        `;


    }


};