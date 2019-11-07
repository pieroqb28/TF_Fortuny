var HS_UsuarioController     = require('../controller/HS_UsuarioController');
//var HS_AutenticarController= require('../controller/HS_AutenticarController');
var validateRolAccess     = require('../services/validateRolAcess');

module.exports = function (app) {


app.route('/HS_Usuario/')

  .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  	
  		HS_UsuarioController().get(req.tenant,function(statusCode, result){
        	res.status(statusCode).json(result);
  	 	});  

	})

   .post(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
			
		//HS_UsuarioController().post(req.userId, req.tenant,req.body, 'man.holinsys.net:3000',function(statusCode, result){
    //HS_UsuarioController().post(req.userId, req.tenant,req.body, 'man.holinsys.net',function(statusCode, result){
    HS_UsuarioController().post(req.userId, req.tenant,req.body, global.localsfeurl ,function(statusCode, result){
        	res.status(statusCode).json(result);

  	  	});  
				



	})
app.route('/HS_Usuario/actualizarUsuario/:id')
.put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
      HS_UsuarioController().actualizarUsuario(req.userId,req.tenant,req.params.id,req.body, function(statusCode, result){
          res.status(statusCode).json(result);
        }); 

  })

app.route('/HS_Usuario/:id')

.get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
   
    HS_UsuarioController().getById(req.tenant,req.params.id, function(statusCode, result){
          res.status(statusCode).json(result);
        });

  })


  .delete(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
  		HS_UsuarioController().delete(req.tenant,req.params, function(statusCode, result){
        	res.status(statusCode).json(result);

  	  	});  
	   		

  })
  /* .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
	 
	   	HS_UsuarioController().put(req.userId,req.tenant, function(statusCode, result){
        	res.status(statusCode).json(res,result);

  	  	}); 

  })*/
  .put(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {
        HS_UsuarioController().put(req.tenant,req.userId,req.params.id,req.body,function(statusCode, result){
           res.status(statusCode).json(result);
        });
  })

app.route('/HS_Usuario/password/')

   .post(function(req, res) {

		HS_UsuarioController().postChangePswd(req.userId,req.tenant,req.body.jwt,function(statusCode, result){
        	res.status(statusCode).json(result);

  	  	}); 

	})

app.route('/HS_Usuario/recuperarPswd')
	 .post(function(req, res) {
	 	//HS_UsuarioController().recuperarPswd(req.userId,req.body.correo,'man.holinsys.net:3000', function(statusCode, result){
     // HS_UsuarioController().recuperarPswd(req.userId,req.body.correo,'man.holinsys.net', function(statusCode, result){
    HS_UsuarioController().recuperarPswd(req.userId,req.body.correo,global.localsfeurl , function(statusCode, result){
        	res.status(statusCode).json(result);

  	  	}); 


	 });


app.route('/HS_Usuario/nuevoPswd')
	 .post(function(req, res) {    
	 	HS_UsuarioController().nuevoPswdRecuperado(req.userId,req.body.jwt,function(statusCode, result){
        	res.status(statusCode).json(result);

  	  	}); 
	 	
	 });

/*app.route('/HS_Roles')
   .get(function(req, res) {    
    HS_UsuarioController().recuperarPswd(function(statusCode, result){
          res.status(statusCode).json(result);

        }); 

   });*/

app.route('/desbloquearUsuario/:id')
   .get(function(req,res,next){validateRolAccess(req,res,next)}
      ,function(req, res) {    
    HS_UsuarioController().desbloqueoUsuario(req.params.id,function(statusCode, result){
          res.status(statusCode).json(result);

        }); 

   });


}

