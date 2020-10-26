'use strict';

// Defining Application Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY= process.env.TRAIL_API_KEY;
const app = express();
//--------------
app.use(cors());

//---------------
// Routes
app.get('/weather', getWeather)
app.get('/',welcomePage)
app.get('/location', getLocation)
app.get('/trails', getTrails)

app.use('*', (request, resp) => {
  resp.status(404).send('Not found!!');
})
//-------------------------------------
//functions

function welcomePage(request, response){
  response.send('Home Page Welcome to express');
}
//----
function getLocation(request, response){
  const city = request.query.city;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
  let location;
  superagent.get(url).then(locationData => {
    location = new Location(city, locationData.body[0]);
    response.json(location);
  }).catch(() => {
    response.status(500).send('Sorry,something went wrong');
  })
}
//----
function getWeather(request, response) {
  const city = request.query.search_query;
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;
  let weather = [];
  superagent.get(url).then(weatherData => {
    weather = weatherData.body.data.map((value) => {
      return (new Weather(value));
    });
    response.json(weather);
  }).catch(() => {
    response.status(500).send('Sorry,something went wrong');
  })
}
//----
function getTrails(request, response){
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${TRAIL_API_KEY}`;
  let trails = [];
  superagent.get(url).then(trailsData => {
    trails = trailsData.body.trails.map((value) => {
      return (new Trail(value));
    });
    response.json(trails);
  }).catch(() => {
    response.status(500).send('Sorry,something went wrong');
  })
}
//------------------------------
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

function Trail(trailData){
  this.name=trailData.name;
  this.location=trailData.location;
  this.length=trailData.length;
  this.stars=trailData.stars;
  this.star_votes=trailData.starVotes;
  this.summary=trailData.summary;
  this.trail_url=trailData.url;
  this.conditions=trailData.conditionStatus;
  this.condition_date=trailData.conditionDate.split(' ')[0];
  this.condition_time=trailData.conditionDate.split(' ')[1];

}

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
