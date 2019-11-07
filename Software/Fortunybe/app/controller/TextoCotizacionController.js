/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = function () {

	return{

		get: function(tenantId,cb) {

			global.db.driver.execQuery(
			"SELECT texto_cotizacion.id idTextoCotizacion, texto_cotizacion.nombre,texto_cotizacion.texto,categoria_cotizacion.id idCategoriaCotizacion,categoria_cotizacion.categoria FROM texto_cotizacion INNER JOIN categoria_cotizacion ON texto_cotizacion.categoria_id=categoria_cotizacion .id;",
			[],
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
		getById: function(tenantId,idGrupo,cb) {
		
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
		},

		getByNombre: function(tenantId,nombre,cb) {
		
				 var grupoAprobacionConstructor = global.db.models.texto_cotizacion;
				 grupoAprobacionConstructor.find({ nombre:nombre}, function (err, grupoDatos) {
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
		},

		update: function(tenantId,userid,idGrupo,objUpd,cb) {
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

			
		},


		create: function(tenandId,userid,params,cb) {

		    if (!(params.nombre && params.categoria_id &&params.texto)){
		    	cb(400,{message: 'FALTAN CAMPOS'});
		    }else{

				
		    	var textoCotizacionConstructor = global.db.models.texto_cotizacion;

				textoCotizacionConstructor.create({ 
					nombre: params.nombre,
					texto: params.texto,
					categoria_id: parseInt(params.categoria_id),
			
				},function (err, grupoCreado) {

			    	if(err){
			    		
			    		cb(500,{message: err});
			    	}else{
			    		cb(200,{id:grupoCreado.id });

			    	}

				});

		    }
		},

		delete:function(tenantId,paramId,cb){
			

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
		},
	}
};
