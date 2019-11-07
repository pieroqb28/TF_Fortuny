
module.exports = function () {
	return{

	
		getById:function(tenantId,paramId,cb){
			var cuentaContableConstructor = global.db.models.cuenta_contable;
			cuentaContableConstructor.find({id:paramId},function(err, listObj){
				if(err){
					
					return cb(500,{err: "Error en el Servicio"});
				}else{
					if(listObj){
						
						return cb(200,listObj);
					}else{
				 		return cb(500,{err: 'No existe Cuenta Contable'});
				 	}
				}
			});
		},		

		delete:function(tenantId,paramId,cb){

			var cuentaContableConstructor = global.db.models.cuenta_contable;
			cuentaContableConstructor.get(paramId, function (err, objeto) {
				if (objeto){
				    objeto.remove(function (err) {
				        if (err){
				        	return cb(500,{err: "Error en el Servicio"});
						}else{
						 	return cb(200);
						}
				    });
			    }else{
			    	return cb(404,{err: 'No se encontro Cuenta Contable'});
			    }
			});
		},

		getAll: function(tenantId,cb){
				
			var cuentaContableConstructor = global.db.models.cuenta_contable;

			cuentaContableConstructor.find({},function(err, listObj){
				if(err){
					
					return cb(500,{err: "Error en el Servicio"});
				}else{
					if(listObj){
						for(i=0;i<listObj.length;i++)
						{
							listObj[i].estado_CC=listObj[i].estado_CC=="H"?"Habilitado":"Deshabilitado"
						}
						return cb(200,listObj);
					}else{
				 		return cb(500,{err: 'No existen Cuenta Contable'});
				 	}
				}
			});
		},

		create:function(tenantId,userId,body,cb){
				
	  	 	var cuentaContableConstructor = global.db.models.cuenta_contable;
	  	 	cuentaContableConstructor.create({
	  	 		nombreCuenta: body.nombreCuenta,
	  	 		descripcion: body.descripcion,
	  	 		numeroCuenta: body.numeroCuenta,
	  	 		monedaCuenta: body.monedaCuenta,
	  	 		bancoCuenta: body.bancoCuenta,	  	 		
	  	 		estado_CC:"H"
	  	 	}, function(err, obj){
	  	 		if (err){
	  	 			return cb(500,{err: "Error en el Servicio"});
	  	 		}else{
	  	 			if (obj){
						return cb(200,{id:obj.id });
	  	 			}else{
						return cb(500,{err: 'No se pudo crear Cuenta Contable'});
	  	 			}
	  	 		}
	  	 	});
		},

		put:function(tenantId,userId,paramId,body,cb){

			var cuentaContableConstructor = global.db.models.cuenta_contable;

  	   		cuentaContableConstructor.get(paramId, function (err, obj) {
			  	if (err){
			  	  cb(500,{err: "Error en el Servicio"});
			  	}
			  	else
				{
					
					if(obj)
					{
						obj.nombreCuenta=body.nombreCuenta,
	  	 				obj.descripcion=body.descripcion,
	  	 				obj.numeroCuenta=body.numeroCuenta,
	  	 				obj.monedaCuenta=body.monedaCuenta,
	  	 				obj.bancoCuenta=body.bancoCuenta,
	  	 				obj.estado_CC=body.estado_CC

				  	// save the user
					  	obj.save(function(err) {
					   	  if (err)
					   	  { 
					   	   cb(500,{err: "Error en el Servicio"});
					   	  }
					   	  else
					   	  {
							
			  	 			cb(200,{id:obj.id });		  	  	 
					  	  }			  	  
					  	});
					}
					else
					{
						cb(404,{err: 'No existe Cuenta Contable'});
					}

			  	}
			});	
		},
		deshabilitarCC:function(tenantId,userId,paramId,cb){

			var cuentaContableConstructor = global.db.models.cuenta_contable;

  	   		cuentaContableConstructor.get(paramId, function (err, obj) {
			  	if (err){
			  	  cb(500,{err: "Error en el Servicio"});
			  	}
			  	else
				{
					
					if(obj)
					{
						obj.estado_CC="B"	  	 				

				  	// save the user
					  	obj.save(function(err) {
					   	  if (err)
					   	  { 
					   	   cb(500,{err: "Error en el Servicio"});
					   	  }
					   	  else
					   	  {
							
			  	 			cb(200,{id:obj.id });		  	  	 
					  	  }			  	  
					  	});
					}
					else
					{
						cb(404,{err: 'No existe Cuenta Contable'});
					}

			  	}
			});	
		}
	}
}