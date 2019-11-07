/**
 * HS_UsuarioController
 *
 * @description :: Server-side logic for managing Hs_usuarios
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');
module.exports = function () {

	return{

		
		getByMonedaFecha: function(tenantId,monedaBuscar,fecha,cb) {

				 var tipoCambioConstructor = global.db.models.tipo_cambio;				 				 
				 //var resFecha = fecha.split("/");
				 
				// fecha=resFecha[2]+ "-"+ resFecha[1] + "-"+resFecha[0]
				 
				 tipoCambioConstructor.find({ fecha:fecha,moneda:monedaBuscar}, function (err, listTipoCambio) {
			     if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
					}else{						
							cb(200,listTipoCambio);							
					}	  
			     });
		},
		getByFecha: function(tenantId,fecha,cb) {
				
				 var tipoCambioConstructor = global.db.models.tipo_cambio;				 
				 
				 tipoCambioConstructor.find({ fecha:fecha}, function (err, listTipoCambio) {
			    		if(err){
					cb(500,{message: 'ERROR EN EL SERVICIO'});
					}else{						
							cb(200,listTipoCambio);							
					}	  
			     });
		},

	create: function(tenandId,userid,body,cb) {
			
			var tipoCambioConstructor = global.db.models.tipo_cambio;
            var tipoCambioCrear = {                
                cambio: body.cambio,
                moneda: body.moneda,
                fecha: body.fecha
            };
            tipoCambioConstructor.create(tipoCambioCrear, function(err, objTipoCambio) {
                if (err) {
            	console.log(err);
                    cb(500, { message: "Existe un error en el servicio" });
                } else {                    
                        cb(200, objTipoCambio);                    
                }
            })
			
		},

		update: function(tenantId,userid,idFecha,objUpd,cb) {
				var tipoCambioConstructor = global.db.models.tipo_cambio;
				
				tipoCambioConstructor.get(idFecha, function (err, objeto) {

					if(objeto)
					{
					    objeto.cambio = objUpd.cambio;					    
					  
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

	}
};
