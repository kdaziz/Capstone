/**
  server.js
  Author: Kevin Aziz (kdaziz@syr.edu)
  This is the backend server used for the api endpoints.
  */
'use strict';


var require = require || null;

// Imports
var api = require('./api.js'),
    express = require('express'),
    bodyParser = require('body-parser');

/**
  Spins up the local server. Run by calling "node server.js"
  */
var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin");
  next();
});

app.use(bodyParser.json());

app.get('/api/graph', function(req,res) {
  api.getGraph(writeResponseCB(res));
});

app.get('/api/getPageNode', function(req,res) {
  	api.getPageNode(req.query.url, writeResponseCB(res));
});

app.get('/api/getEdge', function(req,res) {
  	api.getEdge(req.query.fromURL, req.query.toURL, writeResponseCB(res));
});

app.post('/api/visitPageNode', function(req,res) {
  	api.visitPageNode(req.body, writeResponseCB(res));
});

app.post('/api/visitEdge', function(req,res) {
  	api.visitEdge(req.body, writeResponseCB(res));
});

app.listen(8080, '127.0.0.1');
console.log('Server running at http://127.0.0.1:8080/');




var writeResponse = function(res, msg) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
  	res.end(JSON.stringify(msg));
};

var writeResponseCB = function (res) {
	return function(msg) {
		writeResponse(res, msg);
	};
};