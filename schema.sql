  
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS Weathers;
DROP TABLE IF EXISTS Trails;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    display_name VARCHAR(255),
    lat NUMERIC(10, 7),
    lon NUMERIC(10, 7)
  );

CREATE TABLE Weathers (
    id SERIAL PRIMARY KEY,
    forecast VARCHAR(500),
    time_ VARCHAR(500)
  );

CREATE TABLE Trails (
    id SERIAL PRIMARY KEY,
    tName VARCHAR(255),
    tLocation VARCHAR(255),
    tLength NUMERIC(10, 2),
    stars NUMERIC(1),
    star_votes NUMERIC(10),
    summary VARCHAR(3000),
    trail_url VARCHAR(3000),
    conditions VARCHAR(255),
    condition_date VARCHAR(500),
    condition_time time
  );

