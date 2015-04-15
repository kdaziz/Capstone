/*
  Browsing Graph Extension - Honors Capstone
  background.js
  Author: Kevin Aziz (kdaziz7@gmail.com)
*/

"use strict";
var __RECORDING_ACTIVE__ = true;
var chrome = chrome || {};
var __DEBUG__ = true;
var debug = function(arg) { if (__DEBUG__) window.console.log(arg); };
//var interactions = {};

/** BROWSER ACTION */
chrome.browserAction.setBadgeText(__RECORDING_ACTIVE__ ? {"text":"ON"} : {"text":"OFF"});
chrome.browserAction.onClicked.addListener(function() {
	__RECORDING_ACTIVE__ = !__RECORDING_ACTIVE__;
	chrome.browserAction.setBadgeText(__RECORDING_ACTIVE__ ? {"text":"ON"} : {"text":"OFF"});
});

/** MESSAGE LISTENERS */
chrome.extension.onMessage.addListener(messageListener);

function messageListener (m) {
	if (__RECORDING_ACTIVE__) {
		if (m.type == "pageload") {
			var pageNode = new PageNode(m.url, m.title);
			api.visitPageNode(pageNode, debug);
		} else if (m.type == "linkclicked") {
			window.console.log("linkclicked");
			var edge = new Edge(m.from, m.to, m.context, m.title);
			api.visitEdge(edge, debug);
		} 
	}
}
// Definition of a PageNode object
// Must match the definition provided in page.js
var PageNode = function(url, title, visitCount) {
	var page = {};
	page.url = url;
	page.title = title || "";
	page.visitCount = visitCount;
	return page;
};

var Edge = function(fromURL, toURL, context, title) {
	var edge = {};
	edge.context = context;
	edge.title = title;
	edge.toURL = toURL;
	edge.fromURL = fromURL;
	window.console.log(edge);
	return edge;
};

var api = {};

api.urls = {
	createPageNode: "http://127.0.0.1:8080/api/createPageNode",
	updatePageNode: "http://127.0.0.1:8080/api/updatePageNode",
	getPageNode: "http://127.0.0.1:8080/api/getPageNode",
	visitPageNode: "http://127.0.0.1:8080/api/visitPageNode",
	createEdge: "http://127.0.0.1:8080/api/createEdge",
	updateEdge: "http://127.0.0.1:8080/api/updateEdge",
	getEdge: "http://127.0.0.1:8080/api/getEdge",
	visitEdge: "http://127.0.0.1:8080/api/visitEdge"
};

api.createPageNode = function(body, callback) {
	postJsonRequest(api.urls.createPageNode, body, callback);
};

api.createEdge = function(body, callback) {
	postJsonRequest(api.urls.updatePageNode, body, callback);
};

api.updatePageNode = function(body, callback) {
	postJsonRequest(api.urls.getPageNode, body, callback);
};

api.updateEdge = function(body, callback) {
	postJsonRequest(api.urls.createEdge, body, callback);
};

api.getPageNode = function(body, callback) {
	postJsonRequest(api.urls.updateEdge, body, callback);
};

api.getEdge = function(body, callback) {
	postJsonRequest(api.urls.getEdge, body, callback);
};

api.visitPageNode = function(pageNode, callback) {
	postJsonRequest(api.urls.visitPageNode, {"pageNode":pageNode}, callback);
};

api.visitEdge = function(edge, callback) {
	postJsonRequest(api.urls.visitEdge, {"edge":edge}, callback);
};


var postJsonRequest = function(url, body, callback) {
	var cb = callback || function () {};
	var request = new XMLHttpRequest();
	request.open("POST", url, true);
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			cb(JSON.parse(request.response));
		}
	};
	var message = JSON.stringify(body);
	request.send(message);
};