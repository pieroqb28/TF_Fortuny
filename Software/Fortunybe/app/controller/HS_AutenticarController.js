/**
 * HS_AutenticarController
 *
 * @description :: Server-side logic for managing Hs_autenticars
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var http = require('https');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var pbkdf2 = require('pbkdf2');
var secretKey = 'Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=';
var secretHiddenKey = 'JzKa0t2ri9v28e5J5J4PkEO88YQkIE0O+ZoYBnUHmHga8/o/IduvU/Tht70iE=';
var hashIterations = 10000;
var HS_UsuarioBloqueoController     = require('../controller/HS_UsuarioBloqueoController');




 var HS_Token     = require('../models/HS_Token');

module.exports =  function(){
	
	function validateStatusUser(idUsuario,estado,horaBloqueo,cantidadMinBloqueo){

		if(estado=='H')
		{
			return true
		}
		else if (estado=='BIT'){
					var horaBloqueoDato=new Date(horaBloqueo)					
					new Date(horaBloqueoDato.setTime(parseInt(horaBloqueoDato.getTime()+(60000*cantidadMinBloqueo))))
					if(horaBloqueoDato >= new Date())
					{	
						return false
					
					}
					else
					{
											
						return true
					}

				}
				else
				{
					return false
				}


	}
	function validatePassPriv(password,salt, hashedPass){

	   		var testHash =  crypto.pbkdf2Sync(password, salt, hashIterations, 20, 'sha256') 	   		
			var bool = testHash.toString('hex')==  hashedPass? true : false ;
			return bool;
	};
	function createTokenPriv(valor,idUser, tenant,rolId, cb){
	    
	    	crypto.randomBytes(48, function(ex, buf) {
		 	var token = buf.toString('hex');
		
		 	 var tokenConstructor =  global.db.models.hs_token;
		 	 tokenConstructor.create([
			    {
			        idUsuario:idUser, 
					token: token,
					tenant : tenant ,
					idRol:rolId,
					vigente_desde:new Date(),
					vigente_hasta:new Date(Date.now()+86400000*1),
					valorRecuperacion:valor

			    }
			], function (err, items) {
				
				 if(err)  cb({err: err});
				 if(items){
										var jwtTok = jwt.sign({token: token, idUsuario: idUser},secretHiddenKey)
										cb(jwtTok);
									}else{
									 	 cb({err: 'NOT TOKEN'});
									}
				    
				});



			
			});
	};

return{
validatePass : function(password,salt, hashedPass){
	return validatePassPriv(password,salt, hashedPass)
},

  createToken : function(valor,idUser, tenant,rolId, callback){
	//create random token
	 createTokenPriv(valor,idUser, tenant, rolId, function (result){

	 	callback(result);
	 });
	
//use encription to generate token
},

	validarJWT:function(tenandId,valorJWT,cb){

		jwt.verify(valorJWT,secretKey,function(err,verified){
			if(err) {
				cb(500,{err: err});

			}else{
				if(typeof verified != 'undefined'){

					var decoded = jwt.decode(valorJWT)
					
					var RolUsuarioConstructor = global.db.models.hs_roles;
				    var usuarioConstructor = global.db.models.hs_usuario;


					usuarioConstructor.find({codigo: decoded.usuario},function(err, found){
						if(err) {
							cb(500,{err: err});
						}else{

						if(found!=null && found!=""){
							
							if(validateStatusUser(found[0].id,found[0].estado,found[0].hora_bloqueo,found[0].cantidad_min_bloqueado)){
								if(found[0].numIntentos==3 && found[0].estado=="BIT")
								{
									HS_UsuarioBloqueoController().desbloqueoTiempo(found[0].id,function(){
															
									})	
								}
								RolUsuarioConstructor.find({id	:found[0].rol},function(err, foundRol){
									if(err) { return cb(500,{err: err});}

									if(found && found != '' &&foundRol &&foundRol != ''){
										
										if (validatePassPriv(decoded.contrasena,found[0].salt,found[0].password)){
											if(found[0].numIntentos>0)
											{
												HS_UsuarioBloqueoController().desbloqueoUsuario(found[0].id,function(){
					
												})
											}
											createTokenPriv(0,found[0].id,found[0].tenant,foundRol[0].id,function(retToken){
								  		  		tenandId = found[0].tenant;
								  		  		cb(200,{JWT: retToken});
								  		  	});
										}else{
											
											HS_UsuarioBloqueoController().amountIntUser(found[0].id,found[0].tenant,found[0].cantidad_min_bloqueado)
											return cb(401,{err: 'La contraseña es incorrecta,porfavor revisa tus credenciales.'});
										}
									}else{

								 		return cb(401,{err: 'No se ha encontrado un Rol para el usuario.'});
									}
								});
							}
							else
							{
								
										if(found[0].estado=="BI")
										{
								 			 cb(401,{err: 'El usuario esta bloqueado'});
								 		}
								 		if(found[0].estado=="BIT")
								 		{
								 			
								 			var fechaActual=new Date(found[0].hora_bloqueo)								 							
											new Date(fechaActual.setTime(parseInt(fechaActual.getTime()+(60000*found[0].cantidad_min_bloqueado))))
								 			var diff = Math.abs(fechaActual - new Date());								 										 			
								 			var minRestantes= parseInt(diff/60000)
								 			var segRestantes= parseInt((diff-(minRestantes*60000))/1000)>0?parseInt((diff-(minRestantes*60000))/1000).toFixed(0): (parseInt(((diff-(minRestantes*60000))/1000))*-1)
								 			
								 			 cb(401,{err: 'Intentelo nuevamente en '+ minRestantes +' : '+segRestantes +' minutos'});
								 		}
							}
						}
						else
							{cb(401,{err: 'El Usuario no existe, porfavor ingresa un usuario válido'});}

					}



					});
				}else{
					 cb(400,{err: 'No tiene permiso, porfavor ingrese nuevamente'});
				}
			}
		});

	}
};

};