import { useState, useEffect } from "react";
import axios from "axios";

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return <div className="error">{message}</div>;
};

const Weather = ({ capital, apiKey, setErrorMessage }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!capital || !apiKey) return;

    const encodedCapital = encodeURIComponent(capital);
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodedCapital}&units=metric&appid=${apiKey}`,
      )
      .then((response) => {
        setWeather(response.data);
      })
      .catch((error) => {
        console.error("Virhe sään hakemisessa:", error);
        setErrorMessage(`Failed to fetch weather data for ${capital}`);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      });
  }, [capital, apiKey]);

  if (!weather) {
    return null;
  }

  const iconCode = weather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <p>temperature {weather.main.temp} Celsius</p>
      <img src={iconUrl} alt={weather.weather[0].description} />
      <p>wind {weather.wind.speed} m/s</p>
    </div>
  );
};

const CountryDetail = ({ country, setErrorMessage }) => {
  const apiKey = import.meta.env.VITE_SOME_KEY;
  const languages = country.languages ? Object.values(country.languages) : [];
  const capital = country.capital ? country.capital[0] : null;

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>capital {capital || "N/A"}</p>
      <p>area {country.area}</p>

      <h3>languages:</h3>
      <ul>
        {languages.map((lang) => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>

      {country.flags?.png && (
        <img
          src={country.flags.png}
          alt={`Flag of ${country.name.common}`}
          width="150"
        />
      )}

      {capital && (
        <Weather
          capital={capital}
          apiKey={apiKey}
          setErrorMessage={setErrorMessage}
        />
      )}
    </div>
  );
};

const Content = ({ countries, setFilter, setErrorMessage }) => {
  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>;
  }

  if (countries.length > 1) {
    return (
      <div>
        {countries.map((country) => (
          <div key={country.cca3}>
            {country.name.common}{" "}
            <button onClick={() => setFilter(country.name.common)}>show</button>
          </div>
        ))}
      </div>
    );
  }

  if (countries.length === 1) {
    return (
      <CountryDetail country={countries[0]} setErrorMessage={setErrorMessage} />
    );
  }

  return <p>No matches found</p>;
};

function App() {
  const [value, setValue] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  console.log("Viten lukema avain:", import.meta.env.VITE_SOME_KEY);
  
  useEffect(() => {
    axios
      .get("https://studies.cs.helsinki.fi/restcountries/api/all")
      .then((response) => {
        setAllCountries(response.data);
      })
      .catch((error) => {
        console.error("Virhe maiden hakemisesessa:", error);
        setErrorMessage("Failed to load countries data from server");
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      });
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const countriesToShow =
    value.trim() === ""
      ? []
      : allCountries.filter((country) =>
          country.name.common.toLowerCase().includes(value.toLowerCase()),
        );

  return (
    <div>
      <Notification message={errorMessage} />
      find countries <input value={value} onChange={handleChange} />
      {value.trim() !== "" && (
        <Content
          countries={countriesToShow}
          setFilter={setValue}
          setErrorMessage={setErrorMessage}
        />
      )}
    </div>
  );
}

export default App;
