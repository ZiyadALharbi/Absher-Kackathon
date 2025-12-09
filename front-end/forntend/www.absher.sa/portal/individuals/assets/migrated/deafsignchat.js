// Get the chatbot element
const ChatBoatComponent = `
<div class="card deafSignChatcard">
  <div id="header">
    <div id="logo">
     <div class='deafchatIcn'></div>
    </div>
    <div id="title">
      <div>
        <span id="title" style="width: 100%; color: rgb(106, 106, 106); padding-left: 20px; font-size: 15px;">أبشر، مساعدك الشخصي</span>
      </div>
    </div>
    <div id="close-button">
      <div id="hide-chatbot" class="closedeafchatbtn"></div>
    </div>
  </div>

  <div id="message-section" dir="ltr">
    <div id="intro-bot">
      <img src="/portal/deaf-sign/individuals/GapFiller.gif" id="GapFillerGif" width="100%" >
      <p>

        السلام عليكم أنا مساعدك الشخصي من أبشر 😃

        ‏الرجاء اختيار إحدى الخيارات المتاحة 
      
      </p>
    </div>
    <div id="bot-timestamp" class="message">
    </div>
  </div>
</div>  
`;


// Get the show and hide buttons
const showButton = document.querySelector('#show-chatbot');
let hideButton = '',
    chatbot, data1;
// Show the chatbot when the show button is clicked
[showButton].forEach(function(element) {
    element.addEventListener('click', () => {
        chatDeafFunc();
        chatbot = document.querySelector('.deafSignChatcard');
        hideButton = document.querySelector('#hide-chatbot');
        chatbot.style.display = 'block';
        hideButton.addEventListener('click', () => {
            chatbot.style.display = 'none';
        });
    });
});


// Hide the chatbot when the hide button is clicked


