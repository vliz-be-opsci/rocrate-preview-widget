// Import the @terraformer/wkt package
// Use the parse function from @terraformer/wkt to handle WKT strings
import { wktToGeoJSON } from '@terraformer/wkt';
import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map as OLMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Point, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

interface MapViewProps {
  rocrate: Record<string, any>
};

const MapView: React.FC<MapViewProps> = ({ rocrate }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<OLMap | null>(null);

  interface SpatialData {
    points?: [number, number][];
    boundingBoxes?: { topLeft: [number, number]; bottomRight: [number, number] }[];
    geoJson?: string[];
  }

  /**
   * Extracts spatial data from a RO-Crate JSON-LD object.
   *
   * Scans the `@graph` array for entities with spatial-related types or fields, and processes any WKT literals found in their `geo` properties. Converts valid WKT strings to GeoJSON objects and stores them as Blob URLs. Returns an object containing arrays of points, bounding boxes, and GeoJSON URLs if found.
   *
   * @param rocrate - The RO-Crate JSON-LD object to extract spatial data from
   * @returns An object containing extracted spatial data, including points, bounding boxes, and GeoJSON Blob URLs
   */
  function extractSpatialData(rocrate: Record<string, any>): SpatialData {
    const points: [number, number][] = [];
    const boundingBoxes: { topLeft: [number, number]; bottomRight: [number, number] }[] = [];
    const geoJson: string[] = [];

    const graph = rocrate['@graph'] || [];

    // Helper to resolve @id references
    const byId = Object.fromEntries(graph.map((e: any) => [e['@id'], e]));
    console.log("Graph entities:", graph);
    for (const entity of graph) {
      // Handle spatialCoverage, dc:spatial, location
      const spatialFields = [
        'spatialCoverage',
        'dc:spatial',
        'dc:Location',
        'spatial',
        'location',
      ];
      
    // Check if any spatial field is present in @type
    if (
      entity['@type'] &&
      spatialFields.some((field) =>
        Array.isArray(entity['@type'])
      ? entity['@type'].includes(field)
      : entity['@type'] === field
      )
    ) {
      console.log("Spatial entity found:", entity["@id"]);
      if ('geo' in entity) {
        const geoValue = entity['geo'];
        console.log("Geo value found:", geoValue);
        if (
          typeof geoValue === 'object' &&
          geoValue['@type'] === 'geo:wktLiteral' &&
          typeof geoValue['@value'] === 'string'
        ) {
          try {
            const geojsonObj = wktToGeoJSON(geoValue['@value']);
            geoJson.push(
              URL.createObjectURL(
                new Blob([JSON.stringify(geojsonObj)], { type: 'application/json' })
              )
            );
          } catch (e) {
            console.warn('Failed to parse WKT:', geoValue['@value'], e);
          }
        }
      }
      continue;
    }
      
    }

    const result: SpatialData = {};
    if (points.length) result.points = points;
    if (boundingBoxes.length) result.boundingBoxes = boundingBoxes;
    if (geoJson.length) result.geoJson = geoJson;
    return result;
  }

  const spatialData = extractSpatialData(rocrate);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = new OLMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // Add points
    if (spatialData?.points) {
      const pointFeatures = spatialData.points.map(
        (point) =>
          new Feature({
            geometry: new Point(fromLonLat(point)),
          })
      );

      const pointLayer = new VectorLayer({
        source: new VectorSource({
          features: pointFeatures,
        }),
        style: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'blue' }),
            stroke: new Stroke({ color: 'white', width: 1 }),
          }),
        }),
      });

      mapInstance.current.addLayer(pointLayer);
    }

    // Add bounding boxes
    if (spatialData?.boundingBoxes) {
      const boxFeatures = spatialData.boundingBoxes.map((box) => {
        const topLeft = fromLonLat(box.topLeft);
        const bottomRight = fromLonLat(box.bottomRight);
        const coordinates = [
          [
            topLeft,
            [topLeft[0], bottomRight[1]],
            bottomRight,
            [bottomRight[0], topLeft[1]],
            topLeft,
          ],
        ];

        return new Feature({
          geometry: new Polygon(coordinates),
        });
      });

      const boxLayer = new VectorLayer({
        source: new VectorSource({
          features: boxFeatures,
        }),
        style: new Style({
          stroke: new Stroke({ color: 'red', width: 2 }),
          fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
        }),
      });

      mapInstance.current.addLayer(boxLayer);
    }

    // Add GeoJSON
    if (spatialData?.geoJson?.length) {
      spatialData.geoJson.forEach((geoJsonUrl) => {
        fetch(geoJsonUrl)
          .then((response) => response.json())
          .then((geoJsonData) => {
            const geoJsonLayer = new VectorLayer({
              source: new VectorSource({
                features: new GeoJSON().readFeatures(geoJsonData, {
                  featureProjection: 'EPSG:3857',
                }),
              }),
            });
    
            mapInstance.current?.addLayer(geoJsonLayer);
          });
      });
    }

    return () => {
      mapInstance.current?.setTarget(undefined);
    };
  }, [spatialData]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

export default MapView;