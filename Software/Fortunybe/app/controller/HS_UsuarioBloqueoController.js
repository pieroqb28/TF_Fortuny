var HS_Usuario     = require('../models/HS_Usuario');

var jwt = require('jsonwebtoken');
var secretKey = 'Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=';
module.exports = function () {

	function actualizarNumIntentos(idUsuario,numIntentos,cb){
		var usuarioConstructor = global.db.models.hs_usuario;	   	
	   	usuarioConstructor.get(idUsuario, function (err, obj) {
	   		if (err){
	 	 	 cb(500,{err: err});
	 	  
		 	}
		 	else
			{
			
				if(obj)
				{
					obj.numIntentos= numIntentos		
			
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

	   	})

}
function bloqueoUsuarioTemporal(idUsuario,cantminutos,cb){
	var usuarioConstructor = global.db.models.hs_usuario;	
	  	   	usuarioConstructor.get(idUsuario, function (err, obj) {
	  	   		if (err){
			 	  cb(500,{err: err});
			 	  
			 	}
			 	else
				{
						
					if(obj)
					{
						obj.hora_bloqueo= new Date();
						obj.cantidad_min_bloqueado=cantminutos;					
						obj.estado="BIT";		
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

	  	   	})
}
function bloqueoUsuario(idUsuario,cb){
	var usuarioConstructor = global.db.models.hs_usuario;	
			
	  	   	usuarioConstructor.get(idUsuario, function (err, obj) {
	  	   		if (err){
			 	  cb(500,{err: err});
			 	}
			 	else
				{
						
					if(obj)
					{					
						obj.estado="BI";
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

	  	   	})
}

return{
	  //acumulamos el numero de loggeos no validos
	   amountIntUser:function(idUsuario, tenantUsuario,cantidadMinBloq)
		{
			var minPrimerBloqueo=5
			var minsegundoBloqueo=10
			var bloquearUser=false
			var cantminBloqueo

			var usuarioConstructor = global.db.models.hs_usuario;			
			
			usuarioConstructor.find({id:idUsuario},function(statusCode, result){
				
				if(result[0].numIntentos<3)
				{

					actualizarNumIntentos(idUsuario,result[0].numIntentos +1,function(){
						
					})

				}
				if(result[0].numIntentos==2)
				{
					
					switch(cantidadMinBloq) {
					    case null:
					        cantminBloqueo=minPrimerBloqueo
					        break;
					    case minPrimerBloqueo:
					        cantminBloqueo=minsegundoBloqueo
					        break;
					    case minsegundoBloqueo:
					        bloquearUser=true
					        break;				    
					}

					if(bloquearUser)
					{
						bloqueoUsuario(idUsuario,function(){
						
						})	
					}
					else
					{
						bloqueoUsuarioTemporal(idUsuario,cantminBloqueo,function(){
						
						})	
					}
				}
			})
		},

		desbloqueoTiempo:function(idUsuario,cb){

			var usuarioConstructor = global.db.models.hs_usuario;
	  	   	usuarioConstructor.get(idUsuario, function (err, obj) {
	  	   		if (err){
			 	  cb(500,{err: err});
			 	}
			 	else
				{
						
					if(obj)
					{
						obj.numIntentos=0;
						obj.estado="H";
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

	  	   	})

		},
		desbloqueoUsuario:function(idUsuario,cb){

		var usuarioConstructor = global.db.models.hs_usuario;
  	   	usuarioConstructor.get(idUsuario, function (err, obj) {
  	   		if (err){
		 	  cb(500,{err: err});
		 	}
		 	else
			{
					
				if(obj)
				{
					obj.hora_bloqueo= null;
					obj.cantidad_min_bloqueado=null;
					obj.numIntentos=0;
					obj.estado="H";
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

  	   	})

	},

}
};