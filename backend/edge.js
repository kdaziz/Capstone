// edge.js

'use strict';
var module = module || {};

var Edge = function(fromURL, toURL, context, title, count) {
	var edge = {};
	edge.context = context;
	edge.title = title;
	edge.toURL = toURL;
	edge.fromURL = fromURL;
	edge.count = count;
	return edge;
};

module.exports = {
	'Edge':Edge,
};