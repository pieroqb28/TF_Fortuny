/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = function () {

	return{

		getByGrupo: function(tenantId,idGrupo,cb) {

			global.db.driver.execQuery(
			"SELECT hs_usuario_x_grupo_aprobacion.fecha_inicio,hs_usuario_x_grupo_aprobacion.fecha_fin,hs_usuario.id,hs_usuario.codigo,hs_usuario.nombres,hs_usuario.apellidos FROM hs_usuario_x_grupo_aprobacion INNER JOIN hs_usuario ON hs_usuario_x_grupo_aprobacion.usuario_id=hs_usuario.id where hs_usuario_x_grupo_aprobacion.grupo_id=?;",
			[idGrupo],
			 function (err, listGrups) { 
			 	
				if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
				}else{
					if(listGrups){

						cb(200,listGrups);
					}else{
					 	cb(401,{message: 'NO EXISTEN DATOS DE TEXTO PARA COTIZACIONES'});
					}
				}

			});
		},
		/*getById: function(tenantId,idGrupo,cb) {
		
				 var grupoAprobacionConstructor = global.db.models.texto_cotizacion;
				 grupoAprobacionConstructor.find({ id:idGrupo}, function (err, grupoDatos) {
			    		if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
					}else{

						if(grupoDatos.length>0){
							cb(200,grupoDatos);
						}else{
						 	cb(404,{message: 'NO EXISTEN DATOS DE TEXTO PARA COTIZACIONES'});
						}
					}	  
			     });
		},*/

		/*update: function(tenantId,userid,idGrupo,objUpd,cb) {
				var grupoAprobacionConstructor = global.db.models.texto_cotizacion;
				
				grupoAprobacionConstructor.get(idGrupo, function (err, objeto) {

					if(objeto)
					{
					    objeto.nombre = objUpd.nombre;
					    objeto.texto = objUpd.texto;
					    objeto.categoria_id = objUpd.categoria_id;
					  
					    objeto.save(function (err,objeto) {

					        if (err){
					   	  	 return cb(500,{err: err});
						   	  }else{
						   	  	 cb(200,{id:100});
						   	  }
					    });
					}
					else
					{
						return cb(404,{err: "NO EXISTE PARÁMETRO"});
					}

				});

			
		},*/


		create: function(tenandId,userid,body,cb) {


		    	var usuarioGrupoConstructor = global.db.models.hs_usuario_x_grupo_aprobacion;

				usuarioGrupoConstructor.create(body,function (err, grupoUsuarioCreado) {

			    	if(err){
			    		
			    		cb(500,{message: err});
			    	}else{
			    		cb(200,{id:grupoUsuarioCreado.id });

			    	}

				});

		},

		/*delete:function(tenantId,paramId,cb){
			

			var textoCotizacionConstructor = global.db.models.texto_cotizacion;

			textoCotizacionConstructor.get(paramId, function (err, objeto) {
				if (err){
					 cb(500,{err: 'err'});
				}else 
				{
					if (objeto){
					
						objeto.remove(function (err) {

					        if (err){
					        	 cb(500,{err: 'ERROR'});
							}else{
							 	 cb(200);
							}
					    });
					}else{
					
						 cb(404, {err:"NO EXISTE GRUPO"});
					}
				}
			});
		},*/
	}
};
