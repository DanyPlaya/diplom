"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  MapPin,
  Waves,
  Anchor,
  Thermometer,
  Activity,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import { useSearchParams } from "react-router";
import { useWeather } from "../api/weather-api";
import { cn } from "@/shared/lib/utils";

interface WeatherWidgetProps {
  className?: string;
  defaultExpanded?: boolean;
  onClose?: () => void;
}

// Функция для получения иконки погоды
const getWeatherIcon = (condition: string, size = 20) => {
  const iconProps = { size };

  if (
    condition.toLowerCase().includes("sun") ||
    condition.toLowerCase().includes("ясно")
  ) {
    return <Sun {...iconProps} className="text-yellow-500" />;
  }
  if (
    condition.toLowerCase().includes("cloud") ||
    condition.toLowerCase().includes("облач")
  ) {
    return <Cloud {...iconProps} className="text-gray-500" />;
  }
  if (
    condition.toLowerCase().includes("rain") ||
    condition.toLowerCase().includes("дождь")
  ) {
    return <CloudRain {...iconProps} className="text-blue-500" />;
  }
  if (
    condition.toLowerCase().includes("snow") ||
    condition.toLowerCase().includes("снег")
  ) {
    return <CloudSnow {...iconProps} className="text-blue-300" />;
  }
  if (
    condition.toLowerCase().includes("thunder") ||
    condition.toLowerCase().includes("гроз")
  ) {
    return <CloudLightning {...iconProps} className="text-purple-600" />;
  }
  return <Cloud {...iconProps} className="text-gray-500" />;
};

// Функция для получения направления ветра/волн
const getDirection = (degrees: number): string => {
  const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
  return directions[Math.round(degrees / 45) % 8];
};

// Функция для получения цвета состояния моря
const getSeaStateColor = (state: string): string => {
  switch (state) {
    case "Штиль":
    case "Тихо":
      return "bg-green-100 text-green-700";
    case "Слабое волнение":
    case "Умеренное волнение":
      return "bg-yellow-100 text-yellow-700";
    case "Неспокойно":
    case "Бурно":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-red-100 text-red-700";
  }
};

export default function WeatherWidgetExpandable({
  className,
  defaultExpanded = false,
  onClose,
}: WeatherWidgetProps) {
  const [searchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Получаем координаты из URL параметров
  const latitude = Number(searchParams.get("swLat")) || 59.93;
  const longitude = Number(searchParams.get("swLng")) || 30.31;

  const { data, isLoading, error, refetch } = useWeather(latitude, longitude);

  // Компактная версия (мини)
  if (!expanded) {
    return (
      <Card
        className={cn(
          "backdrop-blur-sm bg-white/90 border-slate-200 shadow-lg transition-all duration-300 cursor-pointer",
          className
        )}
        onClick={() => setExpanded(true)}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              {data?.weather ? (
                getWeatherIcon(data.weather.condition, 16)
              ) : (
                <Cloud className="h-4 w-4 text-gray-400" />
              )}
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Загрузка...</span>
              </div>
            ) : data?.weather ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-slate-700">
                  {data.weather.temperature}°C
                </span>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {data.weather.windSpeed} м/с
                  </span>
                </div>
                {data.marine && (
                  <div className="flex items-center gap-1">
                    <Waves className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">
                      {data.marine.waveHeight.toFixed(1)}м
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-red-500">Ошибка</span>
            )}
            <ChevronDown className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Полная (развернутая) версия
  return (
    <Card
      className={cn(
        "backdrop-blur-sm bg-white/90 border-slate-200 shadow-lg transition-all duration-300 w-96",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {data?.weather ? (
              getWeatherIcon(data.weather.condition, 20)
            ) : (
              <Cloud className="h-5 w-5 text-gray-400" />
            )}
            Погода {data?.marine ? "& Море" : ""}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {data?.weather && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{data.weather.location}</span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Загрузка данных...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Ошибка загрузки данных</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        ) : data ? (
          <Tabs defaultValue="weather" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weather">Погода</TabsTrigger>
              <TabsTrigger value="marine" disabled={!data.marine}>
                Море {!data.marine && "(н/д)"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weather" className="space-y-4 mt-4">
              {/* Основная температура */}
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-700 mb-1">
                  {data.weather.temperature}°C
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {data.weather.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ощущается как {data.weather.feelsLike}°C
                </p>
              </div>

              {/* Детали погоды */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ветер</p>
                    <p className="text-sm font-medium">
                      {data.weather.windSpeed} м/с{" "}
                      {getDirection(data.weather.windDirection)}
                    </p>
                    {data.weather.windGust > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Порывы до {data.weather.windGust} м/с
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Влажность</p>
                    <p className="text-sm font-medium">
                      {data.weather.humidity}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Давление</p>
                    <p className="text-sm font-medium">
                      {data.weather.pressure} гПа
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Видимость</p>
                    <p className="text-sm font-medium">
                      {data.weather.visibility} км
                    </p>
                  </div>
                </div>
              </div>

              {/* UV индекс */}
              {data.weather.uv > 0 && (
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">UV индекс</p>
                    <Badge
                      variant={
                        data.weather.uv > 6
                          ? "destructive"
                          : data.weather.uv > 3
                          ? "default"
                          : "secondary"
                      }
                    >
                      {data.weather.uv}
                    </Badge>
                  </div>
                </div>
              )}
            </TabsContent>

            {data.marine && (
              <TabsContent value="marine" className="space-y-4 mt-4">
                {/* Состояние моря */}
                <div className="text-center">
                  <Badge
                    className={`text-sm px-3 py-1 ${getSeaStateColor(
                      data.marine.seaState
                    )}`}
                  >
                    {data.marine.seaState}
                  </Badge>
                </div>

                {/* Волны */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        Высота волн
                      </p>
                      <p className="text-sm font-medium">
                        {data.marine.waveHeight.toFixed(1)} м (
                        {getDirection(data.marine.waveDirection)})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Период: {data.marine.wavePeriod}с
                      </p>
                    </div>
                  </div>

                  {data.marine.swellHeight > 0 && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Зыбь</p>
                        <p className="text-sm font-medium">
                          {data.marine.swellHeight.toFixed(1)} м (
                          {getDirection(data.marine.swellDirection)})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Период: {data.marine.swellPeriod}с
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Температура воды
                      </p>
                      <p className="text-sm font-medium">
                        {data.marine.waterTemperature}°C
                      </p>
                    </div>
                  </div>

                  {/* Приливы */}
                  <div className="flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Приливы</p>
                      <div className="flex gap-4 text-sm">
                        <span>Прилив: {data.marine.tideHigh}</span>
                        <span>Отлив: {data.marine.tideLow}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : null}

        {/* Время обновления */}
        {data && (
          <div className="text-center pt-4 border-t mt-4">
            <p className="text-xs text-muted-foreground">
              Обновлено: {new Date(data.weather.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
