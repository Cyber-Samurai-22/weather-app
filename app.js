import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import 'dotenv/config.js';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { weather: null, error: null });
});

app.post('/', async (req, res) => {
  const cityName = req.body.cityName;
  const apiKey = process.env.API_KEY;

  // Get the geographic coordinates (lat, lon) for the city
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${apiKey}`;

  try {
    const geoResponse = await axios.get(geoUrl);
    const geoData = geoResponse.data[0];

    if (!geoData) {
      throw new Error('City not found');
    }

    const { lat, lon } = geoData;

    // Get weather data using the Weather API with the obtained coordinates
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const weatherResponse = await axios.get(weatherUrl);
    const weather = weatherResponse.data;

    const weatherData = {
      city: weather.name,
      temperature: weather.main.temp,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
    };

    res.render('index', { weather: weatherData, error: null });
  } catch (error) {
    console.error(error.message);
    res.render('index', { weather: null, error: 'Error, please try again' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
