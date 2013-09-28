function checkUrl(url) {
    for (var i=0;i<wishes.length;++i){
        if (wishes[i]=="") {
            continue;
        }
        if (wishes[i]["url"]==url) {
            return i;
        }
    }
    return -1;
}
function sendAjax(data){
    var xhr = new XMLHttpRequest();
    console.log(server+data.action);
    xhr.open(data.method,server+data.action,true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4) {
            console.log(xhr.status+":"+xhr.statusText+"\n"+":"+xhr.responseText);
        }
    }
    if (data.method=="POST"){
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    }
    if (data.action=="login"){
        xhr.send("username="+user+"&passwd="+passwd);
    }
    if (data.action=="add") {
        xhr.send("url="+data.url+"&img="+data.img+"&title="+data.title);
    }
    if (data.action=="delete") {
        xhr.send("url="+data.url);
    }
}
function handlerMessage(request,sender,sendResponse) {
    if (request.from=="content_script") {
        if (request.action=="check") {
            var result="no";
            if (checkUrl(request.url)!=-1) {
                result="yes"
            }
            sendResponse({"collected":result});
            return true;
        }
        else if (request.action=="collect") {
            data={"action":"add","method":"POST","url":encodeURIComponent(request.url),"img":request.img,"title":request.title};
            console.log("add:"+request.url);
            sendAjax(data);
            wishes.push({"url":request.url,"img":request.img,"title":request.title});
            localStorage.setItem("wishes",JSON.stringify(wishes))
            sendResponse({"rep":"ok"});
            return true;
        }
        else { 
            if (request.action=="uncollect") {
                console.log("delete:"+request.url);
                data={"action":"delete","method":"POST","url":encodeURIComponent(request.url)};
                sendAjax(data);
                var index=checkUrl(request.url);
                wishes[index]="";
                localStorage.setItem("wishes",JSON.stringify(wishes))
                sendResponse({"rep":"ok"});
                return true;
            }
            sendResponse({"rep":"error"});
            return true;
        }

    }
}
var sync = localStorage.getItem("sync");
var wishes = JSON.parse(localStorage.getItem("wishes"));
if (!wishes) {
    localStorage.setItem("wishes",JSON.stringify([]))
    wishes = JSON.parse(localStorage.getItem("wishes"));
}
if (sync=="yes") {
    var usingPrivate = localStorage.getItem("usingPrivate");
    var user=localStorage.getItem("username");
    var passwd=localStorage.getItem("passwd");
    if (usingPrivate=="true") {
        server=localStorage.getItem("server");
    }
    else {
        server=localStorage.getItem("defaultServer");
    }
    sendAjax({"action":"login","method":"POST"});
}
chrome.runtime.onMessage.addListener(handlerMessage);
