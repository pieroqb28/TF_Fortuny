var    jwt = require('jsonwebtoken');
var datosLogin = {
   usuario : usuarioAcceso,
   contrasena: passAcceso
}
var sJWT = jwt.sign(datosLogin, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=", {
  expiresIn :"1h",
  audience : "http://localhost"
})
var theAccount = {
  jwt: sJWT

}
describe('Login', function() {

  it('Logs It', function(done) {
    api.post('/HS_Autenticar')
    .send(theAccount)
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      expect(res.body).to.have.property('JWT');
      tokenLogin = res.body.JWT;
      done();
    });
  });


datosLogin = {
   usuario : "roberto.quispe@holinsys.pe",
   contrasena: "CORREOERRONEO"
}
sJWT = jwt.sign(datosLogin, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=", {
  expiresIn :"1h",
  audience : "http://localhost"
})
var theAccountFalse = {
  jwt: sJWT
}

  it('no ingresas sin password correcto', function(done) {
    api.post('/HS_Autenticar')
    .send(theAccountFalse)
    .expect(401)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      done();
    });
  });

datosLogin = {
   usuario : "",
   contrasena: "CORREOERRONEO"
}
sJWT = jwt.sign(datosLogin, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=", {
  expiresIn :"1h",
  audience : "http://localhost"
})

theAccountFalse2 = {
  jwt: sJWT
}
    it('no se cae si el user va vacio', function(done) {
    api.post('/HS_Autenticar')
    .send(theAccountFalse2)
    .expect(401)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      done();
    });
  });

datosLogin = {
   usuario : "pruebas@holinsys.pe",
   contrasena: ""
}
sJWT = jwt.sign(datosLogin, "Vbxq2mlbGJw8XH+ZoYBnUHmHga8/o/IduvU/Tht70iE=", {
  expiresIn :"1h",
  audience : "http://localhost"
})

theAccountFalse3 = {
  jwt: sJWT
}

  it('no se cae si el pass va vacio', function(done) {
    api.post('/HS_Autenticar')
    .send(theAccountFalse3)
    .expect(401)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      done();
    });
  });


});


