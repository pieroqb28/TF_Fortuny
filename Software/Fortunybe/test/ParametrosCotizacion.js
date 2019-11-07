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

describe('PARÁMETROS DE COTIZACION', function() {

   // *** AUTENTICACION  (TOKEN ERRONEA) ***
    it('No tiene acceso por el token incorrecto', function(done) {
        api.get('/CxCFacturas')
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

    // *** CREACION ***
 // var fechaRequerida = new Date();
  //var time = fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idParámetro1 = 0;

    //before(function(done){
        var datos1 = {
            "nombre": "Prueba 1",
            "categoria_id": 1,
            "texto": "prueba texto"         
        };

        it('Creacion de Parámetros', function(done) {
            api.post('/TextoCotizacion')
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
                .send(datos1)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err){
                        return done(err);
                    }else{
                       expect(res.body).to.have.property('id');
                        idParámetro1 = res.body.id;   

                        done();
                    }
                });
        });
 //   });


       /* GET DE CREACION */

    it('Muestra el parámetro Creado', function(done) {
        api.get('/TextoCotizacion/' + idParámetro1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err){
                    return done(err);
                }else{
                    //expect(res.body).to.be.an('object');
                    
                    expect(res.body.length);
                    done();
                }
        });
    });

     /* ACTUALIZACION */
    var datos12 = {
        "nombre": "Prueba 1 - 2",
        "categoria_id": 1,
        "texto": "Prueba Actualización",
    };

    it('Actualizacion de Parámetro de Cotización', function(done) {
        api.put('/TextoCotizacion/' + idParámetro1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos12)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err){
                    return done(err);
                }else{
                    expect(res.body).to.have.property('id');
                    idParámetro1 = res.body.id;
                    done();
                }
            });
    });


  //  before (function(done){
        /* ELIMINACION DE GRUPO */
        it('Eliminacion de Parámetro de Cotización', function(done) {
            api.delete('/TextoCotizacion/' + idParámetro1)
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
             //   .send(datos7)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    done();
            });
        });

        /* GET DE ELIMINACION */
        it('GET de Parámetro de Cotización Eliminado', function(done){
            api.get('/TextoCotizacion/' + idParámetro1)
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

        /* PUT DE ID ELIMINADO */
        it('Actualizacion de Parámetro de Cotización Eliminado', function(done) {
            api.put('/TextoCotizacion/' + idParámetro1)
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
                .send(datos12)
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
   // });

});