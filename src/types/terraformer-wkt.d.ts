declare module '@terraformer/wkt' {
  export function wktToGeoJSON(wkt: string): any;
  export function geojsonToWKT(geojson: any): string;
}