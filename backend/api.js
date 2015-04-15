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

var createPageNode = function(body, cb) {
	visit = visit || false;
	// If the page node exists,
	// update page node contents with contents of pagenode in body
	// else create a new page node
	if (body.pageNode !== null) {
		var doesPageNodeExistCallback = function(pageNode) {
			if (pageNode !== null) {
				cypher.updatePageNode(body.pageNode, visit, cb);
			} else {
				cypher.createPageNode(body.pageNode, visit, cb);
			}
		};
		cypher.getPageNodeByUrl(body.pageNode.url, doesPageNodeExistCallback);
	} else {
		cb({'error':'pageNode required'});
	}
};

var createEdge = function(body, cb) {
	if (pageNode)
};

var updatePageNode = function(body, cb, visit) {
	visit = visit || false;
	// If the page node exists,
	// update page node contents with contents of pagenode in body
	// else create a new page node
	if (body.pageNode !== null) {
		var doesPageNodeExistCallback = function(pageNode) {
			if (pageNode !== null) {
				cypher.updatePageNode(body.pageNode, visit, cb);
			} else {
				cypher.createPageNode(body.pageNode, visit, cb);
			}
		};
		cypher.getPageNodeByUrl(body.pageNode.url, doesPageNodeExistCallback);
	} else {
		cb({'error':'pageNode required'});
	}
};

var updateEdge = function(body, cb, visit) {
	visit = visit || false;
	// If the edge exists
	// update edge contents
	// else create a new edge
	if (body.edge !== null) {
		var doesEdgeExistCallback = function(edge) {
			if (edge !== null) {
				cypher.updateEdge(body.edge, true, cb);
			} else {
				var getPageNodeCallback = function (pageNode) {
					if (pageNode !== null) {
						cypher.createEdge(body.edge, visit, cb);
					} else {
						var toNode = new page.PageNode(body.edge.toURL);
						cypher.createPageNode(toNode, false, function() {
							cypher.createEdge(body.edge, visit, cb);
						});
					}
				};
				cypher.getPageNodeByUrl(body.edge.toURL, getPageNodeCallback);
			}
		};
		cypher.getEdgeByUrls(body.edge.toURL, body.edge.fromURL, doesEdgeExistCallback);
	} else {
		cb({'error':'edge required'});
	}
};

var getPageNode = function(body, cb) {
	if (body.url !== null) {
		cypher.getPageNodeByUrl(body.url, cb);
	} else {
		cb({'error':'url required'});
	}
};

var getEdge = function(body, cb) {
	if (body.fromURL !== null && body.toURL != null) {
		cypher.getEdgeByUrls(body.toURL, body.fromURL, cb);
	} else {
		cb({'error':'fromURL and toURL required'});
	}
};-

var visitPageNode = function(body, cb) {
	updatePageNode(body, cb, true);
};

var visitEdge = function(body, cb) {
	updateEdge(body, cb, true);
};

module.exports = {
	'createPageNode': createPageNode,
	'createEdge': createEdge,
	'updatePageNode': updatePageNode,
	'updateEdge': updateEdge,
	'getPageNode': getPageNode,
	'getEdge': getEdge,
	'visitPageNode': visitPageNode,
	'visitEdge': visitEdge,
};

