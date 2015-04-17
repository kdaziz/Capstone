// cypher.js
/*
CYPHER - For interacting with Neo4j graph database where the user's graph is stored.
User must have a local instance of Neo4j running on port 7474
*/

"use strict";
var module = module || {};
var require = require || {};

var request = require("request");

// the callback function must take the XMLHttpRequest object as a param
// and check within in the callback for the readyState/status
var query = function(queryString, callback, params) {
	var cb = function (err, httpResponse, body) {
		callback(JSON.parse(body));
	};
	var req = {
		"headers": {"Content-Type": "application/json;charset=UTF-8"},
		"url": "http://localhost:7474/db/data/transaction/commit",
		"body": JSON.stringify({"statements": [{
			"statement": queryString,
			"parameters": params
		}]})
	};
	request.post(req, cb);
};

var getGraph = function(callback) {
	var queryString = "match (p:Page) optional match path = (p1:Page)-[]-(p2:Page) where p1.visitCount>0" +
	    " unwind nodes(path) as n unwind rels(path) as r" +
		" return {nodes: collect(distinct p), " +
		" links: collect(DISTINCT {source: startNode(r).url, target: endNode(r).url, visitCount: r.visitCount})}";
	query(queryString, callback);
}

var updatePageNode = function(pageNode, visit, callback) {
	var visitCount = visit ? "n.visitCount+1" : "n.visitCount";
	var matchNode = "MATCH (n:Page) WHERE n.url = {url} " +
	                "SET n.title = {title}, n.visitCount = " + visitCount +
	                " RETURN n";

	query(matchNode, callback, pageNode);
};

var createPageNode = function(pageNode, visit, callback) {
	pageNode.visitCount = visit ? 1 : 0;
	var createQuery = "CREATE (n:Page {url:{url}, title:{title}, visitCount:{visitCount}}) RETURN n";
	
	query(createQuery, callback, pageNode);
};

// Accepts {String} nodeUrl
// Callback should take in parameter {PageNode} node
// Callback paremeter will be null if node does not exist
var getPageNodeByUrl = function(url, callback) {
	var queryString = "MATCH (n:Page) WHERE n.url = {url} RETURN n";
	var  cb = function(response) {
		if (response.results !== null && response.results.length > 0 && response.results[0].data.length > 0) {
			callback(response.results[0].data[0].row[0]);
		} else {
			callback(null);
		}
	};
	query(queryString, cb, {"url":url});
};

var getEdgeByUrls = function(toURL, fromURL, callback) {
	var queryString = "MATCH (n1:Page)-[e]->(n2:Page) WHERE n1.url = {fromURL}, n2.url = {toURL} RETURN e";
	var cb = function(response) {
		if (response.results !== null && response.results.length > 0  && response.results[0].data.length > 0) {
			callback(response.results[0].data[0].row[0]);
		} else {
			callback(null);
		}
	};
	query(queryString, cb, {"fromURL":fromURL, "toURL":toURL});
};

var createEdge = function(edge, visit, callback) {
	edge.visitCount = visit ? 1 : 0; 
	var queryString = "MATCH (n1:Page) WHERE n1.url = {fromURL} MATCH (n2:Page) WHERE n2.url = {toURL} " +
					  "CREATE (n1)-[e:LINK {title:{title}, context:{context}, visitCount:{visitCount}}]->(n2) " +
					  "RETURN e";
	query(queryString, callback, edge);

};

var updateEdge = function(edge, visit, callback) {
	var visitCount = visit ? ", e.visitCount = e.visitCount+1" : "";
	var queryString = "MATCH (n1:Page)-[e]->(n2:Page) WHERE n1.url = {fromURL}, n2.url = {toURL} " +
					  "SET e.title = {title}, e.context = {context}" + visitCount +
					  " RETURN e";
	query(queryString, callback, edge);
};


module.exports = {
	getGraph: getGraph,
	getPageNodeByUrl: getPageNodeByUrl,
	createPageNode: createPageNode,
	updatePageNode: updatePageNode,
	getEdgeByUrls: getEdgeByUrls,
	createEdge: createEdge,
	updateEdge: updateEdge,
};