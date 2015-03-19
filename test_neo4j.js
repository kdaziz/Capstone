function Node(url) {
	var node;
	node.visited = false;
	node.url = url;
	node.links = [];
	node.title = "";
	node.category = "";
	node.keywords = [];
	node.count = 0;
	return node;
}

function Edge(toURL, fromURL, context, title) {
	var edge;
	edge.followed = false;
	edge.context = "";
	edge.title = "";
	edge.toURL = toURL;
	edge.fromURL = fromURL;
	edge.count = 0;
	return edge;
}

cypher = {}

// the callback function must take the XMLHttpRequest object as a param
// and check within in the callback for the readyState/status
cypher.query = function(queryString, callback, params) {
	var request = new XMLHttpRequest();
	var url = "http://localhost:7474/db/data/transaction/commit";
	request.open("POST", url, true);
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			callback(JSON.parse(request.response));
		}
	};
	message = JSON.stringify(
		{'statements': [{
			'statement': queryString,
			'parameters': params
		}]}
	);
	request.send(message);
}

// the callback function should take a pageNode as a param
cypher.getSinglePage = function(pageNode, callback) {
    var queryString = "MATCH (n:Page) WHERE n.uid = '" + pageNode.uid + "' RETURN n";
    cypher.query(queryString, callback);
}

cypher.updateSinglePage = function(pageNode, callback) {
	var matchNode = "MATCH (n:Page) WHERE n.uid = '" + pageNode.uid + "'"
	var setValueStrings = []
	for (var i in pageNode) {
		setValueStrings.push("n." + i + " = {" + i + "}");
	}
	var setValue = "SET " + setValueStrings.join(", ");
	var query = matchNode + " " + setValue + " RETURN n";
	cypher.query(query, callback, pageNode);
}

var printSingleNode = function(response){
	document.body.innerHTML = JSON.stringify(response.results[0].data[0].row[0]);
}

cypher.createNode = function(node, callback) {
	var queryString = "MATCH (u:UIDSEED)" +
	 				  "SET u.prefix = (CASE u.index WHEN 9999 THEN (u.prefix+1) ELSE u.prefix END)" +
	 				  "SET u.index = (CASE u.index WHEN 9999 THEN 0 ELSE (u.index+1) END)" +
	 				  "RETURN u";
	cb = function(response) {
		var u = response.results[0].data[0].row[0];
		var uid = u.prefix + "x" + u.index;
		node.uid = uid;
		var setValueStrings = [];
		for (var i in node) {
			setValueStrings.push(i + ":{" + i + "}");
		}
		var createQuery = "CREATE (n:Page {" + setValueStrings.join(", ") + "}) RETURN n";
		cypher.query(createQuery, callback, node)
	}
	cypher.query(queryString, cb);
}

var testNode = {'url':'www.google.com', 'first':'kevin', 'last':'aziz'};
testCallback = function(response) {
	var node = response.results[0].data[0].row[0];
	node.count++;
	cypher.updateSinglePage(node, printSingleNode);
}

// cypher.getSinglePage(testNode, testCallback);
cypher.createNode(testNode, printSingleNode);

cypher.createValueString = function(obj, prefix) {
	var setValueStrings = [];
	for (var i in obj) {
		setValueStrings.push(prefix ? "n." : "" + i + " = {" + i + "}");
	}
	return setValueStrings.join(", ");

}