// =====================================
// AI RESUME ANALYZER
// =====================================


const analyzeBtn = document.getElementById("analyzeResumeBtn");



analyzeBtn.onclick = async function(){



const fileInput = document.getElementById("resumeFile");

const file = fileInput.files[0];



if(!file){

alert("Please upload your resume.");

return;

}




analyzeBtn.disabled = true;

analyzeBtn.innerHTML = "🤖 Analyzing Resume...";



const result = document.getElementById("result");



result.innerHTML = `

<div class="resume-card">

<h2>
🤖 AI is reading your resume...
</h2>

<p>
Analyzing skills, projects, experience and career readiness...
</p>

</div>

`;




try{


const formData = new FormData();


formData.append("resume", file);





const response = await fetch("/resume-api",{

method:"POST",

body:formData

});




const data = await response.json();




analyzeBtn.disabled = false;

analyzeBtn.innerHTML = "🤖 Analyze Resume";




if(data.success === false){


result.innerHTML = `

<div class="resume-card">

<h2>
❌ ${data.error}
</h2>

</div>

`;

return;

}






result.innerHTML = `


<div class="resume-dashboard">



<!-- JOB READINESS -->


<div class="resume-card resume-score">


<h2>
🎯 Job Readiness Score
</h2>


<h1>
${data.job_readiness_score}/100
</h1>


<p>
${data.experience_level}
</p>


</div>







<!-- SCORE CARDS -->


<div class="resume-grid">



<div class="small-resume-card">

<h3>
🎯 Job Readiness
</h3>

<h1>
${data.job_readiness_score}%
</h1>

</div>




<div class="small-resume-card">

<h3>
👔 Recruiter Impact
</h3>

<h1>
${data.recruiter_impact_score}%
</h1>

</div>





<div class="small-resume-card">

<h3>
🧠 Skill Evidence
</h3>

<h1>
${data.skill_evidence_score}%
</h1>

</div>





<div class="small-resume-card">

<h3>
🚀 Interview Confidence
</h3>

<h1>
${data.interview_confidence_score}%
</h1>

</div>



</div>









<!-- STRENGTHS -->


<div class="resume-card">


<h2>
✅ Resume Strengths
</h2>



<div class="resume-tags">


${(data.strengths || []).map(item => `


<div class="resume-tag">

✔ ${item}

</div>


`).join("")}



</div>


</div>









<!-- WEAKNESS -->


<div class="resume-card">


<h2>
⚠️ Improvement Areas
</h2>


<ul>


${(data.weaknesses || []).map(item => `


<li>

${item}

</li>


`).join("")}


</ul>


</div>









<!-- MISSING SKILLS -->


<div class="resume-card">


<h2>
🛠 Missing Skills
</h2>


<div class="resume-tags">


${(data.missing_skills || []).map(item => `


<div class="resume-tag">

❌ ${item}

</div>


`).join("")}



</div>


</div>









<!-- CAREER MATCH -->


<div class="resume-card">


<h2>
🎯 Best Career Matches
</h2>


<ul>


${(data.recommended_roles || []).map(item => `


<li>

${item}

</li>


`).join("")}



</ul>


</div>









<!-- RECRUITER VIEW -->


<div class="resume-card">


<h2>
👔 Recruiter First Impression
</h2>


<p>

${data.final_verdict}

</p>


</div>









<!-- AI IMPROVEMENT -->


<div class="resume-card ai-resume-card">


<h2>
🤖 AI Resume Improvement Plan
</h2>



<p>

${(data.suggestions || []).map(item => `

${item}<br><br>

`).join("")}


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



analyzeBtn.disabled=false;

analyzeBtn.innerHTML="🤖 Analyze Resume";



result.innerHTML = `


<div class="resume-card">


<h2>
❌ Unable to analyze resume.
</h2>


<p>
Please try again.
</p>


</div>


`;



}



};