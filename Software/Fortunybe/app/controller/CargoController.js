
module.exports = function () {
	return{
		getById:function(tenantId,paramId,cb){
			global.db.driver.execQuery(
				"SELECT * FROM cargo  where cargo.id=?;",
				[paramId],
				 function (err, ObjCargo) { 
					if(err){
						cb(500,{err: 'ERROR EN EL SERVICIO'});
					}
					else{
						
						if(listClientes.length>0){
							
							cb(200,listClientes);
						}else{
						 	cb(404,{err: 'NO EXISTEN DATOS DEL CARGO'});
						}
					}
			});
		},

		delete:function(paramId,cb){
			var cargoConstructor = global.db.models.cargo;
			cargoConstructor.get(paramId, function (err, objeto) {
				if (err){
					cb(500,{err: "Existe un error en el servicio"});
				}
				else{
					if (objeto){
						objeto.remove(function (err) {
					        if (err){
					        	if (err.code && err.code.indexOf('ROW_IS_REFERENCED') != -1){
					        		cb(500,{message: "El cliente no puede ser eliminado, tiene informacion asociada a él."});
					        	}else{
					        		cb(500,{message: "Existe un error en el servicio"});
					        	}
					        	
							}else{
							 	cb(200);
							}
					    });
					}else{
						 cb(404,{err: 'NO EXISTE CLIENTE'});
					}
				}
			});
		},

		getAll: function(cb){
			global.db.driver.execQuery(
				"SELECT * FROM cargo; ",
				[],
				 function (err, listClientes) { 
				 	
					if(err){
						cb(500,{err: 'ERROR EN EL SERVICIO'});
					}else{
						if(listClientes){
							
							cb(200,listClientes);
						}else{
						 	cb(404,{err: 'NO EXISTEN DATOS DE CLIENTES'});
						}
					}

			});
		},

		getByNombre:function(nombre,cb){
			global.db.driver.execQuery(
			"SELECT * FROM cargo where nombre LIKE ?;"
			, ["%" + nombre + "%"]
			, function (err, listCargos) { 
					if(err){
						cb(500,{err: 'ERROR EN EL SERVICIO'});
					}else{
						if(listCargos){
							
							cb(200,{cargos:listCargos});
						}else{
						 	cb(404,{err: 'NO EXISTEN DATOS DEL CARGO'});
						}
					}

			});
		},

		create:function(body,cb){
	  	 	var cargoConstructor = global.db.models.cargo;
	  	 	cargoConstructor.create({
	  	 		nombre: body.nombre
	  	 	}, function(err, obj){
				if(err){
					if (err.code.indexOf('DATA_TOO_LONG') ){
  						cb(500,{message: "Uno de los campos tiene datos muy largos.", code:'1000'});
					}else{
						cb(500,{message: "Existe un error en el servicio", code:'1000'});
					}
					
				}else{
					if(obj){
						cb(200,{id:obj.id });
					}else{
					 	 cb(500,{message: "Existe un error en el servicio", code:'1001'});
					}
				}
	  	 	});
		},

		put:function(paramId,body,cb){
			var cargoConstructor = global.db.models.cargo;
  	   		clienteConstructor.get(paramId, function (err, obj) {
			  	if (err){
			  	  cb(500,{err: "Existe un error en el servicio"});
			  	}
			  	else
				{	
					if(obj)
					{
					  	obj.nombre= body.nombre,
				  	// save the user
					  	obj.save(function(err) {
					   	  if (err)
					   	  { 
					   	   cb(500,{err: "Existe un error en el servicio"});
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