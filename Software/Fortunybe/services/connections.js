exports.database = function(app) {
  var controller = new exports.DomainController();
  var route = '/domains';
  app.post(route, controller.create);
  app.put(route, api.needId);
  app.delete(route, api.needId);
  route = '/domains/:id';
  app.put(route, controller.loadDomain, controller.update);
  app.del(route, controller.loadDomain, function(req, res){
    res.sendJSON(req.domain, status.OK);
  });
}