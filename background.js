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
    //sync=localStorage.getItem("sync");
    if (sync!="yes") {
        console.log("using at no sync to cloud.");
        return;
    }
    var async=true;
    if (data.sync==true){
        async=false;
    }
    var xhr = new XMLHttpRequest();
    if (server[server.length-1]=="/") {
        var actionUrl=server+data.action;
    }
    else {
        var actionUrl=server+"/"+data.action;
    }
    xhr.open(data.method,actionUrl,async);
    xhr.onreadystatechange = function() {
        if (xhr.readyState==4) {
            console.log(actionUrl);
            console.log(xhr.status+":"+xhr.statusText+"\n"+":"+xhr.responseText+"\n"+"type:"+xhr.getResponseHeader("Content-Type"));
            if (xhr.status!=200){
                return;
            }
            if (data.action=="list"&&xhr.getResponseHeader("Content-Type")=="application/json") {
                wishes=[];
                var getWishes=JSON.parse(xhr.responseText);
                for (var i=0;i<=getWishes["count"];++i) {
                    var item=getWishes[i];
                    delete item["id"];
                    delete item["website"];
                    console.log(item);
                    wishes.push(getWishes[i]);
                }
                localStorage.setItem("wishes",JSON.stringify(wishes));
            }
        }
    }
    if (data.method=="POST"){
            xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    }
    if (data.action=="login"){
        console.log(user);
        console.log(passwd);
        xhr.send("username="+user+"&passwd="+passwd);
    }
    if (data.action=="add") {
        xhr.send("url="+data.url+"&img="+data.img+"&title="+data.title);
    }
    if (data.action=="delete") {
        xhr.send("url="+data.url);
    }
    if (data.action=="list") {
        xhr.send();
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
            var index=checkUrl(request.url);
            if (index!=-1) {
                sendResponse({"rep":"already collected"});
                return true;
            }
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
                var index=checkUrl(request.url);
                if (index==-1) {
                    sendResponse({"rep":"not found"});
                    return true;
                }
                console.log("delete:"+request.url);
                itemsTodelete=[];
                itemsTodelete.push(encodeURIComponent(request.url));
                data={"action":"delete","method":"POST","url":JSON.stringify(itemsTodelete)};
                sendAjax(data);
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
function firstInstall() {
    chrome.tabs.create({"url":"options.html"});
}


var sync = localStorage.getItem("sync");
var wishes = JSON.parse(localStorage.getItem("wishes"));
if (!wishes) {
    localStorage.setItem("wishes",JSON.stringify([]))
    wishes = JSON.parse(localStorage.getItem("wishes"));
}
var server=localStorage.getItem("defaultServer");
var user=localStorage.getItem("username");
var passwd=localStorage.getItem("passwd");
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
    try {
        sendAjax({"action":"login","method":"POST","sync":true});
        sendAjax({"action":"list","method":"GET"});
    }
    catch(err) {
        console.log(err);
    }


}

chrome.runtime.onMessage.addListener(handlerMessage);
chrome.runtime.onInstalled.addListener(firstInstall);
