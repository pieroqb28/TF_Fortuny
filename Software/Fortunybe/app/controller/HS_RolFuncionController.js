

 var HS_RolFuncion     = require('../models/HS_RolFuncion');


  require('date-utils');


module.exports =  function(){

	

 return 	{



getAll: function(cb) {
	  
	  var RolUsuarioConstructor = global.db.models.hs_rol_x_funcionalidades;

 	RolUsuarioConstructor.find({},function(err, listObj){

						if(err)  cb(500,{err: err});
						if(listObj){
							
							cb(200,listObj);
						}else{

						 	 cb(500,{err: 'NOT FOUND'});
						}
		}); 
  },

getbyId: function(rolId,cb) {

			 var RolUsuarioConstructor = global.db.models.hs_rol_x_funcionalidades;

  
 			RolUsuarioConstructor.find({id:rolId},function(err, listObj){

						if(err)  cb(500,{err: err});
						if(listObj){
							 cb(200,listObj);
						}else{

						 	 cb(500,{err: 'NOT FOUND'});
						}
			}); 

	},



  
 	

  
  	
  	


}
}