/**
	api.js
	author: Kevin Aziz
	Capstone
*/
'use strict';
var require = require || null;
var module = module || null;

// Imports
var page = require('./page.js');
var cypher = require('./cypher.js');

var getGraph = function(cb) {
	cypher.getGraph(cb);
}

var createPageNode = function(pageNode, cb) {
	if (pageNode !== null) {
		var doesPageNodeExistCallback = function(responseNode) {
			if (responseNode !== null) {
				cb({'error':'pageNode already exists'});
			} else {
				cypher.createPageNode(pageNode, false, cb);
			}
		};
		cypher.getPageNodeByUrl(pageNode.url, doesPageNodeExistCallback);
	} else {
		cb({'error':'pageNode required'});
	}
};

var createEdge = function(edge, cb) {
	if (edge !== null) {
		var doesEdgeExistCallback = function(responseEdge) {
			if (responseEdge !== null) {
				cb({'error':'edge already exists'});
			} else {
				var getPageNodeCallback = function (pageNode) {
					if (pageNode !== null) {
						cypher.createEdge(edge, false, cb);
					} else {
						var toNode = new page.PageNode(edge.toURL);
						cypher.createPageNode(toNode, false, function() {
							cypher.createEdge(edge, false, cb);
						});
					}
				};
				cypher.getPageNodeByUrl(edge.toURL, getPageNodeCallback);
			}
		};
		cypher.getEdgeByUrls(edge.toURL, edge.fromURL, doesEdgeExistCallback);
	} else {
		cb({'error':'edge required'});
	}
};

var updatePageNode = function(pageNode, cb) {
	if (pageNode !== null) {
		cypher.updatePageNode(pageNode, false, cb);
	} else {
		cb({'error':'pageNode required'});
	}
};

var updateEdge = function(edge, cb) {
	if (edge !== null) {
		cypher.updateEdge(edge, false, cb);
	} else {
		cb({'error':'edge required'});
	}
};

var getPageNode = function(url, cb) {
	if (url !== null) {
		cypher.getPageNodeByUrl(url, cb);
	} else {
		cb({'error':'url required'});
	}
};

var getEdge = function(fromURL, toURL, cb) {
	if (fromURL !== null && toURL != null) {
		cypher.getEdgeByUrls(toURL, fromURL, cb);
	} else {
		cb({'error':'fromURL and toURL required'});
	}
};

var visitPageNode = function(pageNode, cb) {
	if (pageNode !== null) {
		var doesPageNodeExistCallback = function(responseNode) {
			if (responseNode !== null) {
				cypher.updatePageNode(pageNode, true, cb);
			} else {
				cypher.createPageNode(pageNode, true, cb);
			}
		};
		cypher.getPageNodeByUrl(pageNode.url, doesPageNodeExistCallback);
	} else {
		cb({'error':'pageNode required'});
	}
};

var visitEdge = function(edge, cb) {
	if (edge !== null) {
		var doesEdgeExistCallback = function(responseEdge) {
			if (responseEdge !== null) {
				cypher.updateEdge(edge, true, cb);
			} else {
				var getPageNodeCallback = function (pageNode) {
					if (pageNode !== null) {
						cypher.createEdge(edge, true, cb);
					} else {
						var toNode = new page.PageNode(edge.toURL);
						cypher.createPageNode(toNode, false, function() {
							cypher.createEdge(edge, true, cb);
						});
					}
				};
				cypher.getPageNodeByUrl(edge.toURL, getPageNodeCallback);
			}
		};
		cypher.getEdgeByUrls(edge.toURL, edge.fromURL, doesEdgeExistCallback);
	} else {
		cb({'error':'edge required'});
	}
};

module.exports = {
	'getGraph': getGraph,
	'createPageNode': createPageNode,
	'createEdge': createEdge,
	'updatePageNode': updatePageNode,
	'updateEdge': updateEdge,
	'getPageNode': getPageNode,
	'getEdge': getEdge,
	'visitPageNode': visitPageNode,
	'visitEdge': visitEdge,
};

