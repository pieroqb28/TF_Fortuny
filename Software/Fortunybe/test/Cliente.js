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

describe('CLIENTE - SEGURIDAD', function() {

  // *** AUTENTICACION  (TOKEN ERRONEA) ***
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


describe('CLIENTE', function(){

  /*CREAR CLIENTE*/
  var fechaRequerida = new Date();
  var time=fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idcliente1=0;

  //before(function(done){
      var datos1 = {
        "nombre": "Marcos Aurelio",
        "ruc": "20159753654",
        "direccion": "Santiago de Surco",
        "telefono": 940594630,
        "contacto1": "Simon",
        "email1": "simon@gmail.com",
        "contacto2": "",
        "email2": "",
        "detalleBuques":[]
      };

      it('Creacion de Cliente', function(done) {
          api.post('/cliente')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos1)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                      return done(err);
                  }else{
                      expect(res.body).to.have.property('id');
                      idcliente1 = res.body.id;
                      
                      done();
                  }
              });
      });

// *** VALIDAR cLIENTE CREADO ***
    it('Cliente Creado', function(done) {
    api.get('/cliente/' + idcliente1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
        
        expect(res.body[0].nombre).eql( 'Marcos Aurelio' );
        expect(res.body[0].ruc).eql( '20159753654' );
        expect(res.body[0].direccion).eql( 'Santiago de Surco' );
        expect(res.body[0].telefono).eql( 940594630 );
        expect(res.body[0].contacto1).eql( 'Simon' );
        expect(res.body[0].email1).eql( 'simon@gmail.com' );
        expect(res.body[0].contacto2).eql( '' );
        expect(res.body[0].email2).eql( '' );
        
      //Muestra los datos en consola
        done();
      });
  });

  // *** LISTAR TODOS ***
     it('Lista de todos los Clientes', function(done) {
      api.get('/cliente?filtro=0')
      .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
          expect(res.body.length);
          done();
        });
      });

// *** LISTAR  clientes pendientes de aprobacion  ***
     it('Lista de Clientes Pendinetes de aprobación', function(done) {
      api.get('/cliente?filtro=1')
      .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
          expect(res.body.length);
          done();
        });
      });

     // *** LISTAR clientes aprobados  ***
     it('Lista de Clientes aprobados', function(done) {
      api.get('/cliente?filtro=2')
      .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
          expect(res.body.length);
          done();
        });
      });

          // *** LISTAR clientes con cualquier otro filtro  ***
     it('Lista todos los clientes si no tiene un filtro valido', function(done) {
      api.get('/cliente?filtro=25')
      .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
          expect(res.body.length);
          done();
        });
      });


      // *** LISTAR clientes con cualquier otro filtro Nulo ***
     it('Lista todos los clientes si tiene un filtro nulo', function(done) {
      api.get('/cliente')
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
        "nombre": "javier Prado",
        "ruc": "20159753654",
        "direccion": "Santiago de Surco",
        "telefono": 940594630,
        "contacto1": "Simon",
        "email1": "simon@gmail.com",
        "contacto2": "",
        "email2": "",
        "estado_usuario":1,
        "detalleBuques":[]
      };

      it('Actualizando Clientes', function(done) {
        api.put('/cliente/' + idcliente1)
        .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
        .send(datos2)
        .expect(200)    
        .end(function(err, res) {
          if (err) return done(err);
    
          done();
        });
      });

// *** GET UPDATE ***
    it('Actualizar Cliente Validar', function(done) {
    api.get('/cliente/' + idcliente1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
  
        expect(res.body[0].nombre).eql( 'javier Prado' );
        expect(res.body[0].ruc).eql( '20159753654' );
        expect(res.body[0].direccion).eql( 'Santiago de Surco' );
        expect(res.body[0].telefono).eql( 940594630 );
        expect(res.body[0].contacto1).eql( 'Simon' );
        expect(res.body[0].email1).eql( 'simon@gmail.com' );
        expect(res.body[0].contacto2).eql( '' );
        expect(res.body[0].email2).eql( '' );

        
      //Muestra los datos en consola
        done();
      });
  });


  // *** UPDATE VALORES INCORRECTOS ***

    var datos5 = {
        "nombre": 23424,
        "ruc": 234234,
        "direccion": "miraflores",
        "telefono": "sadasdasd",
        "contacto1": "Pedro",
        "email1": "correo@gmail.com",
        "contacto2": "contacto2",
        "email2": "",
        "detalleBuques":[]
    };

    it('error por valores incorrectos', function(done) {
        api.put('/cliente/' + idcliente1)
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
        "nombre": "",
        "ruc": "",
        "direccion": "",
        "telefono": "",
        "contacto1": "",
        "email1": "",
        "contacto2": "",
        "email2": "",
        "detalleBuques":[]
    };

    it('error por valores nulos', function(done) {
        api.put('/cliente/' + idcliente1)
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
  it('Eliminacion de Cliente', function(done) {
    api.delete('/cliente/' + idcliente1)
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
            api.get('/cliente/' + idcliente1)
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
         it('Eliminacion de Cliente con Id que no existe', function(done) {
          api.delete('/cliente/' + idcliente1)
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
         it('Eliminacion de Cliente con valor nulo', function(done) {
          api.delete('/cliente/')
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
        "nombre": 234234234,
        "ruc": 23423423,
        "direccion": "Santiago de Surco",
        "telefono": "KJDSHFJSDHF",
        "contacto1": "Simon",
        "email1": "simon@gmail.com",
        "contacto2": "",
        "email2": "",
        "detalleBuques":[]
      };

      it('Creacion de Cliente', function(done) {
          api.post('/cliente')
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
        "nombre": "",
        "ruc": "",
        "direccion": "",
        "telefono": "",
        "contacto1": "",
        "email1": "",
        "contacto2": "",
        "email2": "",
        "detalleBuques":[]
      };

      it('no se puede crear Cliente por valores nulos', function(done) {
          api.post('/cliente')
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
        "nombre": "Prueba Actualizar",
        "ruc": "123445",
        "direccion": "miraflores",
        "telefono": 956783540,
        "contacto1": "Pedro",
        "email1": "correo@gmail.com",
        "contacto2": "contacto2",
        "email2": "",
        "detalleBuques":[]
    };



    it('No se puede actuzalizar Id no existe', function(done) {
        api.put('/cliente/' + idcliente1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos6)
            .expect(500)
            //.expect('Content-Type', /json/)
            .end(function(err, res) {
                 if (err) return done(err);
               
                  done();
            });
    });


});


