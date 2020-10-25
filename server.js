'use strict';

// Defining Application Dependencies
const express = require('express');
const cors = require('cors')
require('dotenv').config()


const PORT = process.env.PORT || 3000;


const app = express();
app.use(cors());

// Routes
app.get('/', (reqeust, response) => {
  response.send('Home Page Welcome to express');
});

app.get('/location', (request, response) => {
  const locationData = require('./data/location.json');
  const city = request.query.city;
  let location;
  locationData.forEach(locationData => {
    let display = locationData.display_name.split(',');
    if (city === display[0].toLowerCase()) {
      location = new Location(city, locationData);
      response.json(location);
    }
  });
});

app.get('/weather', (request, response) => {
  const weatherData = require('./data/weather.json');
  const city = request.query.city;
  let weather = [];
  weatherData.data.forEach(locationData => {
    // let display=locationData.display_name.split(',');
    if (city === weatherData['city_name'].toLowerCase()) {
      weather.push(new Weather(locationData));
    }
    response.json(weather);

  });
});

app.use('*', (request, resp) => {
  resp.status(404).send('Not found');
})


// Constructor
function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.datetime;
}

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
