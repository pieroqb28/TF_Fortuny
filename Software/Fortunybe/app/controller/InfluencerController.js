//var mongoose   = require('mongoose');

module.exports = function () {
	return{

		getBy:function(tenantId,userId,user,cb){
		
			global.db.driver.execQuery(
				"SELECT id ,username_instagram, id_instagram, nombre,apellido, " +
				"nota_personal, email, telefono, profile_url FROM influencer "+
				"where username_instagram =? and create_by=?;",
				[user,userId ],
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
			   var influencerConstructor = global.db.models.influencer;
			   
	  	 	influencerConstructor.create(body, function(err, obj){
                console.log(err)
                console.log(body)
				if(err){	
					switch (err.code){
						case 'ER_DUP_ENTRY':
							message= 'El influencer ya existe';
							break;
						default:
							
							message= "Existe un error en el servicio"
							break;
					}		
				
				
				cb(500, { message: message});
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
				" influencer.telefono, influencer.profile_url FROM influencer where influencer.create_by =?  "+
				" order by influencer.create_date desc ;"
				,
				[userId],
				function (err, influencerList) {

					if (err) {console.log(err)
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
		put:function(tenantId,userId,paramId,body,cb){
			
			var influencerConstructor = global.db.models.influencer;
			
			influencerConstructor.get(paramId, function (err, obj) {
			  	if (err){	
					  console.log(err)		  		
			  	  cb(500,{err: err});
			  	}
			  	else
				{	
					if(obj)
					{
					  	obj.nombre= body.nombre,
			  	 		obj.apellido= body.apellido,
			  	 		obj.nota_personal= body.nota_personal,
			  	 		obj.email= body.email,
						   obj.telefono= body.telefono,
						   obj.update_by = userId,
						   obj.update_date = new Date(),
			  
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
						cb(404,{err: 'NO EXISTE INFLUENCER'});
					}

			  	}
			});	
		}
	}
}