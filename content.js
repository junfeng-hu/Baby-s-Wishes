function displayContent(e) {
    if (e&&e.type=="mousewheel"&&e.wheelDelta==120){return;}
    var count=0;
    for (;cur<wishes.length;++cur) {
        var item=wishes[cur];
        if (item=="") {
            continue;
        }

        if (count==itemsPerpage) {
            break;
        }
        if (item.url.split("/")[2].search(website)==-1) {
            continue;
        }


        if (item.title.search(searchtext)==-1) {
            continue;
        }
        var li=document.createElement("li");
        li.className="col-md-3";
        li.style.position="absolute"
        li.style.left=(count%4)*25+"%"
        li.style.top=bottoms[count%4]+"px";

        var div=document.createElement("div");
        div.className="thumbnail pagination-centered";

        var a=document.createElement("a");
        a.href=item.url;
        a.title=item.title;
        a.target="_blank";
        div.appendChild(a);

        var img=document.createElement("img");
        img.src=item.img;
        img.className="img-thumbnail img-responsive";
        img.addEventListener("load",imgLoad);
        //img.style.height="250px";
        //img.style.width="250px";
        a.appendChild(img);

        var editdiv=document.createElement("div");
        editdiv.style.display="none";
        editdiv.style.backgroundColor="white";
        editdiv.style.opacity=0.7;
        editdiv.style.position="absolute";
        editdiv.style.width="245px";
        editdiv.style.bottom="90px";
        //tags="<a href=\"#deleteone\" title=\"delete this\" style=\"padding:0px 175px 0px 5px;font-size:20px\">\
        //                   <span class=\"glyphicon glyphicon-remove-circle\"></span></a>
        //                   <a href=\"#addtags\" title=\"add tags\" style=\"font-size:20px;\"><span class=\"glyphicon glyphicon-tags\"></span></a>";
        editdiv.innerHTML="<a href=\"#deleteone\" title=\"delete this\" style=\"padding-left:220px;font-size:20px\">\
                           <span class=\"glyphicon glyphicon-remove-circle\"></span></a>";

        editdiv.addEventListener("click",handleEdit);
        div.appendChild(editdiv);
        div.addEventListener("mouseover",displayEdit);
        div.addEventListener("mouseout",displayEdit);

        var check=document.createElement("input");
        check.type="checkbox";
        check.name="wish_id";
        check.value=item.url;

        var b=document.createElement("a");
        b.href=item.url;
        b.innerText=item.title;
        b.target="_blank";

        var h4=document.createElement("h4");
        h4.style.height="65px";
        h4.style.overflow="hidden";
        h4.appendChild(check);
        h4.appendChild(b);
        div.appendChild(h4);

        li.appendChild(div);

        ul.appendChild(li);

        count++;
    }
}
function imgLoad(e){
    var topli=e.target.parentNode.parentNode.parentNode;
    var i=Number(topli.style.left.slice(0,topli.style.left.length-1))/25;
    bottoms[i]=Number(topli.style.top.slice(0,topli.style.top.length-2))+Number(topli.clientHeight);
}

function selectAll() {
    var checks=document.getElementsByName("wish_id");
    for (var i=0;i<checks.length;++i) {
        var c=checks[i];
        c.checked=!allSelected;
    }
    allSelected=!allSelected;
}

function deleteAll() {
    var checks=document.getElementsByName("wish_id");
    var itemsTodelete=[];
    var nodesTodelete=[];
    for (var i=0;i<checks.length;++i) {
        var c=checks[i];
        if (c.checked) {
            nodesTodelete.push(checks[i].parentNode.parentNode.parentNode);
            itemsTodelete.push(encodeURIComponent(c.value));
            for (var j=0;j<wishes.length;++j) {
                var item=wishes[j];
                if (item==""){
                    continue;
                }
                if (item.url==c.value) {
                    wishes[j]="";
                }
            }
        }
    }
    for (var i=0;i<nodesTodelete.length;++i) {
        ul.removeChild(nodesTodelete[i]);
    }
    localStorage.setItem("wishes",JSON.stringify(wishes));
    data={"action":"delete","method":"POST","url":JSON.stringify(itemsTodelete)};    
    sendAjax(data);
    cur=0;
    ul.innerText="";
    bottoms=[0,0,0,0];
    displayContent();
}

function chooseSite(e) {
    var target=e.target;
    var button=document.getElementById("buttonSite");
    var text=document.createTextNode(target.innerText);
    buttonSite.replaceChild(text,button.firstChild);
    website=target.innerText;
    if (website=="all site") {
        website="";
    }
    cur=0;
    ul.innerText="";
    bottoms=[0,0,0,0];
    displayContent();
}

function searchAction() {
    var input=document.getElementById("searchinput");
    searchtext=input.value;
    cur=0;
    ul.innerText="";
    bottoms=[0,0,0,0];
    displayContent();
}

function enterAction(e) {
    if (e.keyCode==13) {
        searchAction()
    }
}

function displayEdit(e) {
    if (e.type=="mouseover") {
        e.currentTarget.childNodes[1].style.display="block";
    }
    else {
        e.currentTarget.childNodes[1].style.display="none";
    }
}

function handleEdit(e) {
    var a=e.target.parentNode;
    console.log(a);
    var tem=a.href.split("#");

    if (tem[tem.length-1]=="deleteone") {
        var itemTodelete=[];
        itemTodelete.push(encodeURIComponent(a.parentNode.previousSibling.href));
        for (var j=0;j<wishes.length;++j) {
            var item=wishes[j];
            if (item==""){
                continue;
            }
            if (item.url==a.parentNode.previousSibling.href) {
                wishes[j]="";
            }
        }
        ul.removeChild(a.parentNode.parentNode.parentNode);
        localStorage.setItem("wishes",JSON.stringify(wishes));
        data={"action":"delete","method":"POST","url":JSON.stringify(itemTodelete)};    
        sendAjax(data);
        cur=0;
        ul.innerText="";
        bottoms=[0,0,0,0];
        displayContent();
    }
    else {
        if (tem[tem.length-1]=="addtags") {
        }
        else {
            console.log("error in handleEdit");
        }
    }
}

var background=chrome.extension.getBackgroundPage();
var itemsPerpage=4;
var bottoms=[0,0,0,0];
var lazylis=[];
var allSelected=false;
var website="";
var searchtext="";
var wishes=background.wishes;
var sendAjax=background.sendAjax;
var ul=document.getElementById("content");
var cur=0;
ul.style.listStyle="none";
console.log(wishes);

document.addEventListener("DOMContentLoaded",displayContent);
window.addEventListener("mousewheel",displayContent);
document.getElementById("select").addEventListener("click",selectAll);
document.getElementById("delete").addEventListener("click",deleteAll);
document.getElementById("chooseSite").addEventListener("click",chooseSite);

document.getElementById("searchaction").addEventListener("click",searchAction);
document.getElementById("searchinput").addEventListener("keypress",enterAction);
