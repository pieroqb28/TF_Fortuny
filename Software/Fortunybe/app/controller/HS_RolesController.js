/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var hashIterations = 10000;
var crypto = require('crypto');
var generatePassword = require('password-generator');
var nodemailer = require('nodemailer');

var HS_Usuario     = require('../models/HS_Usuario');
var HS_AutenticarController  = require('../controller/HS_AutenticarController');

var jwt = require('jsonwebtoken');
var secretKey = 'Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=';


module.exports = function () {

return{

	   getAll: function(cb) { 

	   		var rolesUsuario = global.db.models.hs_roles;

			rolesUsuario.find({},function(err, listUsers){
				if(err){
					cb(500,{message: err});
				}else if(listUsers){

					 cb(200,listUsers);
				}else{

				 	 cb(500,{message: 'NOT FOUND'});
				}
			});
	   }

}
};

