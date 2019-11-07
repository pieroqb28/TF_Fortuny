/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
module.exports = function () {

	return{

		getbyClient: function(tenantId,clienteId,cb) {
		
				global.db.driver.execQuery(
				"SELECT buques.id,buques.nombre,buques.IMO,buques.tipo FROM cliente INNER JOIN buques ON cliente.id=buques.cliente_id where buques.cliente_id=?;",
				[clienteId],
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
				
				 var buquesConstructor = global.db.models.buques;
				 buquesConstructor.find({ id:idGrupo}, function (err, listBuque) {
			    		if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
					}else{

						if(listBuque.length>0){
							cb(200,listBuque);
						}else{
						 	cb(404,{message: 'NO EXISTE BUQUE'});
						}
					}	  
			     });
		},

		update: function(tenantId,userid,idGrupo,objUpd,cb) {
				var buquesConstructor = global.db.models.buques;
				
				buquesConstructor.get(idGrupo, function (err, objeto) {

					if(objeto)
					{
					    
					    objeto.cliente_id= parseInt(objUpd.cliente_id)
						objeto.nombre= objUpd.nombre
						objeto.IMO= objUpd.IMO
						objeto.tipo= objUpd.tipo
					  
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
						return cb(404,{err: "NO EXISTE BUQUE"});
					}

				});

			
		},


		create: function(tenandId,userid,body,cb) {
		
			var buquesConstructor = global.db.models.buques;
			buquesConstructor.find({cliente_id:body[0].cliente_id}).remove(function(err){
				if (err){
					cb(500,{err: err});
				}else{
						var grabarBuques=[]
						for(i=0;i<body.length;i++)
						{	
							if (body[i].nombre!="" && body[i].IMO!="" &&body[i].tipo!=""){
								
								grabarBuques.push(body[i])
							}

							
						}
						
						var buquesConstructor = global.db.models.buques;
						buquesConstructor.create(grabarBuques, function (err, grupoCreado) {
						
						  		if(err){
						   		
						    		cb(500,{message: err});
							    		
						    	}else{
							    		
						    		cb(200,grupoCreado)

						    	}

						});
						
					}
			})
		},

		delete:function(tenantId,paramId,cb){
			

			var buquesConstructor = global.db.models.buques;

			buquesConstructor.get(paramId, function (err, objeto) {
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
					
						 cb(404, {err:"NO EXISTE BUQUE"});
					}
				}
			});
		},
	}
};
