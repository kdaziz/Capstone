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
app.use(bodyParser.json());

app.post('/api/createPageNode', function(req,res) {
  	api.createPageNode(req.body, writeResponseCB(res));
});

app.post('/api/createEdge', function(req,res) {
  	api.createEdge(req.body, writeResponseCB(res));
});

app.post('/api/updatePageNode', function(req,res) {
  	api.updatePageNode(req.body, writeResponseCB(res));
});

app.post('/api/updateEdge', function(req,res) {
  	api.updateEdge(req.body, writeResponseCB(res));
});

app.post('/api/getPageNode', function(req,res) {
  	api.getPageNode(req.body, writeResponseCB(res));
});

app.post('/api/getEdge', function(req,res) {
  	api.getEdge(req.body, writeResponseCB(res));
});

app.listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');




var writeResponse = function(res, msg) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
  	res.end(msg);
};

var writeResponseCB = function (res) {
	return function(msg) {
		writeResponse(res, msg);
	};
};