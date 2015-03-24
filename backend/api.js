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

var createPageNode = function(body, cb) {
	cb(JSON.stringify(body));
};

var createEdge = function(body, cb) {
	cb(JSON.stringify(body));
};

var updatePageNode = function(body, cb) {
	cb(JSON.stringify(body));
};

var updateEdge = function(body, cb) {
	cb(JSON.stringify(body));
};

var getPageNode = function(body, cb) {
	cb(JSON.stringify(body));
};

var getEdge = function(body, cb) {
	cb(JSON.stringify(body));
};

module.exports = {
	'createPageNode': createPageNode,
	'createEdge': createEdge,
	'updatePageNode': updatePageNode,
	'updateEdge': updateEdge,
	'getPageNode': getPageNode,
	'getEdge': getEdge,
};

