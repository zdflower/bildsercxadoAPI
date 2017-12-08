const PIXABAY_KEY = process.env.PIXABAY_KEY;
const searchAPI = require('pixabay-api');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const url = require('url');

/* conectar la base de datos */
//Node & Express from Scratch
//https://www.youtube.com/watch?v=k_0ZzvHbNBQ&list=PLillGF-RfqbYRpji8t4SxUkMxfowG4Kqp
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var mlab = process.env.MONGODB_URI;
var promise = mongoose.connect(mlab, {useMongoClient: true});

let db = mongoose.connection;

promise.then(function(db){
	console.log('Connected to mongodb');
});

let Busqueda = require('./models/busqueda');

/* Contenido estático */
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

/* rutas */
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/imagesearch/:buscar(*)", function (request, response) {

  let busqueda = request.params.buscar; //según la api de pixabay, no debe exceder los 100 caracteres
  
  let offset = url.parse(request.url, true).query.offset || 10;
  
  console.log("Busqueda original: " + busqueda);
  console.log("Offset: " + offset);
  console.log("Buscando " + busqueda + " en https://pixabay.com/ ...");  
  
  archivarBusqueda(busqueda);
    
  obtenerYEnviarDatos(response, busqueda, offset);
  
});

app.get("/api/latests/imagesearch/", function (request, response) {
	console.log("Últimas búsquedas.");
	obtenerUltimasBusquedas(response);
});

// listen for requests :)
var listener = app.listen(process.env.PORT | 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


/* Auxiliares */

function archivarBusqueda(busqueda) {
	//¿Qué test sería necesario antes de guardar algo en una base de datos?

  let document = new Busqueda();
  document.term = busqueda;
  document.when = new Date();
  
  document.save(function(err) {
    if (err) console.log(err);
    else {
     console.log("Guardado ok.") 
    }
  });
}

function obtenerYEnviarDatos(response, busqueda, offset) {
  	console.log("Consultando en pixabay.");
	
	let resultados = [];
	
	searchAPI.searchImages(PIXABAY_KEY, busqueda, {'per_page': offset}).then((data) => {

		if (parseInt(data.totalHits) > 0){
			data.hits.forEach(function(hit) {
        		let res = {
          			"url": hit.webformatURL,
          			"tags": hit.tags,
          			"thumbnail": hit.previewURL,
          			"context": hit.pageURL
        		};
        		resultados.push(res);
      		});
  		} else {
      		console.log('No hits');
  		}
  		response.send(resultados);
	}); 
}

function obtenerUltimasBusquedas(response) {
  //5 búsquedas desde ayer
  //sólo los campos when y term
  const MS_EN_UN_DIA =  (24 * 60 * 60 * 1000);
  let haceUnDia = Date.now() - MS_EN_UN_DIA;

  //http://mongoosejs.com/docs/queries.html
  Busqueda.find({"when": {"$gte": new Date(haceUnDia)}}, {"when": 1, "term": 1, "_id": 0}, function (err, resultados) {
  	if (err) return handleError(err);
  	else response.send(resultados);
  }).limit(5);
}