import React, { useState } from "react";
import {
  Search,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Calendar,
  MapPin,
} from "lucide-react";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Lista de cidades populares para sugestões (fallback)
  const popularCities = [
    "São Paulo, BR",
    "Rio de Janeiro, BR",
    "Belo Horizonte, BR",
    "Salvador, BR",
    "Brasília, BR",
    "Curitiba, BR",
    "Recife, BR",
    "Porto Alegre, BR",
    "Fortaleza, BR",
    "Manaus, BR",
    "Belém, BR",
    "Goiânia, BR",
    "Araruama, BR",
    "Cabo Frio, BR",
    "Saquarema, BR",
    "Niterói, BR",
    "Petrópolis, BR",
    "London, GB",
    "New York, US",
    "Paris, FR",
    "Tokyo, JP",
    "Madrid, ES",
    "Rome, IT",
    "Berlin, DE",
    "Amsterdam, NL",
  ];

  // Função para buscar sugestões de cidades usando a API
  const searchCitySuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Primeiro, filtrar da lista local
      const localSuggestions = popularCities
        .filter((cityName) =>
          cityName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3);

      // Buscar na API para sugestões mais precisas
      const response = await fetch(
        `${BASE_URL}/find?q=${query}&appid=${API_KEY}&units=metric&cnt=5`
      );

      if (response.ok) {
        const data = await response.json();
        const apiSuggestions = data.list.map(
          (city) => `${city.name}, ${city.sys.country}`
        );

        // Combinar sugestões locais e da API, removendo duplicatas
        const allSuggestions = [
          ...new Set([...localSuggestions, ...apiSuggestions]),
        ];
        setSuggestions(allSuggestions.slice(0, 5));
        setShowSuggestions(true);
      } else {
        // Se API falhar, usar apenas sugestões locais
        setSuggestions(localSuggestions);
        setShowSuggestions(localSuggestions.length > 0);
      }
    } catch {
      // Em caso de erro, usar apenas sugestões locais
      const localSuggestions = popularCities
        .filter((cityName) =>
          cityName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(localSuggestions);
      setShowSuggestions(localSuggestions.length > 0);
    }
  };

  // Função para adicionar cidade às buscas recentes
  const addToRecentSearches = (cityName) => {
    setRecentSearches((prev) => {
      const updated = [cityName, ...prev.filter((item) => item !== cityName)];
      return updated.slice(0, 5); // Manter apenas 5 buscas recentes
    });
  };

  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = "https://api.openweathermap.org/data/2.5";

  // Função para buscar dados do clima atual
  const fetchWeatherData = async (cityName) => {
    try {
      setLoading(true);
      setError("");
      setShowSuggestions(false);

      const response = await fetch(
        `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=pt_br`
      );

      if (!response.ok) {
        throw new Error("Cidade não encontrada");
      }

      const data = await response.json();
      setWeatherData(data);

      // Adicionar às buscas recentes
      addToRecentSearches(`${data.name}, ${data.sys.country}`);

      // Buscar previsão de 5 dias
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=pt_br`
      );

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        setForecastData(forecastData);
      }
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter ícone do clima
  const getWeatherIcon = (main, size = "w-6 h-6") => {
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun className={`${size} text-yellow-400`} />;
      case "clouds":
        return <Cloud className={`${size} text-gray-300`} />;
      case "rain":
        return <CloudRain className={`${size} text-blue-400`} />;
      case "snow":
        return <CloudSnow className={`${size} text-blue-200`} />;
      default:
        return <Cloud className={`${size} text-gray-300`} />;
    }
  };

  // Função para buscar ao pressionar Enter ou clicar
  const handleSubmit = () => {
    if (city.trim()) {
      fetchWeatherData(city);
      setCity("");
    }
  };

  // Função para capturar Enter no input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Função para lidar com mudança no input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);

    // Debounce para evitar muitas chamadas da API
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchCitySuggestions(value);
    }, 300);
  };

  // Função para selecionar sugestão
  const selectSuggestion = (suggestion) => {
    const cityName = suggestion.split(",")[0];
    setCity(cityName);
    fetchWeatherData(cityName);
    setShowSuggestions(false);
    setCity("");
  };

  // Função para selecionar busca recente
  const selectRecentSearch = (recentCity) => {
    const cityName = recentCity.split(",")[0];
    setCity("");
    fetchWeatherData(cityName);
  };

  // Debug: Mostrar buscas recentes no console
  console.log("Buscas recentes:", recentSearches);

  // Processar dados da previsão para mostrar apenas um por dia
  const getDailyForecast = () => {
    if (!forecastData) return [];

    const daily = {};
    forecastData.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date]) {
        daily[date] = item;
      }
    });

    return Object.values(daily).slice(1, 6); // Começar de amanhã
  };

  // Função para obter dia da semana
  const getWeekday = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("pt-BR", {
      weekday: "long",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-4 md:p-8">
      {/* Background com imagem de nuvens */}
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1559963110-71b394e7494d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">
              <a href="/"> WeatherPro</a>
            </h1>
            <p className="text-gray-400 text-sm">
              Previsão do tempo em tempo real
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={city}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => city.length >= 2 && setShowSuggestions(true)}
              placeholder="Buscar cidade..."
              className="w-full sm:w-64 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4 text-gray-300" />
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden z-50 shadow-2xl">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all flex items-center border-b border-white/5 last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="font-medium truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 rounded-2xl text-red-300 text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
            <p className="text-gray-400 mt-2">Carregando...</p>
          </div>
        )}

        {weatherData ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Weather Card */}
            <div className="xl:col-span-2">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 h-full">
                {/* Location and Date */}
                <div className="flex items-start mb-6">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-medium block">
                      {weatherData.name}, {weatherData.sys.country}
                    </span>
                    <span className="text-gray-400 text-sm block mt-1">
                      {new Date().toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Main Temperature */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                    <div className="mb-4 sm:mb-0 sm:mr-6">
                      {getWeatherIcon(weatherData.weather[0].main, "w-16 h-16")}
                    </div>
                    <div>
                      <div className="text-6xl sm:text-7xl font-thin text-white">
                        {Math.round(weatherData.main.temp)}°
                      </div>
                      <div className="text-gray-400 capitalize text-lg">
                        {weatherData.weather[0].description}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                    <span>Máx: {Math.round(weatherData.main.temp_max)}°</span>
                    <span>Mín: {Math.round(weatherData.main.temp_min)}°</span>
                    <span>
                      Sensação: {Math.round(weatherData.main.feels_like)}°
                    </span>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <Wind className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm md:text-base">
                      {Math.round(weatherData.wind.speed * 3.6)} km/h
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      Vento
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm md:text-base">
                      {weatherData.main.humidity}%
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      Umidade
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <Eye className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm md:text-base">
                      {(weatherData.visibility / 1000).toFixed(1)} km
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      Visibilidade
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <Thermometer className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm md:text-base">
                      {weatherData.main.pressure} hPa
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      Pressão
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Searches */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
                  Buscas Recentes
                </h3>
                {recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {recentSearches.map((recentCity, index) => (
                      <button
                        key={index}
                        onClick={() => selectRecentSearch(recentCity)}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center"
                      >
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{recentCity}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Suas buscas aparecerão aqui
                  </div>
                )}
              </div>

              {/* Air Quality (Placeholder) */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-white font-semibold mb-4">
                  Qualidade do Ar
                </h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-white font-medium">Boa</div>
                    <div className="text-gray-400 text-sm">IQA: 42</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome Screen */
          <div className="text-center py-20">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 max-w-2xl mx-auto">
              <Cloud className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Bem-vindo ao WeatherPro
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Digite o nome de uma cidade para ver a previsão do tempo
                detalhada
              </p>
              <div className="text-gray-500 text-sm">
                Exemplos: São Paulo, Rio de Janeiro, London, New York
              </div>
            </div>
          </div>
        )}

        {/* Weekly Forecast */}
        {forecastData && (
          <div className="mt-8">
            <h3 className="text-white font-semibold mb-4 text-xl">
              Previsão para os próximos dias
            </h3>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {getDailyForecast().map((day, index) => (
                  <div
                    key={index}
                    className="text-center p-4 rounded-2xl hover:bg-white/5 transition-all"
                  >
                    <div className="text-gray-400 text-sm mb-3 capitalize">
                      {getWeekday(day.dt)}
                    </div>
                    <div className="flex justify-center mb-3">
                      {getWeatherIcon(day.weather[0].main, "w-10 h-10")}
                    </div>
                    <div className="text-white font-semibold text-lg mb-1">
                      {Math.round(day.main.temp)}°
                    </div>
                    <div className="text-gray-400 text-xs capitalize">
                      {day.weather[0].description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Desenvolvido por Matheus Quintanilha
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
