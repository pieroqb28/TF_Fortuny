module.exports = function (app) {
  app.route('/VersionFE')
  .get(function(req, res) {
       var feversion = 10021;
       res.status(200).json({version:feversion});
  	
  })


}