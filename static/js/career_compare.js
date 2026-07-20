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

            <h2>❌ ${data.error}</h2>

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

return `

<div class="compare-card">


<div class="section-box title-box">

<h2>
🚀 ${career.name}
</h2>

</div>



<div class="section-box">

<h3>
💰 Salary
</h3>

<p>
🌍 ${career.salary.country || "Country"}
</p>

<h2>
${career.salary.amount || "Not Available"}
</h2>

<p>
💱 ${career.salary.currency || ""}
</p>

</div>




<div class="section-box opportunity-box">

<h3>
🚀 Career Opportunity Score
</h3>


<h1>
${career.overall_score}/100
</h1>


<p>
Based on:
</p>


<div class="score-factors">

<span>💰 Salary</span>

<span>📈 Demand</span>

<span>🚀 Growth</span>

<span>⚖️ Stability</span>

<span>🌎 Future Scope</span>

</div>


</div>





<div class="section-box">

<h3>
📊 Performance
</h3>


<p>
💰 Salary Score:
<b>${career.salary_score}/100</b>
</p>


<p>
📈 Demand:
<b>${career.demand_score}/100</b>
</p>


<p>
🚀 Growth:
<b>${career.growth_score}/100</b>
</p>


<p>
⏳ Learning Time:
<b>${career.learning_time}</b>
</p>


</div>





<div class="section-box">

<h3>
🏢 Top Organizations
</h3>


${career.organizations.map(org=>`

<div class="list-item">
✔ ${org}
</div>

`).join("")}


</div>






<div class="section-box">

<h3>
🏙️ Top Hiring Cities
</h3>


${(career.top_cities || []).map(city=>`

<div class="city-box">

<h4>
🏙️ ${city.city}
</h4>

<p>
🌍 ${city.country}
</p>

<p>
🔥 ${city.demand}
</p>

<p>
🏢 ${city.companies.join(", ")}
</p>

<p>
${city.reason}
</p>


</div>


`).join("")}


</div>




</div>

`;

}