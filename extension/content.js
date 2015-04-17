"use strict";
var links = [];
var chrome = chrome || {};

for (var i=0; i<document.links.length; i++) {
	links.push({
		"href": document.links[i].href,
		"title": document.links[i].title,
		"innerHTML": document.links[i].innerHTML
	});
	document.links[i].addEventListener("click", onLinkClick);
}

chrome.extension.sendMessage(
	{"type": "pageload",
	 "url": window.location.href,
	 "links": links,
	 "title": document.title}
);

function onLinkClick(e) {
	var elem;
	if (e.srcElement) elem = e.srcElement;
	else elem = e.target; 
	window.onbeforeunload = function() {
		chrome.extension.sendMessage(
			{"type":"linkclicked",
			 "from":window.location.href,
			 "to": elem.href,
			 "context": elem.innerText,
			 "title": elem.title,
			});
	}
}