/**
 * HS_Imagenes.js
 *
 * @description :: Server-side logic for managing CxCPagoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');

module.exports = function (app) {

app.route('/serv/img/:name')
	 .get(function(req, res) {
	 	fs.readFile('./app/images/' + req.params.name + '.png', function(err, data){
			 if (!err){
			 res.writeHead(200, {'Content-Type': 'image/png' });
     	 	 res.end(data, 'binary');
     	 	}else{
     	 			 res.status(400).json('Not Found');
     	 	}
		});
	 	

	 	 
	 })
;




}