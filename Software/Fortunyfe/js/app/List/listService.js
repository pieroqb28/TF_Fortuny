HISList.factory('listService',['$resource','$q','$http','connStringSVC',function($resource,$q,$http,connStringSVC){

return{
		price:function(){
			return $resource(connStringSVC.urlBase() + '/price/:id', { id: '@_id' }, {
			
				save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
				query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
				get:     { method: 'GET', isArray: true,headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
				update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
				delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
				provFiltro:{ url: connStringSVC.urlBase() + '/ProveedorFiltro/:id' ,method: 'GET',headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },

				proveedorCC:{ url: connStringSVC.urlBase() + '/ProveedorCentroCosto' ,isArray: true,method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())}}
			});
		
		},
		list:function(){
			return $resource(connStringSVC.urlBase() + '/List/:id', { id: '@_id' }, {
		    
			  	save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	          	query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	         	get:     { method: 'GET', isArray: true,headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	provFiltro:{ url: connStringSVC.urlBase() + '/ProveedorFiltro/:id' ,method: 'GET',headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },

	          	proveedorCC:{ url: connStringSVC.urlBase() + '/ProveedorCentroCosto' ,isArray: true,method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())}}
		  	});
		
		},
		listxinfluencer:function(){
			return $resource(connStringSVC.urlBase() + '/ListxInfl/:id', { id: '@_id' }, {
		    
			  	save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	          	query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	         	get:     { method: 'GET', isArray: true,headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	provFiltro:{ url: connStringSVC.urlBase() + '/ProveedorFiltro/:id' ,method: 'GET',headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },

	          	proveedorCC:{ url: connStringSVC.urlBase() + '/ProveedorCentroCosto' ,isArray: true,method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())}}
		  	});
		
		},
		influencer:function(){
			return $resource(connStringSVC.urlBase() + '/Influencer/:id', { id: '@_id' }, {
		    
			  	save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	          	query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	         	get:     { method: 'GET', isArray: true,headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	provFiltro:{ url: connStringSVC.urlBase() + '/ProveedorFiltro/:id' ,method: 'GET',headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },

	          	proveedorCC:{ url: connStringSVC.urlBase() + '/ProveedorCentroCosto' ,isArray: true,method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())}}
		  	});
		
		},
		cargos:function(){
			return $resource(connStringSVC.urlBase() + '/CargoNombre/', { id: '@_id' }, {		    
	          	query:   { method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	          	save: 	 { url: connStringSVC.urlBase() + '/Cargo/', method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken()) } },
		  	});
		
		},
		facturasProveedores:function(){
			return $resource(connStringSVC.urlBase() + '/FacturacionProveedor/:id', { id: '@_id' }, {
		    
			  	save:    { method: 'POST', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	          	query:   { method: 'GET', isArray: true, headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  } },
	         	get:     { method: 'GET', isArray: true,headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	update:  { method: 'PUT' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	delete:  { method: 'DELETE' , headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())  }},
	          	detalleFactura:{ url: connStringSVC.urlBase() + '/detalleFacturaProveedor/:id' ,method: 'GET', headers: { 'Authorization': "Basic " + Base64.encode(connStringSVC.getToken())}}
		  	});
		
		},

}

}]);