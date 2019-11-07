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

//var usuarios = global.db.models.hs_usuario;

describe('USUARIOS - SEGURIDAD', function() {

  // *** AUTENTICACION  (TOKEN ERRONEA) ***
  it('No tiene acceso por el token incorrecto', function(done) {
      api.get('/HS_Usuario')
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


describe('USUARIOS', function(){

  /*CREAR BUQUES*/
  var fechaRequerida = new Date();
  var time=fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idUsuario1=0;

  //before(function(done){
      var datos1 = {
        "nombres":"Alonso",
        "apellidos":"Rojas",
        "correo":"tecdessigns@hotmail.com", //comprobar que llegue el email de confirmacion una vez creado
        "telefonoContacto":"4578964",
        "DNI":44125754,
        "rol":1,
      };

      it('Creacion de Usuarios', function(done) {
          api.post('/HS_Usuario')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos1)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                      return done(err);
                  }else{
                     // expect(res.body[0]).to.have.property('id');
                      idUsuario1 = res.body.id;
                     
                                      done();
                  }
              });
      });

// *** VALIDAR USUARIO CREADO ***
    it('Usuario Creado', function(done) {
    api.get('/HS_Usuario/' + idUsuario1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
               
        expect(res.body[0].nombres).eql( 'Alonso' );
        expect(res.body[0].apellidos).eql( 'Rojas' );
        expect(res.body[0].correo).eql( 'tecdessigns@hotmail.com' );
        expect(res.body[0].telefono).eql( '4578964' );
        expect(res.body[0].dni).eql( '44125754' );
        expect(res.body[0].rol).eql( '1' );

      //Muestra los datos en consola
        done();
      });
  });

    var datos2 = {
        "nombres":"Jorge",
        "apellidos":"Mendez",
        "correo":"tecdessigns@hotmail.com", //comprobar que llegue el email de confirmacion una vez creado
        "telefonoContacto":"5487965",
        "DNI":12342165,
        "rol":1,
      };

      it('Creacion de Usuarios con email existente', function(done) {
          api.post('/HS_Usuario')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos1)
              .expect(409)
              .expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                      return done(err);
                  }else{
                     done();
                  }
              });
      });

  // *** UPDATE ***

      var datos3 = {
        "nombres":"Jorge",
        "apellidos":"Mendez",
        "correo":"tecdessigns@hotmail.com", //comprobar que llegue el email de confirmacion una vez creado
        "telefonoContacto":"5487965",
        "DNI":12342165,
        "rol":1,
      };

      it('Actualizando Usuarios', function(done) {
        api.put('/HS_Usuario/' + idUsuario1)
        .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
        .send(datos3)
        .expect(200)    
        .end(function(err, res) {
          if (err) return done(err);
      
          done();
        });
      });

// *** GET UPDATE ***
    it('Actualizar Usuarios Validar', function(done) {
    api.get('/HS_Usuario/' + idUsuario1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
               
        expect(res.body[0].nombres).eql( 'Jorge' );
        expect(res.body[0].apellidos).eql( 'Mendez' );
        expect(res.body[0].correo).eql( 'tecdessigns@hotmail.com' );
        expect(res.body[0].telefono).eql( '5487965' );
        expect(res.body[0].dni).eql( '12342165' );
        expect(res.body[0].rol).eql( '1' );

   
        
      //Muestra los datos en consola
        done();
      });
  });


// *** UPDATE VALORES INCORRECTOS ***

    var datos8 = {
        "nombres":"",
        "apellidos":"",
        "correo":"", 
        "telefonoContacto":"",
        "DNI":"",
        "rol":"",
    };

    it('error por actualizar con valores EN BLANCO', function(done) {
        api.put('/HS_Usuario/' + idUsuario1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos8)
            .expect(500)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
             
                  done();
            });
    });



  // *** UPDATE VALORES NULOS ***

    var datos9 = {
        "nombres":null,
        "apellidos":null,
        "correo":null, 
        "telefonoContacto":null,
        "DNI":null,
        "rol":null,
    };

    it('error por actuazlizar con valores nulos', function(done) {
        api.put('/HS_Usuario/' + idUsuario1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos9)
            .expect(500)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
             
                  done();
            });
    });



  /* ELIMINACION DE USUARIOS */
  it('Eliminacion de Usuarios', function(done) {
    api.delete('/HS_Usuario/' + idUsuario1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err){
        return done(err);
      }else{
        done();
      }
    });
  }); 

  /* VALIDACIÓN DE ELIMINACION */
        it('VALIDACION DE ELIMINACIÓN', function(done){
            api.get('/HS_Usuario/'+idUsuario1 )
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
                .expect(404)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err){
                        return done(err);
                    }else{
                        done();
                    }
            });
        });

  /*  ELIMINACION CON iD QUE NO EXISTE */
         it('Eliminacion de Usuario con Id que no existe', function(done) {
          api.delete('/HS_Usuario/'+ idUsuario1)
          .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
          .expect(500)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err){
              return done(err);
            }else{
              done();
            }
          });
        });


  /*  ELIMINACION CON ID NULO*/
         it('Eliminacion de Usuario con valor nulo', function(done) {
          api.delete('/HS_Usuario/')
          .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
          .expect(404)
          //.expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err){
              return done(err);
            }else{
              done();
            }
          });
        });



 /*  CREACION CON VALORES EN NULO */

       var datos5 = {
        "nombres":null,
        "apellidos":null,
        "correo":null, //comprobar que llegue el email de confirmacion una vez creado
        "telefonoContacto":null,
        "DNI":null,
        "rol":null,
      };

      it('no se puede crear Usuarios por valores nulos', function(done) {
          api.post('/HS_Usuario')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos5)
              .expect(500)
              //.expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                      return done(err);
                  }else{
                      
                      done();
                  }
              });
      });

/*  CREACION CON VALORES EN VACIOS */

       var datos6 = {
        "nombres":"",
        "apellidos":"",
        "correo":"", //comprobar que llegue el email de confirmacion una vez creado
        "telefonoContacto":"",
        "DNI":"",
        "rol":"",
      };

      it('no se puede crear Usuarios por valores BLANCO', function(done) {
          api.post('/HS_Usuario')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos6)
              .expect(500)
              //.expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                      return done(err);
                  }else{
                      
                      done();
                  }
              });
      });



 // *** UPDATE con Id que no existe***

     var datos7 = {
        "nombres":"Jorge",
        "apellidos":"Mendez",
        "correo":"tecdessigns@hotmail.com",
        "telefonoContacto":"5487965",
        "DNI":12342165,
        "rol":1,
    };



    it('No se puede actuzalizar Id no existe', function(done) {
        api.put('/HS_Usuario/' + idUsuario1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos7)
            .expect(500)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
                
                  done();
            });
    });



});


