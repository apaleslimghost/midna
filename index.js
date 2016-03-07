var doRows = require('./rows');
var draw = require('./draw');

module.exports = items => draw(doRows(items));
