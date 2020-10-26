s'use strict';

// Defining Application Dependencies
const express = require('express');
omeeomeconst superagent = require('superagent');
const cors = require('cors')
require('dotenv').config()


const PORT = process.env.PORT || 3000;
const GEOKEY = process.env.GEOKEY;
const WEATHERKEY = process.env.WEATHERKEY;


const app = express();
app.use(cors());

// Routes
app.get('/', (reqeust, response) => {
  response.send('Home Page Welcome to express');
});

app.get('/location', (request, response) => {
  const city = request.query.city;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOKEY}&q=${city}&format=json`;
  let location;
  superagent.get(url).then(locationData => {
    location = new Location(city, locationData.body[0]);
    console.log(location);
    response.json(location);
  }).catch(error => {
    response.json(error.response)
  }
  )
});


app.get('/weather', (request, response) => {
  const city = request.query.search_query;
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  const url = `https://api.weatherbit.io/v2.0/current?city=${city}&lat=${latitude}&lon=${longitude}.543&key=${WEATHERKEY}`;
  let weather = [];
  superagent.get(url).then(locationData => {
    locationData.body.data.forEach(element => {
      weather.push(new Weather(element));
    });
    response.json(weather);
  }).catch((error) => {
    response.json(error.response)
  })

});

app.use('*', (request, resp) => {
  resp.status(500).send('Not found');
})

// Constructor
function Location(city, locationDatabody) {
  this.search_query = city;
  this.formatted_query = locationDatabody.display_name;
  this.latitude = locationDatabody.lat;
  this.longitude = locationDatabody.lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.datetime;
}

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
