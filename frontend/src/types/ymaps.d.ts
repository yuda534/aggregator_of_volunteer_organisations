declare namespace ymaps {
  export interface IMap {
    geoObjects: any;
    setCenter(coords: number[], zoom?: number): void;
  }

  export interface IGeoObjectCollection {
    add(object: any): void;
    removeAll(): void;
  }

  export class Map {
    constructor(container: string | HTMLElement, state?: any, options?: any);
    geoObjects: IGeoObjectCollection;
    setCenter(coords: number[], zoom?: number): void;
  }

  export class Placemark {
    constructor(coords: number[], properties?: any, options?: any);
  }

  export function geocode(query: string): Promise<any>;
  export function ready(callback: () => void): void;
}

declare global {
  interface Window {
    ymaps: typeof ymaps;
  }
}