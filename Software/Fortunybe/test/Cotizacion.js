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

//var cotizacion = global.db.models.cotizacion;

describe('COTIZACION', function() {

// *** AUTENTICACION  (TOKEN ERRONEA) ***
it('No tiene acceso por el token incorrecto', function(done) {
    api.get('/cotizacion')
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

/*CREAR COTIZACION*/
var fechaRequerida = new Date();
var time=fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
var idcotizacion1=0;

//before(function(done){
  datos1 = {
      "descripcion": "Cotizacion Prueba",
      "cliente_id": 147,
      "numero": "C-0001",
      "fecha": "2016-02-15",
      "numero_oferta": "1",
      "totalImpuestos": 150.00,
      "totalAdicional": 50.00,
      "totalDetalle": 200.00,
      "total": 400.00,
      "grupo_aprobacion_id": 1,
      "detalles": [{
          "posicion": 1,
          "articulo_id": 1,
          "cantidad": 10,
          "precio_unitario": 20.00,
          "sub_total": 200.00
      }]
  }

  it('Creacion de Cotizacion', function(done) {
      api.post('/cotizacion')
          .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
          .send(datos1)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
              if (err){
                  return done(err);
              }else{
                  expect(res.body).to.have.property('id');
                  idcotizacion1 = res.body.id;
                  done();
              }
          });
  });
//});

  // *** LISTAR TODOS ***
   it('Lista de Cotizaciones', function(done) {
    api.get('/cotizacion')
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
        expect(res.body.length);
        done();
      });
    });

   /* LISTAR EL CREADO */
  it('Lista de Cotizacion Creada', function(done) {
    api.get('/cotizacion/' + idcotizacion1)
    .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err){
        return done(err);
      }else{
        expect(res.body.length);
        done();
      }
    });
  });

  /* ACTUALIZACION DE COTIZACION */
  var datosAct = {
      "descripcion": "Cotizacion Prueba",
      "cliente_id": 147,
      "numero": "C-0001",
      "fecha": "2016-02-15",
      "numero_oferta": "1",
      "totalImpuestos": 10.00,
      "totalAdicional": 20.00,
      "totalDetalle": 70.00,
      "total": 100.00,
      "grupo_aprobacion_id": 2,
      "detalles": [
                    {
                      "posicion": 1,
                      "articulo_id": 1,
                      "cantidad": 5,
                      "precio_unitario": 10.00,
                      "sub_total": 50.00
                    },
                    {
                      "posicion": 2,
                      "articulo_id": 1,
                      "cantidad": 10,
                      "precio_unitario": 2.00,
                      "sub_total": 20.00
                    }
      ]
  }

  it('Actualizacion de Cotizacion', function(done) {
    api.put('/cotizacion/' + idcotizacion1)
      .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
      .expect(200)
      .send(datosAct)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err){
          return done(err);
        }else{
          done();
        }
      });
  });

  /* ELIMINACION DE COTIZACION */
  it('Eliminacion de Cotizacion', function(done) {
    api.delete('/cotizacion/' + idcotizacion1)
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


  /* CREAR COTIZACION CON MONTOS INCOHERENTES*/
  var fechaRequerida = new Date();
  var time=fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idcotizacion1=0;

  datos2 = {
      "descripcion": "Cotizacion Prueba 2",
      "cliente_id": 147,
      "numero": "C-0002",
      "fecha": "2016-02-15",
      "numero_oferta": "1",
      "totalImpuestos": 150.00,
      "totalAdicional": 50.00,
      "totalDetalle": 200.00,
      "total": 400.00,
      "grupo_aprobacion_id": 1,
      "detalles": [
                    {
                      "posicion": 1,
                      "articulo_id": 1,
                      "cantidad": 10,
                      "precio_unitario": 20.00,
                      "sub_total": 200.00
                    },
                    {
                      "posicion": 2,
                      "articulo_id": 1,
                      "cantidad": 10,
                      "precio_unitario": 20.00,
                      "sub_total": 200.00
                    }
      ]
  }

  it('Creacion de Cotizacion con montos incoherentes', function(done) {
      api.post('/cotizacion')
          .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
          .send(datos2)
          .expect(400)
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


