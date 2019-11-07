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

describe('GRUPO DE APROBACION', function() {

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
  var fechaRequerida = new Date();
  var time = fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idGrupo1 = 0;

    before(function(done){
        var datos1 = {
            "nombre": "Prueba 1",
            "tipo_aprobacion_id": 1,
            "usuario_creacion": 1,
            "usuarios": [
                            {
                                "usuario_id": 1,
                                "fecha_inicio": "2016-02-02",
                                "fecha_fin": "2016-12-02",
                            },
                            {
                                "usuario_id": 2,
                                "fecha_inicio": "2016-02-02",
                                "fecha_fin": "2016-12-02",
                            }
            ]
        };

        it('Creacion de Grupo', function(done) {
            api.post('/GrupoAprobacion')
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
                .send(datosC)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err){
                        return done(err);
                    }else{
                        expect(res.body).to.have.property('id');
                        idGrupo1 = res.body.id;
                        done();
                    }
                });
        });
    });


    /* GET DE CREACION */

    it('Muestra de Grupo de Aprobacion Creado', function(done) {
        api.get('/GrupoAprobacion/' + idGrupo1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err){
                    return done(err);
                }else{
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('nombre');
                    expect(res.body).to.have.property('tipo_aprobacion_id');
                    expect(res.body).to.have.property('fecha_creacion');
                    expect(res.body).to.have.property('usuario_creacion');
                    expect(res.body).to.have.property('fecha_modificacion');
                    expect(res.body).to.have.property('usuario_modificacion');
                    done();
                }
        });
    });

    /* ACTUALIZACION */
    // En la actualizacion, los usuarios del grupo no se modifican.
    // Estos se modifican individualmente
    var datos12 = {
        "nombre": "Prueba 1 - 2",
        "tipo_aprobacion_id": 1
    };

    it('Actualizacion de Grupo', function(done) {
        api.put('/GrupoAprobacion/' + idGrupo1)
            .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
            .send(datos12)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err){
                    return done(err);
                }else{
                    expect(res.body).to.have.property('id');
                    idGrupo1 = res.body.id;
                    done();
                }
            });
    });

    before (function(done){
        /* ELIMINACION DE GRUPO */
        it('Eliminacion de Grupo', function(done) {
            api.delete('/GrupoAprobacion/' + idGrupo1)
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
                .send(datos7)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    done();
            });
        });

        /* GET DE ELIMINACION */
        it('GET de Grupo Eliminado', function(done){
            api.get('/GrupoAprobacion/' + idGrupo1)
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
        it('Actualizacion de Grupo Eliminado', function(done) {
            api.put('/GrupoAprobacion/' + idGrupo1)
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
    });


    /* CREACION SIN USUARIOS */

    var idGrupo2 = 0;
    before(function(done){
        datos2 = {
            "nombre": "Prueba 1",
            "tipo_aprobacion_id": 1,
            "usuario_aprobacion": 1
        }

        it('Creacion de Grupo', function(done) {
            api.post('/GrupoAprobacion')
                .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
                .send(datosC)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err){
                        return done(err);
                    }else{
                        expect(res.body).to.have.property('id');
                        idGrupo2 = res.body.id;
                        done();
                    }
                });
        });
    });

    /* Se elimina el grupo creado */
    /* Esto no es una prueba propiamente dicha, solo se elimina la data que se acaba de registrar. */
    if (idGrupo2 > 0){
        api.get('/GrupoAprobacion/' + idGrupo2)
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
    }
});
