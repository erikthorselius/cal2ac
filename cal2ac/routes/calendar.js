var entrys = require('./entrys');
exports.show = function(req, res){
  entrys.get(function (array) {
  console.log(array);
  });
  res.send("Ok")
};
