require('./auth');

var jwt = require('jsonwebtoken');
var datosLogin = {
   usuario : "imagescode@gmail.com",
   contrasena: "123456"
}
var sJWT = jwt.sign(datosLogin, "Vkwe1mlbASD9XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=", {
  expiresIn :"1h",
  audience : "http://localhost"
})
var theAccount = {
  jwt: sJWT
}

//var cliente = global.db.models.cliente;
/*
describe('CLIENTE - SEGURIDAD', function() {

  // *** AUTENTICACION  (TOKEN ERRONEA)
  it('No tiene acceso por el token incorrecto', function(done) {
      api.get('/cliente')
      .set('Authorization', 'Basic ' + new Buffer(sJWT).toString('base64'))
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
          if (err){
              return done(err);
          }else{
              done()
          };
      });
  });
});
*/

describe('APROBACION - GENERICO', function() {

	var idUsuario = 1;
	var idUsuario2 = 3;
	var idSolicitud1 = 0;
	var cotizacion_id = 39;

  	var datos = {
		//tipo_aprobacion_id: 2,
		//grupo_aprobacion_id: 37,
		//usuario_creacion: idUsuario,
		entidad_id: cotizacion_id
  	};


	it('Creacion de Solicitud', function(done) {
		api.post('/SolicitudCotizacion')
			.set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
			.send(datos)
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err){
					return done(err);
				}else{
					expect(res.body).to.have.property('id');
					idSolicitud1 = res.body.id;
					done();
				}
  		});
	});

	//idSolicitud1 = 5;

    it('Validar Aprobacion Creada', function(done) {

		api.get('/SolicitudCotizacion/' + idSolicitud1)
			.set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err){
					return done(err);
				}else{
					expect(res.body[0].tipo_aprobacion_id).eql(2);
					expect(res.body[0].grupo_aprobacion_id).eql(37);
					expect(res.body[0].usuario_creacion).eql(idUsuario);
					expect(res.body[0].entidad_id).eql(39);
					expect(res.body[0].estado_id).eql(1);
					done();
				}
  		});

	});

    var aprobar = 1;

  	var datosAprobacion = {
		solicitud_id: idSolicitud1,
		cotizacion_id: cotizacion_id,
		aprobar: aprobar
  	};

	it('Aprobacion - aprobacion', function(done) {
        api.put('/SolicitudCotizacion/' + idSolicitud1)
	        .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
	        .send(datosAprobacion)
	        .expect(200)    
	        .end(function(err, res) {
				if (err){
          			return done(err);
          		}else{
		          	done();
      			}
    	});
	});

	aprobar = 0;

	datosAprobacion = {
		solicitud_id: idSolicitud1,
		usuario_id: idUsuario2,
		cotizacion_id: cotizacion_id,
		aprobar: aprobar
  	};

	it('Aprobacion - rechazo', function(done) {
        api.put('/SolicitudCotizacion/' + idSolicitud1)
	        .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
	        .send(datosAprobacion)
	        .expect(200) 
	        .end(function(err, res) {
				if (err){
          			return done(err);
          		}else{
		          	done();
      			}
    	});
	});


});