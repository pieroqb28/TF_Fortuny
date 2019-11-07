HISLogin.factory('Session', ['$resource', '$cookieStore', function ($resource, $cookieStore) {

	var serviciosBase="http://157.245.86.94:8052";
	

	var getToken = localStorage.getItem('sJWT');

	return {
		urlBase: function () {
            return serviciosBase;
        },
		authUser: function () {
			return $resource(serviciosBase + '/HS_Autenticar', {}, {
				update: {
					method: 'PUT'
				}
			});

		},

		recuperarPassword: function () {
			return $resource(serviciosBase + '/HS_Usuario/:id', { id: '@_id' }, {
				recupPassword: { url: serviciosBase + '/HS_Usuario/recuperarPswd', method: 'POST' }
			});
		},

		CambiarPswd: function () {

			return $resource(serviciosBase + '/HS_Usuario/:id', { id: '@_id' }, {
				nuevoPassword: { url: serviciosBase + '/HS_Usuario/nuevoPswd', method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(localStorage.getItem('sJWT')) } },
			});

		},
		mensajeEnvioEmail: function (cb) {

			$('#popupEnvioEmail').modal('show');
			setTimeout(function () {
				$('#popupEnvioEmail').modal('hide');
				setTimeout(function () {
					return cb(200);
				}, 800);
			}, 2000);
		},
		mensajeUpdate: function (cb) {

			$('#popupMensajesUpdate').modal('show');
			setTimeout(function () {
				$('#popupMensajesUpdate').modal('hide');
				setTimeout(function () {
					return cb(200);
				}, 800);
			}, 2000);
		},
		logginPswdIncorrecto: function () {
			$('#popupDatosIncorrectos').modal('show');
			setTimeout(function () {
				$('#popupDatosIncorrectos').modal('hide');
			}, 3000);
		}

	}
}])

