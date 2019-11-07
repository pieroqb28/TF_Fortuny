/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var UsuarioGrupoAprobacionController     = require('../controller/UsuarioGrupoAprobacionController');
module.exports = function () {
		function eliminarGrupo(paramId,callback){
			var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;
				grupoAprobacionConstructor.get(paramId, function (err, objeto) {
					if (err){
						 callback(500,{err: 'err'});
					}else if (objeto){
						objeto.remove(function (err) {
					        if (err){
					        	
					        	 callback(500,{err: 'ERROR'});
							}else{
							 	 callback(200);
							}
					    });
					}else{
						 callback(404, {err:"NO EXISTE GRUPO"});
				}
			});
	   		
	};

	return{

		get: function(tenantId,cb) {

			global.db.driver.execQuery(
			"SELECT grupo.id idGrupo,tipoAprobacion.id idTipo,grupo.nombre nombreGrupo,tipoAprobacion.nombre nombreTipo, orden FROM grupo_aprobacion as grupo INNER JOIN tipo_aprobacion as tipoAprobacion ON grupo.tipo_aprobacion_id=tipoAprobacion.id;",
			[],
			 function (err, listGrups) { 
			 	
				if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
				}else{
					if(listGrups){
						cb(200,listGrups);
					}else{
					 	cb(500,{message: 'NO EXISTEN GRUPOS'});
					}
				}

			});
		},
		getById: function(tenantId,idGrupo,cb) {
		
				 var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;
				 grupoAprobacionConstructor.find({ id:idGrupo}, function (err, grupoDatos) {
		    		if(err){
						cb(500,{message: 'ERROR EN EL SERVICIO'});
					}else{
						if(grupoDatos){

						/*	db.driver.execQuery(
								"SELECT ug.usuario_id, u.codigo, u.nombres, u.apellidos, ug.fecha_inicio, ug.fecha_fin "
								+ "FROM hs_usuario_x_grupo_aprobacion ug"
								+ " INNER JOIN hs_usuario u ON ug.usuario_id = u.id"
								+ " WHERE ug.grupo_id = ?;",
								[idGrupo],
								function (err, listObjDetails) {
									if(err){
									}else{
										if(listObjDetails && listObjDetails != ""){
											grupoDatos.usuarios = listObjDetails
										}
									}
									cb(200,listObjDetails);
								}
							);*/
							cb(200,grupoDatos);
						}else{
						 	cb(500,{message: 'NO EXISTE GRUPO'});
						}
					}	  
			     });
		},

		update: function(tenantId,userid,idGrupo,objUpd,cb) {

				var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;

				grupoAprobacionConstructor.get(idGrupo, function (err, objeto) {
				    objeto.nombre = objUpd.nombre;
				    objeto.tipo_aprobacion_id = objUpd.tipo_aprobacion_id;
				    objeto.fecha_modificacion=new Date();
				    objeto.usuario_modificacion=userid;
				    objeto.orden = objUpd.orden;
				    objeto.save(function (err) {
				         if (err){
				   	  	 return cb(500,{err: err});
					   	  }else{

					   	  	var usuarioGrupoConstructor = global.db.models.hs_usuario_x_grupo_aprobacion;
                            usuarioGrupoConstructor.find({grupo_id: idGrupo}).remove(function(err){

                                if (err){
                                    cb(500,{err: err});
                                }else{


                                	if(objUpd.usuarioGruposAsignados.length>0)
					    			{
					    				var enviarUsuarioGrupo=[]
					    				for(i=0;i<objUpd.usuarioGruposAsignados.length;i++)
									 	{	var objetoGrupos={}
									 		
									 		objetoGrupos.usuario_id=objUpd.usuarioGruposAsignados[i].id
									 		objetoGrupos.grupo_id=idGrupo
									 		objetoGrupos.fecha_inicio=objUpd.usuarioGruposAsignados[i].fecha_inicio
									 		objetoGrupos.fecha_fin=objUpd.usuarioGruposAsignados[i].fecha_fin
									 		objetoGrupos.fecha_modificacion=new Date()
									 		objetoGrupos.usuario_modificacion=userid
									 		enviarUsuarioGrupo.push(objetoGrupos)
										}
						    			UsuarioGrupoAprobacionController().create(tenantId,userid,enviarUsuarioGrupo,function(result){
						    				cb(200,{});
						    			})
					    			}
					    			else
					    			{
					    				cb(200,{});
					    			}



                                }
                            })


					   	  }
				    });
				});
				
			
		},


		create: function(tenandId,userid,params,cb) {

		    if (!(params.nombre && params.tipo_aprobacion_id)){
		    	cb(500,{message: 'FALTAN CAMPOS'});
		    }else{
		    	
		    	var grupoAprobacionConstructor = global.db.models.grupo_aprobacion;

				grupoAprobacionConstructor.create({ 
					nombre: params.nombre,
					tipo_aprobacion_id: params.tipo_aprobacion_id,
					orden:params.orden,
					permitir_notificaciones: params.permitir_notificaciones,
					usuario_creacion: userid,
					fecha_creacion:new Date()
				},function (err, grupoCreado) {

			    	if(err){
			    		cb(500,{message: err});
			    	}else{
			    		if(grupoCreado){
			    					    			
			    		
			    			if(params.usuarioGruposAsignados.length>0)
			    			{
			    				var enviarUsuarioGrupo=[]
			    				for(i=0;i<params.usuarioGruposAsignados.length;i++)
							 	{	var objetoGrupos={}
							 		
							 		objetoGrupos.usuario_id=params.usuarioGruposAsignados[i].id
							 		objetoGrupos.grupo_id=grupoCreado.id
							 		objetoGrupos.fecha_inicio=params.usuarioGruposAsignados[i].fecha_inicio
							 		objetoGrupos.fecha_fin=params.usuarioGruposAsignados[i].fecha_fin
							 		objetoGrupos.fecha_creacion=new Date()
							 		objetoGrupos.usuario_creacion=userid
							 		enviarUsuarioGrupo.push(objetoGrupos)
								}
				    			UsuarioGrupoAprobacionController().create(tenandId,userid,enviarUsuarioGrupo,function(result){
				    				cb(200,{});
				    			})
			    			}
			    			else
			    			{
			    				cb(200,{});
			    			}
			    			
						}else{
							cb(500,{message: 'NOT CREATED'});
						}
			    	}

				});

		    }
		},

		delete:function(tenantId,paramId,cb){
	
			var usuarioGrupoConstructor = global.db.models.hs_usuario_x_grupo_aprobacion;
				usuarioGrupoConstructor.find({grupo_id: paramId}).remove(function(err, objeto){
			    	if (err){
					 cb(500,{err: 'err'});
					}else{
								eliminarGrupo(paramId,function(callback){
									
									if(callback==200)
									{
										cb(200,'Grupo Elminado')
									}else
									{
										cb(500,{err: 'ERROR'});
									}
								});
					}
			     });

		
		}
	}
};
