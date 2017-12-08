let mongoose = require('mongoose');

let busquedaSchema = mongoose.Schema({
	"term": {
		type: String
	},
	"when": {
		type: Date
	}
});

let Busqueda = module.exports = mongoose.model('Busqueda', busquedaSchema);
//Node & Express from Scratch
//https://www.youtube.com/watch?v=k_0ZzvHbNBQ&list=PLillGF-RfqbYRpji8t4SxUkMxfowG4Kqp