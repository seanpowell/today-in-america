#!/bin/env node
var express = require('express');
var pmongo  = require('promised-mongo');
var fs      = require('fs');

var TodayInAmerica = function() {
    var self = this;

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.serverPort   = process.env.OPENSHIFT_NODEJS_PORT     || 8080;
        self.serverIP     = process.env.OPENSHIFT_NODEJS_IP;

        self.mongoHost    = process.env.OPENSHIFT_MONGODB_DB_HOST;
        self.mongoPort    = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
        self.mongoUser    = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
        self.mongoPass    = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

        if (typeof self.mongoHost === "undefined") {
            self.mongoCS  = 'mongodb://localhost:' + self.mongoPort + '/tia';
        } else {
            self.mongoCS  = 'mongodb://' + self.mongoUser + ':' + self.mongoPass + '@' + self.mongoHost + ':' + self.mongoPort + '/tia';
        }

        if (typeof self.serverIP === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.serverIP = "127.0.0.1";
        };
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
           process.exit(1);
        }

        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/db'] = function(request, response) {
            console.log(self.mongoCS);

			_pmongo = pmongo(self.mongoCS);
			_pmongo.collection('users').find({ })
				.then(function(users) {
					//response.render('pages/db', { results: [{ 'id': 'test1', 'name': 'name1' }, { 'id': 'test2', 'name': 'name2' }] } );
					response.render('pages/db', { results: users } );
				})
				.catch(function(err) {
					response.render('pages/error', { error: { 'errorCode': '1', 'errorMessage': err.message } } );
				});
        };

        self.routes['/'] = function(request, response) {
        	response.setHeader('Content-Type', 'text/html');
		    response.render('pages/index');
		};

        /*self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            console.log('rendering body');
            res.send('<html><body>adasdas</body></html>');
        };*/
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();//express.createServer();
        console.log('initializing the server');

        //self.app.set('port', serverPort);
		self.app.use(express.static(__dirname + '/public'));
		self.app.set('views', __dirname + '/views');
		self.app.set('view engine', 'ejs');

        console.log('adding routes');
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        self.app.listen(self.serverPort, self.serverIP, function() {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), self.serverIP, self.serverPort);
        });
    };

};

/**
 *  main():  Main code.
 */
var tia = new TodayInAmerica();
tia.initialize();
tia.start();