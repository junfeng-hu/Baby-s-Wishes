function getContainer() {
    var domin=document.URL.split("/")[2];
    console.log(domin);
    var container;
    switch(domin) {
        case "detail.tmall.com" :
            container=document.getElementById("J_Amount");
            break;
        case "item.taobao.com" :
            container=document.getElementById("J_Social").getElementsByTagName("ul")[0];
            break;
        case "product.dangdang.com" :
            container=document.getElementsByClassName("sale")[0];
            break;
        case "www.amazon.cn" :
            container=document.getElementById("buyboxDivId");
            break;
        case "item.jd.com" :
            container=document.getElementById("choose-btns");
            break;
        default :
            container=undefined;
            break;
    }
    return container;
}

function insertButton() {
    var container=getContainer();
    console.log(container);
    var button=document.createElement("button");
    button.type="button";
    button.id="button";
    if (window.COLLECTED) {
        button.innerText="Collected";
    }
    else {
        button.innerText="Collect";
    }
    button.className="cbtn cbtn-primary cbtn-lg";
    button.addEventListener('click',storeUrl);
    container.appendChild(button);

}
function getImg() {
     var domin=document.URL.split("/")[2];
    console.log(domin);
    var imgsrc;
    switch(domin) {
        case "detail.tmall.com" :
            imgsrc=document.querySelector("#J_ImgBooth").attributes.getNamedItem("src").value;
            break;
        case "item.taobao.com" :
            imgsrc=document.querySelector("#J_ImgBooth").src;
            break;
        case "product.dangdang.com" :
            imgsrc=document.getElementById("largePic").src;
            break;
        case "www.amazon.cn" :
            imgsrc=document.getElementById("original-main-image").src;
            break;
        case "item.jd.com":
            imgsrc=document.getElementById("spec-n1").getElementsByTagName("img")[0].src;
            break;
        default :
            imgsrc=undefined;
            break;
    }
    return imgsrc;

}
function storeUrl() {
    var button=this;

    if (button.innerText=="Collected") {
        var action="uncollect";
        button.innerText="Collect";
    }
    else {
        var action="collect";
        button.innerText="Collected";
    }
    var imgsrc=getImg();
    console.log(imgsrc);
    chrome.runtime.sendMessage({"from":"content_script",
        "url":url,
        "img":imgsrc,
        "title":title,
        "action":action
    }, handlerResponse);

}
var url=document.URL;
var title=document.title;
var COLLECTED=false;
chrome.runtime.sendMessage({"from":"content_script",
        "url":url,
        "title":title,
        "action":"check"},
        function(response){
            if (response.collected=="yes") {
                window.COLLECTED=true;
            }
            insertButton();
        });
function handlerResponse(response) {
    console.log(response);
}




