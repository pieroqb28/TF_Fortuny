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

//var articulo = global.db.models.articulo;

describe('ARTICULO - SEGURIDAD', function() {

  // *** AUTENTICACION  (TOKEN ERRONEA) ***
  it('No tiene acceso por el token incorrecto', function(done) {
      api.get('/articulo')
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

describe('ARTICULO', function() {

  /*CREAR ARTICULO*/
  var fechaRequerida = new Date();
  var time=fechaRequerida.getHours()+':'+fechaRequerida.getMinutes()+':'+fechaRequerida.getSeconds();
  var idarticulo1=0;

  //before(function(done){
      var datos1 = {
        "nombre": "Motor-XP",
        "descripcion": "200 Caballos de FZ",
        "precioCompra": "5.000",
        "precioVenta": "6.000",
        "tipo_id": 1
      };

      it('Creacion de Articulo', function(done) {
          api.post('/Articulo')
              .set('Authorization', 'Basic ' + new Buffer(tokenLogin).toString('base64'))
              .send(datos1)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err){
                    return done(err);
                  }else{
                    expect(res.body).to.have.property('id');
                    idarticulo1 = res.body.id;
                    done();
                  }
              });
      });
  //});

  // *** LISTAR TODOS ***
  it('Lista de Articulos', function(done) {
    api.get('/Articulo')
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

  /* ELIMINACION DE ARTICULO */
  it('Eliminacion de Articulo', function(done) {
    api.delete('/Articulo/' + idarticulo1)
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

});


