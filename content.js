function displayContent() {
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
        img.style.height="250px";
        img.style.width="250px";
        a.appendChild(img);

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

function selectAll() {
    var checks=document.getElementsByName("wish_id");
    for (var i=0;i<checks.length;++i) {
        var c=checks[i];
        c.checked=!allSelected;
    }
    allSelected=!allSelected;
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
    displayContent();
    cur=0;
}

function searchAction() {
    var input=document.getElementById("searchinput");
    searchtext=input.value;
    cur=0;
    ul.innerText="";
    displayContent();
    cur=0;
}

function enterAction(e) {
    if (e.keyCode==13) {
        searchAction()
    }
}

var itemsPerpage=8;
var allSelected=false;
var website="";
var searchtext="";
var wishes=JSON.parse(localStorage.getItem("wishes"));
var ul=document.getElementById("content");
var cur=0;
ul.style.listStyle="none";
console.log(wishes);

document.addEventListener("DOMContentLoaded",displayContent);
document.getElementById("more").addEventListener("click",displayContent);
document.getElementById("select").addEventListener("click",selectAll);
document.getElementById("chooseSite").addEventListener("click",chooseSite);

document.getElementById("searchaction").addEventListener("click",searchAction);
document.getElementById("searchinput").addEventListener("keypress",enterAction);
