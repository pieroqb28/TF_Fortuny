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


	get: function(tenantId,cb) {

		db.driver.execQuery(
                "SELECT id,codigo,nombres,apellidos,correo,telefono,celular,dni,estado,rol,telefono2,sexo,cargo FROM hs_usuario where tenant = ?;",
                [tenantId],
                function (err, listUsers) {
                    if (err) {
                        cb(500, { message: "Existe un error en el Servicio" });
                    } else {						
						cb(200,listUsers);
                    }
                }
            );

	},

	getById:function(tenantId,paramId,cb) {

	 var usuarioConstructor = global.db.models.hs_usuario;

		usuarioConstructor.find({id:paramId},function(err, listUsers){
			if(err){
				cb(500,{message: err});
			}else if(listUsers.length>0){

				 cb(200,listUsers);
			}else{

			 	 cb(404,{message: 'NOT EXISTE USUARIO'});
			}
		});
	},

	 post: function(userid, tenandId,params,hostURL, cb) {

	 		if(params.nombres!="" && params.apellidos!="" && params.correo!="" && params.rol!="")
			{
			 	var usuarioConstructor = global.db.models.hs_usuario;

			 	usuarioConstructor.find({ codigo: params.correo }, function (err, people) {

			 		if(people.length==0)
			 		{

			 			var password = generatePassword();
						//var password = 'holmundo';
						
						var salt = crypto.randomBytes(32);
						var hashpwd =  crypto.pbkdf2Sync(password, salt.toString('hex'), hashIterations, 20, 'sha256');	    

						var usuarioClass = new usuarioConstructor({
							codigo: params.correo,
							password: hashpwd.toString('hex'),
							salt: salt.toString('hex'),
							nombres: params.nombres,
							apellidos: params.apellidos,
							correo: params.correo,
							telefono: params.telefonoContacto,
							celular: params.celular,
							dni: params.DNI,
							rol:params.rol,
							tenant : tenandId ,
							tipo_usuario: 'LOCAL',
							created_by: userid,
							created_date: new Date()
						});

								//enviar correo de inicio
						usuarioClass.save(function (err, createdUser) {

							if(err){

								cb(500,{message: err});
							}else if(createdUser){
								var transporter = nodemailer.createTransport({
								    service: 'Gmail',
								    auth: {
								        user: global.localsemailuser,
								        pass: global.localsemailpass
								    }
								});
								
									var html_email=  '<div style="background: #f0f0f0;font-family: roboto;text-align: center;color: #333333;padding-botton:2em; padding-top:1em">'
												+'	<section style="padding-bottom: 2em;">'
											  	
											  	+'		<div style="width: 70%;margin-left: auto;margin-right: auto;background: white;border-radius: 0.5em;padding-bottom: 3em;">'

											  	+'		 <div style="background-position: center; background-image: url(\'http://' + hostURL + '/img/logoEmpresa.png\');height: 4em; background-size: contain; background-repeat: no-repeat; background-color:#303C49; "  ></div' 
												+'	  		<div style="background-color: #303C49;color: white;height: 3.5em;padding-bottom: 0.5em;">'
												+'				<h2 style="margin-top: 0px;"> Bienvenido</h2>'
																
												+'			</div>'
												+ ' 		<p style=" background-color: #E40045; width: 100%;height: 0.2em;margin-bottom: 0;"></p>'

												+'			<div>'
												+'              <p><strong>'+params.nombres+ '</strong> tus datos de acceso son los siguientes:</p>'
												+'				<p style="border-top: 1px solid #CCCCCC;border-top-style: dashed;padding-top: 1em;"><strong>Usuario: </strong>'+params.correo+'</p>'
												+'				<p><strong>Contraseña: </strong>'+password+'</p>'
												+'			</div>'
										/*		+'			<div style="border-bottom: 1px solid #CCCCCC;border-bottom-style: dashed;border-top: 1px solid #CCCCCC;border-top-style: dashed;margin-top: 1.5em;margin-bottom: 2em;padding-top: 1em;padding-bottom: 1em;">'
												+'				<img src="http://app.pronos.pe/img/logoEmpresa.png" width="150px">' ---- aqui va el gift
												+'			</div>'*/
												+'			<div style="margin-top: 1.5em;">'
												+'				<a href="'+ hostURL +'" style="text-decoration: none;background-color: #333333;color: white;padding-left: 5em;padding-right: 5em;padding-bottom: 0.5em;padding-top: 0.5em;">Comienza Ahora</a>'
												+'			</div>'
														

												+'		</div>'
												+'	</section>'
							
											  +'</div>'
							mailText =  html_email
							htmlmailText = html_email
										  
							
								var mailOptions = {
									    from: 'PRONOS Buy  <'+  global.localsemailuser+ '>', // sender address
									    to: params.correo, // list of receivers
									    subject: 'PRONOS Buy - Nuevo Usuario', // Subject line
									    text:  mailText, // plaintext body
									    html:  htmlmailText // html body
									};

								// send mail with defined transport object
								transporter.sendMail(mailOptions, function(error, info){
								    if(error){
										cb(500,{message: 'NOT EMAILED'});
								    }else{
								    	
								    	cb(200,{id:createdUser.id });
								    }
								});
							}else{
								cb(500,{message: 'NOT CREATED'});
							}
						});
			 		}
			 		else
			 		{
			 			cb(409,{message: 'El correo '+ params.correo + ' ya esta registrado'});
			 		}
			      
			  
			    });
			}
			else
			{
				cb(500,{message: 'NOT PUEDES INGRESAR VALORES EN BLANCO'});
			}

		
	},

	delete: function(tenandId,params,cb) {


		var usuarioConstructor = global.db.models.hs_usuario;

		usuarioConstructor.find({id: params.id,tenant:tenandId}).remove(function(err,result){
	//	usuarioConstructor.findOneAndRemove({id: params.id,tenant:tenandId},function (err){
			if (err){
				cb(400,{message: err});
			}else{
				
				if(result!=undefined)
				{
					cb(200,"DELETED" );
				}
				else
				{
					cb(500,"NO EXISTE USUARIO" );
				}
			}
		});
	},

	put: function(tenandId,userId,paramId,body,cb) { 

			if(body.nombres!="" && body.apellidos!="" && body.correo!="" && body.rol!="")
			{
				var usuarioConstructor = global.db.models.hs_usuario;

	  	   		usuarioConstructor.get(paramId, function (err, obj) {
				  	if (err){			  		
				  	  cb(500,{err: err});
				  	}
				  	else
					{
						
						if(obj)
						{
							obj.nombres= body.nombres,
							obj.apellidos= body.apellidos,
							obj.correo= body.correo,
							obj.telefono= body.telefonoContacto,
							obj.celular= body.celular,
							obj.dni= body.DNI,
							obj.rol=body.rol,


							obj.tenant=tenandId,
							//obj.idUsuario: decoded.idUsuario,
							//obj.token: decoded.token,


		  	 				obj.usuario_modificacion=userId,
							obj.updated_by = userId,
				  	 		obj.updated_date = new Date()

					  	// save the user
						  	obj.save(function(err) {
						   	  if (err)
						   	  { 
						   	   cb(500,{err: err});
						   	  }
						   	  else
						   	  {
								
				  	 			cb(200,{id:obj.id });		  	  	 
						  	  }			  	  
						  	});
						}
						else
						{
							cb(404,{message: 'NO EXISTE USUARIO'});
						}
				  	}
				});		
			}
			else
			{
				cb(500,{message: 'NO PUEDE INGRESAR VALORES EN BLANCO'});
			}	


	  },

	actualizarUsuario: function(userid,tenandId,paramId,body, cb) {

		var usuarioConstructor = global.db.models.hs_usuario;
  	   	usuarioConstructor.findById(paramId, function(err, obj) {
			if (err){
				cb(500,{message: err});
			}else{
				if (obj){
					obj.nombres= body.nombres;
					obj.apellidos= body.apellidos;
					obj.correo= body.correo;
					obj.telefono= body.telefonoContacto;
					obj.celular= body.celular;
					obj.dni= body.DNI;
					obj.rol=body.rol;

					obj.save(function(err) {
				    	if (err){
				    		cb(500,{message: err});
				    	}else{
				    		cb(200,{id:100 });
				    	}
		  			});
				}else{
					cb(500,{message: 'Inv Not Found'});
				}
			}
		  });

	  	},


	
	postChangePswd: function(userid,tenandId,jwtValor,cb) {
   		jwt.verify(jwtValor,secretKey,function(err,verified){

		if(err) {
			
			return cb(500,{message: err});

		}else{

			if(typeof verified != 'undefined'){
				var decoded = jwt.decode(jwtValor)
			    var usuarioConstructor = global.db.models.hs_usuario;
 				usuarioConstructor.find({id: userid},function(err, found){

						if(err)  cb(500,{message: err});
						if(found && found != ''){

							
							if (HS_AutenticarController().validatePass(decoded.claveVieja,found[0].salt,found[0].password)){
									var salt = crypto.randomBytes(32);
									var hashpwd =  crypto.pbkdf2Sync(decoded.claveNueva, salt.toString('hex'), hashIterations, 20, 'sha256');

							

									usuarioConstructor.get(found[0].id, function(err, obj) {
									  if (err)  cb(500,{message: err});
									
									  obj.password = hashpwd.toString('hex');
									  obj.correo=found[0].correo,
						 			  obj.apellidos=found[0].apellidos,
						 			  obj.nombres=found[0].nombres,
						 			  obj.salt=salt.toString('hex'),
									  // save the user
									  obj.save(function(err) {
									    if (err)  cb(500,{message: err});
									      cb(200,{id:100 });
									    
									  });

									});								

									

							}else{
							
							 cb(400,{message: 'Not Found'});

							}


							//callback(jwt.sign({token: token, id: idUser},secretHiddenKey));
						}else{

						 	 cb(500,{message: 'NOT FOUND'});
						}





				});

				//return oK
			}else{		
				 	 cb(401,{message: 'INVALID TOKEN'});
			}

		}



		});
	   },

	   recuperarPswd: function(userid,correoUser,hostUrl, cb) {

		 
		 	if(correoUser != null && correoUser != '')
		 	{
		 	var usuarioConstructor = global.db.models.hs_usuario;
		 	usuarioConstructor.find({codigo: correoUser},function(err, found){
		 		
				if(err) return cb(500,{message: err});
				if(found && found != ''){

					
					HS_AutenticarController().createToken(1,found[0].id,found[0].tenant,found[0].rol, function(retToken){

									var transporter = nodemailer.createTransport({
								    service: 'Gmail',
								    auth: {
								        user: global.localsemailuser,
								        pass: global.localsemailpass
								    }
								});
									var html_email=  '<div style="background: #f0f0f0;font-family: roboto;text-align: center;color: #333333;padding-botton:2em; padding-top:1em">'
												+'	<section style="padding-bottom: 2em;">'
											  	
											  	+'		<div style="width: 70%;margin-left: auto;margin-right: auto;background: white;border-radius: 0.5em;padding-bottom: 3em;">'

											  	+'		 <div style="background-position: center; background-image: url(\'http://' + hostUrl + '/img/logoEmpresa.png\');height: 4em; background-size: contain; background-repeat: no-repeat; background-color:#303C49; "  ></div' 
												+'	  		<div style="background-color: #303C49;color: white;height: 3.5em;padding-bottom: 0.5em;">'
												+'				<h2 style="margin-top: 0px;"> Recuperar Contraseña</h2>'
																
												+'			</div>'
												+ ' 		<p style=" background-color: #E40045; width: 100%;height: 0.2em;margin-bottom: 0;"></p>'
																
												+'			</div>'
												+'			<div style="padding-left: 0.5em;padding-right: 0.5em;">'
												+'              <p><strong>'+found[0].nombres+ '</strong> se ha solicitado la recuperación de tu contraseña, por favor haz click en continuar.</p>'												
												+'			</div>'
									
												+'			<div style="margin-top: 1.5em;">'
												+'				<a href="http://'+ hostUrl +'/#/recuperarClave/nuevaContrasenia/'+retToken+'" style="text-decoration: none;background-color: #333333;color: white;padding-left: 5em;padding-right: 5em;padding-bottom: 0.5em;padding-top: 0.5em;letter-spacing: 1px;">Continuar</a>'
												+'			</div>'
														

												+'		</div>'
												+'	</section>'
							
											  +'</div>'
								mailText = html_email
								htmlmailText = html_email
								



								var mailOptions = {
									    from: 'PRONOS Buy <'+  global.localsemailuser+ '>', // sender address
									    to: correoUser, // list of receivers
									    subject: 'PRONOS Buy - Recuperación de Contraseña', // Subject line
									    text:  mailText, // plaintext body
									    html:  htmlmailText // html body
									};

									// send mail with defined transport object
									transporter.sendMail(mailOptions, function(error, info){
									    if(error){
									    
									        
									        return cb(500,{message: 'NOT EMAILED'});
									    }
									    
									    return cb(200,{id:info.id });
									 

							});
						//	return   return res.status(200).json("OK" );

					});
				
						//	found[0].code
				
								
				
				}else{
					
					return cb(500,{message: 'NOT FOUND'});

				}

			});
			}
			else
			{
				return cb(400,{message: 'INVALID EMAIL'});
			}

	   }, 
	   nuevoPswdRecuperado: function(userId,jwtToken,cb) { 

		 	jwt.verify(jwtToken,secretKey,function(err,verified){
			if(err) {
				
				return cb(500,{message: err});

			}else{
				if(typeof verified != 'undefined'){

					var decoded = jwt.decode(jwtToken)
					//validate user
			


					
				    var usuarioConstructor = global.db.models.hs_usuario;


					usuarioConstructor.find({id: userId},function(err, found){

							if(err) return cb(500,{message: err});
							if(found && found != ''){
									
										var salt = crypto.randomBytes(32);
										var hashpwd =  crypto.pbkdf2Sync(decoded.claveNueva, salt.toString('hex'), hashIterations, 20, 'sha256');

										//usuarioConstructor.find({id: userId},function(err, obj){
									//	usuarioConstructor.findById(userId, function(err, obj) {
										usuarioConstructor.get(userId, function (err, obj) {
										  if (err) return cb(500,{message: err});
										
										  obj.password = hashpwd.toString('hex'),
										  obj.correo=found[0].correo,
							 			  obj.apellidos=found[0].apellidos,
							 			  obj.nombres=found[0].nombres,
							 			  obj.salt=salt.toString('hex'),
										  // save the user
										  obj.save(function(err) {
										    if (err) return cb(500,{message: err});
										  //  return cb(200,{id:info.id });
										  return cb(200,{id:100 });
										    
										  });

										});								

								
							}else{

							 	return cb(400,{message: 'NOT FOUND'});
							}

					});

					//return oK
					}else{
							return cb(500,{message: 'INVALID TOKEN'});						 	
					}

				}



			});
	   },

	   rolesUsuario: function(cb) { 

	   		var rolesUsuario = global.db.models.hs_roles;

			usuarioConstructor.find({},function(err, listUsers){
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

