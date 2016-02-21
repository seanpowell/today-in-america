var express = require('express');
var pmongo  = require('promised-mongo');
var app     = express();

//var mongoUrl   = process.env.OPENSHIFT_MONGODB_DB_URL || 'localhost:27017';

var serverPort = process.env.OPENSHIFT_NODEJS_PORT     || 8080;
var serverIP   = process.env.OPENSHIFT_NODEJS_IP       || '127.0.0.1';

var mongoHost  = process.env.OPENSHIFT_MONGODB_DB_HOST ||  'localhost';
var mongoPort  = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;

var mongoCS    = 'mongodb://admin:EwKhs6iF5ZXD@' + mongoHost + ':' + mongoPort + '/tia';

app.set('port', serverPort);
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    esponse.render('pages/index');
});

app.get('/db', function (request, response) {
	console.log(mongoCS);

	_pmongo = pmongo(mongoCS);
	_pmongo.collection('users').findOne({ })
		.then(function(users) {
			//response.render('pages/db', { results: [{ 'id': 'test1', 'name': 'name1' }, { 'id': 'test2', 'name': 'name2' }] } );
			response.render('pages/db', { results: users } );
		})
		.catch(function(err) {
			response.render('pages/error', { error: { 'errorCode': '1', 'errorMessage': err.message } } );
		});
})

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});