// page.js
// Defines the "Page" object, which acts as a node in the Browsing Graph

"use strict";
var module = module || {};

var PageNode = function(url, title, visitCount) {
	var page = {};
	page.url = url;
	page.title = title || "";
	page.visitCount = visitCount;
	return page;
};

module.exports = {
	"PageNode" : PageNode,
};