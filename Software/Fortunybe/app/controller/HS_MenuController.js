/**
 * HS_MenuController
 *
 * @description :: Server-side logic for managing Hs_menus
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var HS_Funcionalidades     = require('../models/HS_Funcionalidades');

module.exports = function () {
	return{

	

		getAll: function(rolId,cb){
  			var returnObjMenu = [];
		   var objtoAdd = {};
		   var checkFirst = true;
				


				db.driver.execQuery(
								  "SELECT funcionalidades.modulo,funcionalidades.funcionalidad,funcionalidades.url FROM hs_funcionalidades as funcionalidades INNER JOIN hs_rol_x_funcionalidades as rolfuncionalidades ON funcionalidades.id=rolfuncionalidades.funcionalidad where rolfuncionalidades.rol=? and visible=1;",
								  [rolId],
								  function (err, listFunciones) { 
								  	
								  	if (err)  {cb(400,{err: err}); } 
									else{
										if (listFunciones){
											cb(200,listFunciones);	
										}else{
												cb(400,{err: 'NOT FOUND'});
										}


									}

								  });


			
					
					
					/*var rolesUsuario=foundRol[0];
												
					

					funcionalidadesConstructor.find().sort({modulo: -1 }).exec(function (err, selectedFunc) {
		           	 		 if (err)  	cb(400,{err: err});

		       				if(selectedFunc){
		         					while (selectedFunc.length){
		            						objtoAdd = {};
		            						objMovs = selectedFunc.pop();
		            						objtoAdd.modulo =  objMovs.modulo;
											objtoAdd.url =  objMovs.url;
						            	 	objtoAdd.funcionalidad = objMovs.funcionalidad; 
						  								
						            	 	if(rolesUsuario.funcionalidades != null && rolesUsuario.funcionalidades!= ""){
													for(i=0;i<rolesUsuario.funcionalidades.length;i++)
													{	
															if(rolesUsuario.funcionalidades[i].funcionalidad==objtoAdd.funcionalidad){
																returnObjMenu.push(objtoAdd);
															}
													}

							            	}				
									}
							            					
							}
						
						cb(200,returnObjMenu);
			    	 });*/
	     

			  
		},
		
		
		
	

	}

}
