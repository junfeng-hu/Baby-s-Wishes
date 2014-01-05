// Save this script as `options.js`

// Saves options to localStorage.
function IsDisplayUserinfo() {
  var select = document.getElementById("sync");
  var sync = select.children[select.selectedIndex].value;
  var userdiv=document.getElementById("userinfo");
    var serverdiv=document.getElementById("server");
    if ( sync=="yes" ) {
        //username=localStorage.getItem("username");
        //passwd=localStorage.getItem("passwd");
       if (userdiv.childNodes.length!=0) {
           return ;
       }
       displayServer();
        var username=localStorage.getItem("username");
        var passwd=localStorage.getItem("passwd");
        generate_userinput(username,passwd);
    }
    else{
       userdiv.innerHTML = '';
       serverdiv.innerHTML='';
    }

}
function displayServer() {
    var check=document.createElement("input");
    check.type="checkbox";
    var check_value=localStorage.getItem("usingPrivate");
    if (check_value=="true") {
        check.checked=true;
    }
    else {
        check.checked=false;
    }
    check.id="private";
    var checklabel=document.createElement("label");
    checklabel.htmlFor="private";
    checklabel.innerText="Using private Server?";
    var divcheck=document.createElement("div");
    divcheck.className="checkbox";
    divcheck.appendChild(checklabel);
    divcheck.appendChild(check);

    var serverinput=document.createElement("input");
    serverinput.type="text";
    serverinput.className="form-control"
    serverinput.name="url";
    var url=localStorage.getItem("defaultServer");
    serverinput.disabled=true;
    if (check_value=="true") {
        if (localStorage.getItem("server")) {
            url=localStorage.getItem("server");
        }
        serverinput.disabled=false;
    }
    serverinput.value=url;
    serverinput.id="servername";
    var serverlabel=document.createElement("label");
    serverlabel.htmlFor="servername";
    serverlabel.innerText="Server:";

    var divinput=document.createElement("div");
    divinput.className="form-group";
    divinput.appendChild(serverlabel);
    divinput.appendChild(serverinput);


    var serverdiv=document.getElementById("server");
    serverdiv.appendChild(divcheck);

    br=document.createElement("br");
    serverdiv.appendChild(br);
    serverdiv.appendChild(divinput);
    check.addEventListener('click',ChangeServer);
}
function ChangeServer() {
   var check=this; 
   var serverinput=document.getElementById("servername");
   if (check.checked) {
       serverinput.value=localStorage.getItem("server");
       serverinput.disabled=false;
   }
   else {
       serverinput.value=localStorage.getItem("defaultServer");
       serverinput.disabled=true;
   }
}
function generate_userinput(username,passwd) {
    userinput=document.createElement("input");
    userinput.name="username";
    userinput.type="text";
    userinput.id="name";
    userinput.className="form-control";
    userinput.value=username;
    var userlabel=document.createElement("label");
    userlabel.htmlFor="name";
    userlabel.innerText="Username:";
    var divuser=document.createElement("div");
    divuser.className="form-group";
    divuser.appendChild(userlabel);
    divuser.appendChild(userinput);
    


    passwdinput=document.createElement("input");
    passwdinput.name="passwd";
    passwdinput.type="password";
    passwdinput.id="passwd";
    passwdinput.className="form-control";
    passwdinput.value=passwd;
    var passwdlabel=document.createElement("label");
    passwdlabel.htmlFor="passwd";
    passwdlabel.innerText="Password:";
    var divpasswd=document.createElement("div");
    divpasswd.className="form-group";
    divpasswd.appendChild(passwdlabel);
    divpasswd.appendChild(passwdinput);

    var userdiv=document.getElementById("userinfo");
    userdiv.appendChild(divuser);
    br=document.createElement("br");
    userdiv.appendChild(br);
    userdiv.appendChild(divpasswd);
    
}
function save_options() {

// Update status to let user know options were saved.
    
    var select = document.getElementById("sync");
    var sync = select.children[select.selectedIndex].value;
    localStorage.setItem("sync",sync);
    if (sync=="no") {
        return ;
    }
    var serverinput=document.getElementById("servername");
    var check=document.getElementById("private");
    var userinput=document.getElementById("name");
    var passwdinput=document.getElementById("passwd");
    localStorage.setItem(userinput.name,userinput.value);
    localStorage.setItem(passwdinput.name,passwdinput.value);
    localStorage.setItem("usingPrivate",check.checked);
    if (check.checked) {
        localStorage.setItem("server",serverinput.value);
    }
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    }, 750);
    background.sync=sync;
    background.server=serverinput.value;
    background.user=userinput.value;
    background.passwd=passwdinput.value;
    console.log(sync);
    console.log(background.sync);
    try{
        sendAjax({"action":"login","method":"POST","sync":true});
        sendAjax({"action":"list","method":"GET"});
    }
    catch(err){
        console.log(err);
    }
}
// Restores select box state to saved value from localStorage.
function restore_options() {
    sync = localStorage.getItem("sync");
    if (!sync) {
        sync="yes"; 
    }
    var select = document.getElementById("sync");
    for (var i = 0; i < select.children.length; i++) {
        var child = select.children[i];
        if (child.value ==sync ) {
            child.selected = "true";
            break;
        }
    }
    if ( sync=="no" ) {
        return ;
    }
    displayServer();
    var username=localStorage.getItem("username");
    var passwd=localStorage.getItem("passwd");
    generate_userinput(username,passwd);
}

var background=chrome.extension.getBackgroundPage();
var sendAjax=background.sendAjax;

localStorage.setItem("defaultServer","http://python7.duapp.com");
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#sync').addEventListener('click', IsDisplayUserinfo);
document.querySelector('#save').addEventListener('click',save_options);
