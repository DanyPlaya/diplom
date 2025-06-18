import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  visibility: number;
  description: string;
  condition: string;
  location: string;
  timestamp: number;
  uv: number;
}

interface MarineData {
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  swellHeight: number;
  swellDirection: number;
  swellPeriod: number;
  waterTemperature: number;
  tideHigh: string;
  tideLow: string;
  seaState: string;
}

interface WeatherResponse {
  weather: WeatherData;
  marine: MarineData | null;
}

const WEATHER_API_KEY = "4a689d4df3f04b409c3190014251806";

const fetchWeatherData = async (
  lat: number,
  lon: number
): Promise<WeatherResponse> => {
  if (!WEATHER_API_KEY) {
    throw new Error("WeatherAPI ключ не настроен");
  }

  // Получаем обычную погоду
  const weatherResponse = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&lang=ru&aqi=yes`
  );

  if (!weatherResponse.ok) {
    throw new Error("Ошибка получения данных о погоде");
  }

  const weatherData = await weatherResponse.json();

  // Получаем морские данные
  let marineData = null;
  try {
    const marineResponse = await fetch(
      `https://api.weatherapi.com/v1/marine.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1`
    );

    if (marineResponse.ok) {
      const marine = await marineResponse.json();
      const today = marine.forecast?.forecastday?.[0]?.day;
      const hourly = marine.forecast?.forecastday?.[0]?.hour?.[0];

      if (today && hourly) {
        marineData = {
          waveHeight: hourly.sig_ht_mt || 0,
          waveDirection: hourly.wave_dir_degree || 0,
          wavePeriod: hourly.wave_period_secs || 0,
          swellHeight: hourly.swell_ht_m || 0,
          swellDirection: hourly.swell_dir_degree || 0,
          swellPeriod: hourly.swell_period_secs || 0,
          waterTemperature: hourly.water_temp_c || 0,
          tideHigh: today.tides?.[0]?.tide?.[0]?.tide_time || "N/A",
          tideLow: today.tides?.[0]?.tide?.[1]?.tide_time || "N/A",
          seaState: getSeaState(hourly.sig_ht_m || 0),
        };
      }
    }
  } catch (error) {
    console.warn("Морские данные недоступны для данной локации");
  }

  return {
    weather: {
      temperature: Math.round(weatherData.current.temp_c),
      feelsLike: Math.round(weatherData.current.feelslike_c),
      humidity: weatherData.current.humidity,
      pressure: Math.round(weatherData.current.pressure_mb),
      windSpeed: Math.round(weatherData.current.wind_kph / 3.6), // конвертация в м/с
      windDirection: weatherData.current.wind_degree,
      windGust: Math.round((weatherData.current.gust_kph || 0) / 3.6),
      visibility: weatherData.current.vis_km,
      description: weatherData.current.condition.text,
      condition: weatherData.current.condition.text,
      location: weatherData.location.name,
      timestamp: Date.now(),
      uv: weatherData.current.uv || 0,
    },
    marine: marineData,
  };
};

const getSeaState = (waveHeight: number): string => {
  if (waveHeight < 0.1) return "Штиль";
  if (waveHeight < 0.5) return "Тихо";
  if (waveHeight < 1.25) return "Слабое волнение";
  if (waveHeight < 2.5) return "Умеренное волнение";
  if (waveHeight < 4) return "Неспокойно";
  if (waveHeight < 6) return "Бурно";
  if (waveHeight < 9) return "Очень бурно";
  if (waveHeight < 14) return "Шторм";
  return "Сильный шторм";
};

export const useWeather = (latitude: number, longitude: number) => {
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => fetchWeatherData(latitude, longitude),
    staleTime: 10 * 60 * 1000, // 10 минут
    refetchInterval: 15 * 60 * 1000, // обновление каждые 15 минут
    retry: 3,
  });
};
