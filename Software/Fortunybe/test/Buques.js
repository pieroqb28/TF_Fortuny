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

//var buques = global.db.models.buques;

describe('BUQUES - SEGURIDAD', function() {

  // *** AUTENTICACION  (TOKEN ERRONEA) ***
  it('No tiene acceso por el token incorrecto', function(done) {
      api.get('/Buques')
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


describe('BUQUES', function(){

  /*CREAR BUQUES*/
  var fechaRequerida = new Date();
  var time=fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idbuque1=0;

  //before(function(done){
      var datos1 = [{
        "cliente_id": 1,
        "nombre": "buque de prueba",
        "IMO": "PE02-95",
        "tipo": "6L23/30A-DKV",
     
      }];

      it('Creacion de Buques', function(done) {
          api.post('/Buques')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos1)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                      return done(err);
                  }else{
                     // expect(res.body[0]).to.have.property('id');
                   
                      idbuque1 = res.body[0].id;
                     
                                      done();
                  }
              });
      });

// *** VALIDAR BUQUE CREADO ***
    it('Buques Creado', function(done) {
    api.get('/Buques/' + idbuque1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
        
        expect(res.body[0].cliente_id).eql( 1 );
        expect(res.body[0].nombre).eql( 'buque de prueba' );
        expect(res.body[0].IMO).eql( 'PE02-95' );
        expect(res.body[0].tipo).eql( '6L23/30A-DKV' );

      //Muestra los datos en consola
        done();
      });
  });

  // *** LISTAR TODOS ***
     it('Lista de todos los Buques', function(done) {
      api.get('/Buques')
      .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
          expect(res.body.length);
          done();
        });
      });


  // *** UPDATE ***

      var datos2 = {
        "cliente_id": 1,
        "nombre": "buque nuevo",
        "IMO": "PE02-98",
        "tipo": "5g85/30A-DKV",
      };

      it('Actualizando Buques', function(done) {
        api.put('/Buques/' + idbuque1)
        .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
        .send(datos2)
        .expect(200)    
        .end(function(err, res) {
          if (err) return done(err);
      
          done();
        });
      });

// *** GET UPDATE ***
    it('Actualizar Buques Validar', function(done) {
    api.get('/Buques/' + idbuque1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
                
        expect(res.body[0].cliente_id).eql( 1 );
        expect(res.body[0].nombre).eql( 'buque nuevo' );
        expect(res.body[0].IMO).eql( 'PE02-98' );
        expect(res.body[0].tipo).eql( '5g85/30A-DKV' );
   
        
      //Muestra los datos en consola
        done();
      });
  });


  // *** UPDATE VALORES INCORRECTOS ***

    var datos5 = {
        "cliente_id": "dsfdsf",
        "nombre": 4,
        "IMO": 5,
        "tipo": 5,
    };

    it('error por valores incorrectos', function(done) {
        api.put('/Buques/' + idbuque1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos5)
            .expect(500)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
             
                  done();
            });
    });



  // *** UPDATE VALORES NULOS ***

    var datos10 = {
        "cliente_id": "",
        "nombre": "",
        "IMO": "",
        "tipo": "",
    };

    it('error por valores nulos', function(done) {
        api.put('/Buques/' + idbuque1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos10)
            .expect(500)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
             
                  done();
            });
    });
 
  /* ELIMINACION DE CLIENTE */
  it('Eliminacion de Buques', function(done) {
    api.delete('/Buques/' + idbuque1)
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
            api.get('/Buques/' + idbuque1)
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
         it('Eliminacion de Buques con Id que no existe', function(done) {
          api.delete('/Buques/' + idbuque1)
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
         it('Eliminacion de Buques con valor nulo', function(done) {
          api.delete('/Buques/')
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



 /*  CREACION CON VALORES INCORRECTOS */

       var datos3 = {
        "cliente_id": "dsfdsf",
        "nombre": 4,
        "IMO": 5,
        "tipo": 5,
      };

      it('Creacion de Buques con valore incorrectos', function(done) {
          api.post('/Buques')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos3)
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


 /*  CREACION CON VALORES EN NULO */

       var datos4 = {
        "cliente_id": "",
        "nombre": "",
        "IMO": "",
        "tipo": "",
      };

      it('no se puede crear buques por valores nulos', function(done) {
          api.post('/Buques')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos4)
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

     var datos6 = {
        "cliente_id": 1,
        "nombre": "buque nuevo",
        "IMO": "PE02-98",
        "tipo": "5g85/30A-DKV",
    };



    it('No se puede actuzalizar Id no existe', function(done) {
        api.put('/Buques/' + idbuque1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos6)
            .expect(404)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
                
                  done();
            });
    });


});


