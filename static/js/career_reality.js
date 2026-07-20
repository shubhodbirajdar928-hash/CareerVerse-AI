// =====================================
// CAREER REALITY AI
// =====================================


const realityBtn = document.getElementById("realityBtn");



realityBtn.onclick = async function(){



const career = document.getElementById("career").value.trim();

const country = document.getElementById("country").value.trim();




if(!career){

alert("Please enter a career.");

return;

}




realityBtn.disabled=true;

realityBtn.innerHTML="🤖 Analyzing Reality...";



const result=document.getElementById("result");



result.innerHTML=`

<div class="reality-card">

<h2>🤖 AI is analyzing career reality...</h2>

<p>Please wait...</p>

</div>

`;





try{


const response = await fetch("/career-reality-api",{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


career:career,

country:country


})


});





const data = await response.json();




realityBtn.disabled=false;

realityBtn.innerHTML="🔍 Analyze Career Reality";






if(data.success===false){


result.innerHTML=`

<div class="reality-card">

<h2>❌ ${data.error}</h2>

</div>

`;

return;


}





result.innerHTML=`



<div class="reality-dashboard">





<!-- SCORE -->


<div class="reality-card reality-score">


<h2>🪞 Career Reality Score</h2>


<div class="score-number">

${data.reality_score}/100

</div>


<p>

${data.reality_status}

</p>



<div class="reality-bar">


<div class="reality-fill"

style="width:${data.reality_score}%">

</div>


</div>


</div>







<!-- DAILY LIFE -->


<div class="reality-card">


<h2>🕒 A Day In This Career</h2>


<ul>


${(data.daily_work || []).map(item=>`

<li>${item}</li>


`).join("")}


</ul>


</div>








<!-- HIDDEN TRUTH -->


<div class="reality-card warning-card">


<h2>⚠️ Hidden Truths</h2>


<ul>


${(data.hidden_truths || []).map(item=>`

<li>${item}</li>


`).join("")}


</ul>


</div>








<!-- DIFFICULTY -->


<div class="reality-card">


<h2>📊 Difficulty Reality</h2>



<div class="reality-grid">


<div class="small-card">

<h3>Technical</h3>

<h2>

${data.technical_difficulty}%

</h2>

</div>



<div class="small-card">

<h3>Competition</h3>

<h2>

${data.competition_level}%

</h2>

</div>




<div class="small-card">

<h3>Learning</h3>

<h2>

${data.learning_difficulty}%

</h2>

</div>



</div>


</div>








<!-- SALARY -->


<div class="reality-card">


<h2>💰 Salary Reality</h2>


<p>

${data.salary_reality}

</p>


</div>








<!-- AVOID -->


<div class="reality-card warning-card">


<h2>🚫 Who Should Avoid This Career?</h2>


<ul>


${(data.not_for_you || []).map(item=>`

<li>${item}</li>


`).join("")}


</ul>


</div>








<!-- INDUSTRY -->


<div class="reality-card">


<h2>🏢 Industry Reality</h2>


<p>

${data.industry_reality}

</p>


</div>








<!-- VERDICT -->


<div class="reality-card ai-verdict">


<h2>🤖 AI Final Verdict</h2>


<p>

${data.ai_verdict}

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



realityBtn.disabled=false;

realityBtn.innerHTML="🔍 Analyze Career Reality";



result.innerHTML=`

<div class="reality-card">

<h2>❌ Unable to analyze career.</h2>

</div>

`;



}



};