const chatDeafFunc = () => {
    document.querySelector("body").insertAdjacentHTML("beforeend", ChatBoatComponent);

    // create a div to contain the elements and append it to the body
    document.querySelector("#main-chat") != null ? document.querySelector("#main-chat").remove() : '';
    const elementContainer = document.createElement("div");
    elementContainer.id = "main-chat";
    const elementContainerchild = document.createElement("div");
    document.getElementById("message-section").appendChild(elementContainer);
    document.getElementById("main-chat").appendChild(elementContainerchild);

    let mainchatBot = document.getElementById("main-chat");
    const chatdownlink = document.createElement("a");
    chatdownlink.id = "chatdown";
    mainchatBot.appendChild(chatdownlink);

    // function to generate child elements from the data
    function generateChildElements(currentElement, rootData, childData) {

        let timeStampUser = document.createElement("div");
        timeStampUser.id = "user-timestamp";
        timeStampUser.classList.add("message");
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let message = `You - ${hours}:${minutes}`;
        timeStampUser.innerHTML = message;


        let userDiv = document.createElement("div");
        userDiv.id = "user";
        userDiv.classList.add("message");
        gif = document.createElement("IMG");
        gif.setAttribute("src", rootData.gifSrc);
        //gif.setAttribute("src", "/portal/individuals/images/GapFiller.gif");
        content = document.createElement("p");
        content.innerHTML = rootData.label;
        userDiv.appendChild(gif);
        userDiv.appendChild(content);
        elementContainerchild.appendChild(userDiv);
        elementContainerchild.appendChild(timeStampUser);

        const firstchildElement = document.createElement("div");
        firstchildElement.id = "bot-stamp-element";
        firstchildElement.classList.add("chatgrid");
        // generate child elements
        childData.forEach(function(childData) {
            const childElement = document.createElement("a");
            // childElement.textContent = childData.label;
            childElement.classList.add("message"); // add the "message" class
            childElement.id = "bot";
            childElement.href = "#chatdown";
            gif = document.createElement("IMG");
            gif.setAttribute("src", childData.gifSrc);
            //gif.setAttribute("src", "/portal/individuals/images/GapFiller.gif");
            content = document.createElement("p");
            content.innerHTML = childData.label;
            let timeStampBot = document.getElementById("bot-timestamp");
            let now = new Date();
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            let message = `أبشر، مساعدك الشخصي - ${hours}:${minutes}`;
            timeStampBot.innerHTML = "<div class='deafchatIcn'></div>" + message;
            //timeStampBot.innerHTML= "<a id='chatdown' /><img width=\"30px\" height=\"30px\" style=\"margin-right:2%;\" src=\"https://cdn.labiba.ai/UploadedFiles/WebIntegration/Images/76578c6f-2be5-4263-a8b1-2cd5f30d5519.png\">" + message ;


            childElement.addEventListener("click", function() {
                if (childData.children.length > 0) {
                    generateChildElements(childElement, childData, childData.children);
                }
            });

            childElement.appendChild(gif);
            childElement.appendChild(content);
            firstchildElement.appendChild(childElement);
            elementContainerchild.appendChild(firstchildElement);
            elementContainer.appendChild(timeStampBot);
        });
    }

    // read the data from the JSON file
    fetch("/portal/individuals/js/data.json?v=29012023")
        .then(response => response.json())
        .then(data => {
            data1 = data;
            // generate the root element from the data
            const firstchildElement = document.createElement("div");
            firstchildElement.id = "first-bot-stamp-element";
            firstchildElement.classList.add("chatgrid");
            const rootElement1 = document.createElement("a");
            gif = document.createElement("IMG");
            // console.log(data[0].label);
            gif.setAttribute("src", data[0].gifSrc);
            //gif.setAttribute("src", "/portal/individuals/images/GapFiller.gif");
            content = document.createElement("p");
            content.innerHTML = data[0].label;
            // let timeStampBot=document.getElementById("bot-timestamp");
            // let now = new Date();
            // let hours = now.getHours().toString().padStart(2, '0');
            // let minutes = now.getMinutes().toString().padStart(2, '0');
            // let message = `أبشر، مساعدك الشخصي - ${hours}:${minutes}`;
            // timeStampBot.innerHTML= "<img width=\"30px\" height=\"30px\" style=\"margin-right:2%;\" src=\"https://cdn.labiba.ai/UploadedFiles/WebIntegration/Images/76578c6f-2be5-4263-a8b1-2cd5f30d5519.png\">" + message ;
            // rootElement.textContent =
            rootElement1.id = "bot"; // set the ID attribute
            rootElement1.href = "#chatdown";
            rootElement1.classList.add("message"); // add the "message" class
            rootElement1.appendChild(gif);
            rootElement1.appendChild(content);
            firstchildElement.appendChild(rootElement1);
            elementContainerchild.appendChild(firstchildElement);

            const rootElement2 = document.createElement("a");
            gif2 = document.createElement("IMG");
            // console.log(data[0].label);
            gif2.setAttribute("src", data[1].gifSrc);
            //gif2.setAttribute("src", "/portal/individuals/images/GapFiller.gif");
            content2 = document.createElement("p");
            content2.innerHTML = data[1].label;
            let timeStampBot = document.getElementById("bot-timestamp");
            let now = new Date();
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            let message = `أبشر، مساعدك الشخصي - ${hours}:${minutes}`;
            timeStampBot.innerHTML = "<a id='chatdown' /><div class='deafchatIcn'></div>" + message;

            //timeStampBot.innerHTML= "<a id='chatdown' /><img width=\"30px\" height=\"30px\" style=\"margin-right:2%;\" src=\"https://cdn.labiba.ai/UploadedFiles/WebIntegration/Images/76578c6f-2be5-4263-a8b1-2cd5f30d5519.png\">" + message ;
            // rootElement.textContent =
            rootElement2.id = "bot"; // set the ID attribute
            rootElement2.href = "#chatdown";
            rootElement2.classList.add("message"); // add the "message" class
            rootElement2.appendChild(gif2);
            rootElement2.appendChild(content2);
            firstchildElement.appendChild(rootElement2);
            elementContainerchild.appendChild(firstchildElement);
            elementContainer.appendChild(timeStampBot);

            // add event listener to generate child elements on demand
            rootElement1.addEventListener("click", function() {
                if (data[0].children.length > 0) {
                    generateChildElements(rootElement1, data[0], data[0].children);
                }
            });

            // add event listener to generate child elements on demand
            rootElement2.addEventListener("click", function() {
                if (data[1].children.length > 0) {
                    generateChildElements(rootElement2, data[1], data[1].children);
                }
            });
        })
        .catch(error => {
            console.error("Error reading data from JSON file:", error);
        });
}