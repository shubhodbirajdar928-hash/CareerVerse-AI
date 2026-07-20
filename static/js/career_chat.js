// =====================================
// AI CAREER CHATBOT
// =====================================


const sendBtn = document.getElementById("sendBtn");

const userInput = document.getElementById("userMessage");

const chatBox = document.getElementById("chatBox");




// SEND MESSAGE

sendBtn.onclick = sendMessage;



userInput.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        sendMessage();

    }

});





async function sendMessage(){


    const message = userInput.value.trim();



    if(message === ""){

        return;

    }




    // USER MESSAGE

    chatBox.innerHTML += `

    <div class="user-message">

        ${message}

    </div>

    `;



    userInput.value="";



    chatBox.scrollTop = chatBox.scrollHeight;





    // AI LOADING

    chatBox.innerHTML += `

    <div class="ai-message loading">

        🤖 Thinking...

    </div>

    `;



    chatBox.scrollTop = chatBox.scrollHeight;





    try{


        const response = await fetch("/career-chat-api",{


            method:"POST",


            headers:{


                "Content-Type":"application/json"


            },


            body:JSON.stringify({


                question: message


            })


        });






        const data = await response.json();




        // Remove thinking

        document.querySelector(".loading").remove();






        if(data.success === false){


            chatBox.innerHTML += `

            <div class="ai-message">

            🤖 ${data.error}

            </div>

            `;


        }

        else{


            chatBox.innerHTML += `

<div class="ai-message">

🤖 ${formatAIResponse(data.answer)}

</div>


            `;


        }






    }

    catch(error){



        document.querySelector(".loading").remove();



        chatBox.innerHTML += `


        <div class="ai-message">

        ❌ Unable to connect with AI.

        </div>


        `;



        console.error(error);



    }




    chatBox.scrollTop = chatBox.scrollHeight;



}







// =====================================
// QUICK ACTION BUTTONS
// =====================================


const quickButtons = document.querySelectorAll(".quick-actions button");



quickButtons.forEach(button=>{


    button.onclick=function(){


        userInput.value = button.innerText;


        sendMessage();


    }


});
// =====================================
// FORMAT AI RESPONSE
// =====================================

function formatAIResponse(text){

    return text

    // headings
    .replace(/### (.*?)(\n|$)/g,
    "<h3>$1</h3>")

    // bold text
    .replace(/\*\*(.*?)\*\*/g,
    "<b>$1</b>")

    // bullet points
    .replace(/^\* (.*)$/gm,
    "<li>$1</li>")

    // numbered lists
    .replace(/^\d+\.\s(.*)$/gm,
    "<li>$1</li>")

    // new lines
    .replace(/\n/g,
    "<br>");

}
// =====================================
// NEW CHAT
// =====================================


const newChatBtn = document.getElementById("newChatBtn");


newChatBtn.onclick = async function(){


    chatBox.innerHTML = `

    <div class="ai-message">

    🤖 Hello 👋

    I am your CareerVerse AI Career Mentor.

    Ask me anything about careers, skills,
    roadmaps, jobs or interviews.

    </div>

    `;



    try{

        await fetch("/clear-chat",{

            method:"POST"

        });


    }

    catch(error){

        console.log(error);

    }


};