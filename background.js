/*
  Browsing Graph Extension - Honors Capstone
  background.js
  Author: Kevin Aziz (kdaziz7@gmail.com)
*/
"use strict";
var __RECORDING_ACTIVE__ = true;//false;
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

function messageListener(m) {
	if (__RECORDING_ACTIVE__) {
		if (m.type == "pageload") {
			debug("PAGELOAD");
			var createEdge = function(edge) {
				return function() { 
					debug("On Pageload, edge doesn't exist");
					cypher.createEdge(edge);
				};
			};
			var success = function(link) {
				var e = {};
				e.toURL = link.href;
				e.fromURL = m.url;
				e.title = link.title;
				e.context = link.innerHTML;
				return function() { 
					debug("On Pageload, neighboring node exists");
					cypher.doesEdgeExist(e, null, createEdge(e));
				};
			};
			var failure = function(link) {
				debug(link);
				var node = new PageNode(link.href);
				var edge = new Edge(m.url, link.href, link.innerHTML, link.title);
				return function() { 
					debug("On Pageload, neighboring node doesn't exist");
					cypher.createNodeWithEdge(node, edge);
				};
			};
			var afterPageNodeUpdate = function() {
				//debug("Iterating on m.links");
				//for (var l in m.links) {
				//	var link = m.links[l];
				//	cypher.doesNodeExist(link.href, success(link), failure(link));
				//}
			};
			onPageLoad(m.url, m.title, afterPageNodeUpdate);//createUpdateNode(m.url, m.title, m.links);
		} else if (m.type == "linkclicked") {
			var edge = {};
			edge.fromURL = m.from;
			edge.toURL = m.to;
			edge.title = m.title;
			edge.context = m.context;
			edge.followed = true;
			var success = function() {
					cypher.doesEdgeExist(
						edge,
						function() { updateEdge(edge); },
						function() { debug("creating edge"); createEdge(edge); });
			};
			var failure = function(link) {
				var node = {};
				node.url = link;
				return function() {
					debug("creating node with edge");
					cypher.createNodeWithEdge(node, edge);
				};
			};
			cypher.doesNodeExist(m.to, success, failure(m.to));
			//cypher.updateEdge(edge);
		} 
	}
}

/**
	Called when the background script receives an extension message
	from the content script on page load.
	
	First, it checks if a node exists for the page, updating a node 
	in the case that it does, and creating a node in the case that it doesnt.
	Then it calls _______ to create/update nodes/edges for each URL on the page.
*/
function onPageLoad(url, title, callback) {
	var increaseNodeCount = function() {
		var query = "match (n:Page) where n.url = {url} set n.count=n.count+1 return n";
		cypher.query(query, callback, {"url":url});
	};
	var createNode = function() {
		cypher.createNode(new PageNode(url, title));
	};
	cypher.doesNodeExist(url, increaseNodeCount, createNode);
}

function visitNode(from, to, context, title) {
	var e = new Edge(from, to, context, title);
	cypher.addVisit(e, printSingleNode);
}

var PageNode = function(url, title) {
	var node = {};
	node.visited = false;
	node.url = url;
	node.links = [];
	node.title = title || "";
	node.category = "";
	node.keywords = [];
	node.count = 0;
	return node;
};

var Edge = function(fromURL, toURL, context, title) {
	var edge = {};
	edge.followed = false;
	edge.context = context;
	edge.title = title;
	edge.toURL = toURL;
	edge.fromURL = fromURL;
	edge.count = 0;
	return edge;
};








/*
CYPHER - For interacting with Neo4j graph database where the user's graph is stored.
User must have a local instance of Neo4j running on port 7474
*/


var cypher = {};

// the callback function must take the XMLHttpRequest object as a param
// and check within in the callback for the readyState/status
cypher.query = function(queryString, callback, params) {
	var cb = callback || function () {};
	var request = new XMLHttpRequest();
	var url = "http://localhost:7474/db/data/transaction/commit";
	request.open("POST", url, true);
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			cb(JSON.parse(request.response));
		}
	};
	var message = JSON.stringify(
		{"statements": [{
			"statement": queryString,
			"parameters": params
		}]}
	);
	request.send(message);
};

// the callback function should take a pageNode as a param
cypher.getSinglePageByUid = function(pageNode, callback) {
    var queryString = "MATCH (n:Page) WHERE n.uid = '" + pageNode.uid + "' RETURN n";
    cypher.query(queryString, callback);
};

cypher.updateSinglePage = function(pageNode, callback) {
	var matchNode = "MATCH (n:Page) WHERE n.uid = '" + pageNode.uid + "'";
	var setValueStrings = [];
	for (var i in pageNode) {
		setValueStrings.push("n." + i + " = {" + i + "}");
	}
	var setValue = "SET " + setValueStrings.join(", ");
	var query = matchNode + " " + setValue + " RETURN n";
	cypher.query(query, callback, pageNode);
};

var printSingleNode = function(response){
	document.body.innerHTML = JSON.stringify(response.results[0].data[0].row[0]);
};

