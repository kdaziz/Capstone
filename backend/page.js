// page.js
// Defines the "Page" object, which acts as a node in the Browsing Graph

var PageNode = function(url, title) {
	var page = {};
	page.visited = false;
	page.url = url;
	page.title = title || "";
	page.visitCount = 0;
	return page;
};

var getPageFromRequest = function(request) {
	//for (var i in request) console.log(i);
	console.log(request.read());
};

module.exports = {
	'page' : PageNode,
	'getPageFromRequest' : getPageFromRequest,
}