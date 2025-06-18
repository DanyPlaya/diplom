"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Slider } from "@/shared/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function MapLayers() {
  const [isOpen, setIsOpen] = useState(false);
  const [temperatureOpacity, setTemperatureOpacity] = useState([80]);
  const [currentOpacity, setCurrentOpacity] = useState([70]);

  return (
    <div className="">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="icon"
        className="p-2"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Слои карты"
      >
        <Layers className="w-5 h-5" />
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Card className="absolute z-[1000] top-full mt-2 right-0 w-72 shadow-lg ">
          <CardContent className="space-y-4 p-4">
            {/* Base Layers */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">
                Базовая карта
              </Label>
              <Select defaultValue="street">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[1200]">
                  <SelectItem value="satellite">Спутниковая</SelectItem>
                  <SelectItem value="terrain">Морской слой</SelectItem>
                  <SelectItem value="hybrid">Гибридная</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr />

            {/* Ocean Data */}
            <div className="space-y-4">
              <Label className="text-xs font-semibold uppercase">
                Данные океана
              </Label>

              {/* Water Temperature */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature-layer" className="text-sm">
                    Температура воды
                  </Label>
                  <Switch id="temperature-layer" />
                </div>
                <div className="pl-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Прозрачность</span>
                    <span>{temperatureOpacity[0]}%</span>
                  </div>
                  <Slider
                    value={temperatureOpacity}
                    onValueChange={setTemperatureOpacity}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Currents */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="currents-layer" className="text-sm">
                    Морские течения
                  </Label>
                  <Switch id="currents-layer" />
                </div>
                <div className="pl-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Прозрачность</span>
                    <span>{currentOpacity[0]}%</span>
                  </div>
                  <Slider
                    value={currentOpacity}
                    onValueChange={setCurrentOpacity}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Salinity */}
              <div className="flex items-center justify-between">
                <Label htmlFor="salinity-layer" className="text-sm">
                  Соленость
                </Label>
                <Switch id="salinity-layer" />
              </div>

              {/* Bathymetry */}
              <div className="flex items-center justify-between">
                <Label htmlFor="depth-layer" className="text-sm">
                  Батиметрия
                </Label>
                <Switch id="depth-layer" />
              </div>
            </div>

            <hr />

            {/* Navigation */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">
                Навигация
              </Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="vessels-layer" className="text-sm">
                  Суда
                </Label>
                <Switch id="vessels-layer" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ports-layer" className="text-sm">
                  Порты
                </Label>
                <Switch id="ports-layer" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="routes-layer" className="text-sm">
                  Морские пути
                </Label>
                <Switch id="routes-layer" />
              </div>
            </div>

            <hr />

            {/* Weather */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">Погода</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="ice-layer" className="text-sm">
                  Ледовая обстановка
                </Label>
                <Switch id="ice-layer" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wind-layer" className="text-sm">
                  Ветер
                </Label>
                <Switch id="wind-layer" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="waves-layer" className="text-sm">
                  Волны
                </Label>
                <Switch id="waves-layer" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