cypher.createNodeWithEdge = function(node, edge, callback) {
	callback = callback || function() {};
	var queryString = "MATCH (u:UIDSEED)" +
	 				  "SET u.prefix = (CASE u.index WHEN 9999 THEN (u.prefix+1) ELSE u.prefix END)" +
	 				  "SET u.index = (CASE u.index WHEN 9999 THEN 0 ELSE (u.index+1) END)" +
	 				  "RETURN u";
	var cb = function(response) {
		var u = response.results[0].data[0].row[0];
		var uid = u.prefix + "x" + u.index;
		node.uid = uid;
		
		var createQuery = "MATCH (n1:Page) WHERE n1.url = {fromURL} " +
						  "CREATE (n2:Page { node }) " +
						  "CREATE (n1)-[e:LINKS_TO { edge }]->(n2) " +
						  "RETURN e, n2";
		var data = {};
		data.fromURL = edge.fromURL;
		data.node = node;
		data.edge = edge;
		cypher.query(createQuery, callback, data);
	};
	cypher.query(queryString, cb);

};

cypher.createNode = function(node, callback) {
	var queryString = "MATCH (u:UIDSEED)" +
	 				  "SET u.prefix = (CASE u.index WHEN 9999 THEN (u.prefix+1) ELSE u.prefix END)" +
	 				  "SET u.index = (CASE u.index WHEN 9999 THEN 0 ELSE (u.index+1) END)" +
	 				  "RETURN u";
	var cb = function(response) {
		var u = response.results[0].data[0].row[0];
		var uid = u.prefix + "x" + u.index;
		node.uid = uid;
		var setValueStrings = [];
		for (var i in node) {
			setValueStrings.push(i + ":{" + i + "}");
		}
		var createQuery = "CREATE (n:Page {" + setValueStrings.join(", ") + "}) RETURN n";
		cypher.query(createQuery, callback, node);
	};
	cypher.query(queryString, cb);
};

cypher.addVisit = function(edge, callback) {
	var queryString = "MATCH (n1:Page)-[e:LINKS_TO]->(n2:Page)" +
					  "WHERE n1.url = {fromURL}, n2.url = {toURL} RETURN e";
	var cb = function(response) {
		var e = response.results[0].data[0].row[0];
		e.history.push(Date.getTime());
		e.count++;
		e.followed = true;
		var query = "MATCH (n1:Page)-[e:LINKS_TO]->(n2:Page)" +
					"WHERE n1.url = {fromURL}, n2.url = {toURL}" +
					"SET e.history={history}, e.count={count}, e.followed={followed}";
		cypher.query(query, callback, e);
	};
	cypher.query(queryString, cb, edge);
};

cypher.doesNodeExist = function(nodeUrl, success, failure) {
	var queryString = "MATCH (n:Page) WHERE n.url = {url} RETURN n";
	var  cb = function(response) {
		if (response.results.length > 0 && response.results[0].data.length > 0) {
			success(response.results[0].data[0].row[0]);
		} else {
			failure();
		}
	};
	cypher.query(queryString, cb, {"url":nodeUrl});
};

cypher.doesEdgeExist = function(fromURL, toURL, success, failure) {
	var queryString = "MATCH (n1:Page)-[e:LINKS_TO]->(n2:Page) WHERE n1.url = {fromURL}, n2.url = {toURL} RETURN e";
	var cb = function(response) {
		if (response.results.length > 0  && response.results[0].data.length > 0) {
			success(response.results[0].data[0].row[0]);
		} else {
			failure();
		}
	};
	cypher.query(queryString, cb, {"fromURL":fromURL, "toURL":toURL});
};

cypher.createEdge = function(edge, callback) {
	callback = callback || function() {};
	edge.count = edge.count > 0 ? edge.count : 0;
	edge.followed = edge.followed || false;
	var setEdgeValueStrings = [];
	for (var i in edge) {
		if (i!="fromURL" && i!="toURL")	setEdgeValueStrings.push(i + ":{" + i + "}");
	}
	var queryString = "MATCH (n1:Page) WHERE n1.url = {fromURL} MATCH (n2:Page) WHERE n2.url = {toURL} " +
					  "CREATE (n1)-[e:LINKS_TO {" + setEdgeValueStrings.join(", ") + "}]->(n2) RETURN e";
	cypher.query(queryString, callback, edge);
};

cypher.updateEdge = function(edge, callback) {
	callback = callback || function() {};
	var setEdgeValueStrings = ["e.count = e.count+1"];
	for (var i in edge) {
		if (i!="fromURL" && i!="toURL")	setEdgeValueStrings.push("e." + i + " = {" + i + "}");
	}
	var queryString = "MATCH (n1:Page)-[e:LINKS_TO]->(n2:Page) WHERE n1.url = {fromURL}, n2.url = {toURL} " +
					  "SET " + setEdgeValueStrings.join(", ") + " RETURN e";
	cypher.query(queryString, callback, edge);
};


// var visitedSites = [];
// chrome.history.onVisited.addListener(onVisit);
// result: HistoryItem
// .url, .title, .lastVisitTime, .visitCount, .typedCount
//function onVisit(result) {
//  if (__RECORDING_ACTIVE__) {
//    visitedSites.push(result);
//  }
//}