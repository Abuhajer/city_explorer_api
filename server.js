'use strict';

// Defining Application Dependenciess
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 3000;
const app = express();
const pg = require('pg');
//--
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const MOVIE_API_KEY=process.env.MOVIE_API_KEY;
const YELP_API_KEY =process.env.YELP_API_KEY ;
//--------------
app.use(cors());
const client = new pg.Client(DATABASE_URL);

//---------------
// Routes
app.get('/weather', getWeather)
app.get('/', welcomePage)
app.get('/location', getLocation)
app.get('/trails', getTrails)
app.get('/movies', getMovies)
app.get('/yelp', getYelps)

app.use('*', (request, resp) => {
  resp.status(404).send('Not found!!');
})
//-------------------------------------
//functions

function welcomePage(request, response) {
  response.send('Home Page Welcome to express');
}
//----
function getLocation(request, response) {
  const city = request.query.city;
  let location;
  const findLocation = 'SELECT * FROM locations WHERE search_query=$1;';
  const safeArray = [city];
  client.query(findLocation, safeArray).then(result => {
    if (result.rows!==[]) {
      location = new Location(city, result.rows[0]);
      console.log('from Database');
      response.json(location);
    }
  }).catch(() => {
    let url = `https://eu1.locationiq.com/v1/search.php`;
    let queryParemeter={
      key:GEOCODE_API_KEY,
      q:city,
      format:'json'
    };
    superagent.get(url).query(queryParemeter).then(locationData => {
      location = new Location(city, locationData.body[0]);
      console.log('from API');
      const insertLocation = 'INSERT INTO locations (search_query,display_name,lat,lon) VALUES ($1,$2,$3,$4)';
      const safeArray = [location.search_query, location.formatted_query, location.latitude, location.longitude];
      try {
        client.query(insertLocation, safeArray);
      } catch (error) {
        console.log('cant execute the query ');
      }
      response.json(location);
    }).catch(() => {
      response.status(500).send('Sorry,something went wrong');
    })
  })
}
//----
function getWeather(request, response) {
  const city = request.query.search_query;
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily`;
  let queryParemeter={
    city:city,
    lat:longitude,
    lon:latitude,
    key:WEATHER_API_KEY,
    format:'json'
  };
  let weather = [];
  superagent.get(url).query(queryParemeter).then(weatherData => {
    weather = weatherData.body.data.map((value) => {
      return (new Weather(value));
    });
    response.json(weather);
  }).catch(() => {
    response.status(500).send('Sorry,something went wrong');
  })
}
//----
function getTrails(request, response) {
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  const url = `https://www.hikingproject.com/data/get-trails`;
  let queryParemeter={
    lat:longitude,
    lon:latitude,
    key:TRAIL_API_KEY,
    format:'json'
  };
  let trails = [];
  superagent.get(url).query(queryParemeter).then(trailsData => {
    trails = trailsData.body.trails.map((value) => {
      return (new Trail(value));
    });
    response.json(trails);
  }).catch(() => {
    response.status(500).send('Sorry,something went wrong');
  })
}
//----
function getMovies(request, response) {
  const region = request.query.search_query.slice(0,2).toUpperCase();
  const page=request.query.page;
  const url = `https://api.themoviedb.org/3/movie/top_rated`;
  //passing parameters
  let queryParemeter={
    region:region,
    page:page,
    api_key:MOVIE_API_KEY,
    format:'json'
  };
  let movies = [];
  superagent.get(url).query(queryParemeter).then(moviesData => {
    movies = moviesData.body.results.map((value) => {
      return (new Movie(value));
    });
    response.json(movies);
  }).catch(() => {
    response.status(500).send('Sorry,something went wrong');
  })
}
//----
function getYelps(request, response) {
  const region = request.query.search_query;
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  const page=request.query.page;
  let offset=5*(page-1);
  const url = `https://api.yelp.com/v3/businesses/search`;
  //passing parameters
  let queryParemeter={
    location:region,
    latitude:latitude,
    longitude:longitude,
    api_key:YELP_API_KEY,
    offset:offset,
    limit:5,
    categories:'Restaurants ',
    format:'json'
  };
  //----
  let yelps = [];
  superagent.get(url).query(queryParemeter).set('Authorization', `Bearer ${YELP_API_KEY}`).then(yelpsData => {
    console.log(yelpsData)
    yelps = yelpsData.body.businesses.map((value) => {
      return (new Yelp(value));
    });
    response.json(yelps);
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

function Trail(trailData) {
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.url;
  this.conditions = trailData.conditionStatus;
  this.condition_date = trailData.conditionDate.split(' ')[0];
  this.condition_time = trailData.conditionDate.split(' ')[1];

}

function Movie(MovieData) {
  this.title = MovieData.title;
  this.overview = MovieData.overview;
  this.average_votes = MovieData.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w500/${MovieData.poster_path}`;
  this.popularity = MovieData.popularity;
  this.released_on = MovieData.release_date;

}


function Yelp(yelpData) {
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating =yelpData.rating;
  this.url = yelpData.url;

}

client.connect().then(()=>{
  app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));
});
