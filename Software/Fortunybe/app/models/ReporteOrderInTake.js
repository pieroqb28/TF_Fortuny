module.exports = function (db, cb) {
  global.db.define("reporte_order_intake", {
  	
  	item: {
	      type: 'text',
	      
	},
	 cliente: {
	      type: 'text',
	      
	},
	num_orden: {
	      type: 'text',
	      
	},
	 articulo: {
	      type: 'text',
	      
	},
	
	moneda: {
	      type: 'text',
	},
	valor:{
		type: 'text'
	},	
	
	year_related: {
	      type: 'text',
	      
	},
	 month_related: {
	      type: 'text',
	      
	},
	detalles: {
	      type: 'text',	      
	},
	usuario_creacion: {
	      type: 'number',	      
	},
	fecha_creacion: {
	      type: 'date',	      
	},



  }, {
    	cache   : false
	});
  
   return cb();
};