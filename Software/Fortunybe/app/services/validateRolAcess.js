

module.exports = function (request,response,next) {
	var url;

		 if(Object.getOwnPropertyNames(request.query).length >0)
				{
					var posicionIniQuery = request.url.indexOf('?')
					 url=request.url.substring(0, posicionIniQuery)
				}

		
		if(Object.getOwnPropertyNames(request.params).length >0)
		{
			var posicionIniParam = request.url.lastIndexOf('/')
			 url=request.url.substring(0, posicionIniParam)+"/*"


		}

		if (!url){
			url = request.url;
		}


		var RolUsuarioConstructor = global.db.models.hs_rol_x_operaciones;
		var OperacionesUsuarioConstructor= global.db.models.hs_operacionespermitidas;

		global.db.driver.execQuery(
			"SELECT operacionesPermitidas.url,operacionesPermitidas.verbo FROM hs_rol_x_operaciones as rolOperaciones INNER JOIN hs_operacionespermitidas as operacionesPermitidas ON rolOperaciones.operaciones=operacionesPermitidas.id where( rolOperaciones.rol=? and operacionesPermitidas.url=? and operacionesPermitidas.verbo=?)",
		
			[request.rolId,url,request.method],
		  function (err, selectedRol) { 

		  	if(selectedRol!= null && selectedRol!="")
             {

		         if(selectedRol.length>0)
		            {	
		               	next()
		            }
		         else
		            {	 
		             	 response.status(403).json({message: "No tiene acceso a esta acción" ,code:"100", detalle: "El rol del usuario no tiene esta acción configurada"} );
		            }
              
		  }else{
		  			 response.status(403).json({message: "No tiene acceso a esta acción" ,code:"100", detalle: "Hubo un error inesperado" + err} );

		  }
		})




}