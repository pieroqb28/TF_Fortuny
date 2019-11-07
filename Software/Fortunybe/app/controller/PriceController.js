//var mongoose   = require('mongoose');

module.exports = function () {
	return{

		getBy:function(tenantId,userId,user,cb){
		
			global.db.driver.execQuery(
				"SELECT id ,story, photo, carousel,video, create_date, " +
				"idInfluencer FROM prices "+
				"where idInfluencer =?;",
				[user ],
				 function (err, listParamsFactor) {
					 console.log(listParamsFactor) 
			
					if(err){
						cb(500,{message: 'ERROR EN EL SERVICIO'});
					}
					else{
						
						if(listParamsFactor.length>0){
						
							cb(200,listParamsFactor);
						}else{
						 	cb(200,[{message: 'Cotización sin parámetros de factor.'}]);
						}
					}

			});
		},

	
		delete:function(tenantId,paramId,cb){

			var buquesConstructor = global.db.models.buques;
			buquesConstructor.find({cliente_id: paramId}).remove(function(err){
				if (err){
					cb(500,{err: err});
				}else{
						var clienteConstructor = global.db.models.cliente;
						
						clienteConstructor.get(paramId, function (err, objeto) {
							if (err){
								 cb(500,{err: 'err'});
							}
							else{
								if (objeto){
					
									objeto.remove(function (err) {
								        if (err){
								        	 cb(500,{err: 'ERROR'});
										}else{
										 	 cb(200);
										}
								    });
								}else{
									 cb(404,{err: 'NO EXISTE CLIENTE'});
								}
							}
						});
				}
			});
		},

		
		create:function(tenantId,userId,body,cb){
            console.log(body)
			if(body.id!=null)
			{
				body.id=null	
			}
			body.create_by=userId;
			body.create_date=new Date();
			   var priceConstructor = global.db.models.prices;
			   
	  	 	priceConstructor.create(body, function(err, obj){
                console.log(err)
                console.log(body)
				if(err){	
					 cb(500,{err: err});
				}else{
					if(obj){
						console.log(obj);			
						 cb(200,{id:obj.id });
						
					}else{
						
					 	 cb(500,{err: 'ERROR'});
					}
				}
	  	 	});
		},
		getAll: function (tenantId,userId, cb) {
			console.log("aaca")

			global.db.driver.execQuery(
				"SELECT influencer.id,"+ 
				"influencer.username_instagram,"+
				" influencer.id_instagram, influencer.nombre, " +
				" influencer.apellido, influencer.nota_personal, influencer.email,"+
				" influencer.telefono, influencer.profile_url FROM influencer where influencer.create_by =? "
				,
				[userId],
				function (err, influencerList) {

					if (err) {
						cb(500, { err: 'ERROR EN EL SERVICIO' });
					} else {
						if (influencerList) {

							cb(200, influencerList);
						} else {
							cb(404, { err: 'NO EXISTEN DATOS DE LAS LISTAS' });
						}
					}

				});
		},
		put:function(tenantId,userId,body,cb){
			
			var parametrosFactorConstructor = global.db.models.parametros_factor;
			
  	   		parametrosFactorConstructor.get(body.id, function (err, obj) {
			  	if (err){			  		
			  	  cb(500,{err: err});
			  	}
			  	else
				{	
					if(obj)
					{
					  	obj.tipo_envio= body.tipo_envio,
			  	 		obj.origen= body.origen,
			  	 		obj.valor_fob= body.valor_fob,
			  	 		obj.peso= body.peso,
			  	 		obj.dimesiones_largo= body.dimesiones_largo,
			  	 		obj.dimesiones_ancho= body.dimesiones_ancho,
			  	 		obj.dimesiones_altura= body.dimesiones_altura,
			  	 		obj.peso_volumetrico= body.peso_volumetrico,	  	 		
			  	 		obj.peso_cotizar=body.peso_cotizar,
			  	 		obj.flete= body.flete,
			  	 		obj.recarg_combustible= body.recarg_combustible,
			  	 		obj.seguro= body.seguro,
			  	 		obj.handling= body.handling,
			  	 		obj.cargos= body.cargos,
			  	 		obj.igv_cargos= body.igv_cargos,
			  	 		obj.total_cargos= body.total_cargos,
			  	 		obj.total_cip= body.total_cip,	  	 		
			  	 		obj.ad_valorm=body.ad_valorm,
			  	 		obj.ipm_porcent= body.ipm_porcent,
			  	 		obj.ipm= body.ipm,
			  	 		obj.igv_sunat_porcent= body.igv_sunat_porcent,
			  	 		obj.igv_sunat= body.igv_sunat,
			  	 		obj.sda= body.sda,
			  	 		obj.isc= body.isc,
			  	 		obj.total_impuestos= body.total_impuestos,
			  	 		obj.percepcion_igv_porcent= body.percepcion_igv_porcent,	  	 		
			  	 		obj.percepcion_igv=body.percepcion_igv,
			  	 		obj.total_sunat= body.total_sunat,
			  	 		obj.almacenaje= body.almacenaje,
			  	 		obj.comision_aduanas= body.comision_aduanas,
			  	 		obj.descarga= body.descarga,
			  	 		obj.reconocimiento_fisico= body.reconocimiento_fisico,
			  	 		obj.transporte= body.transporte,
			  	 		obj.gastos_itf_porcent= body.gastos_itf_porcent,
			  	 		obj.gastos_itf= body.gastos_itf,	  	 		
			  	 		obj.cargos_aduanas=body.cargos_aduanas,	 
			  	 		obj.igv_aduanas= body.igv_aduanas,
			  	 		obj.total_cargos_aduanas= body.total_cargos_aduanas,
			  	 		obj.valor_porcent= body.valor_porcent,
			  	 		obj.cotizacion_id= body.cotizacion_id,
			  	 		obj.ad_valorm_porcent= body.ad_valorm_porcent,
			  	 		obj.total_factor= body.total_factor		  	 	
				

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
						cb(404,{err: 'NO EXISTE CLIENTE'});
					}

			  	}
			});	
		}
	}
}