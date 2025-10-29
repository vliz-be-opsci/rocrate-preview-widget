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
  rocrateID: string;
};

const MapView: React.FC<MapViewProps> = ({ rocrate, rocrateID }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<OLMap | null>(null);
  console.log("MapView rocrate", rocrate);
  console.log("MapView rocrateID", rocrateID);

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
  function extractSpatialData(rocrate: Record<string, any>, rocrateID: string): SpatialData {
    const points: [number, number][] = [];
    const boundingBoxes: { topLeft: [number, number]; bottomRight: [number, number] }[] = [];
    const geoJson: string[] = [];

    const graph = rocrate['@graph'] || [];

    if ( rocrateID == "") {
      console.warn("RO-Crate is empty string so take ./ @graph");
      rocrateID = "./";
    }

    let spatialEntities: any[] = [];

    // Handle spatialCoverage, dc:spatial, location
    const spatialFields = [
      'spatialCoverage',
      'dc:spatial',
      'dc:Location',
      'spatial',
      'location',
    ];

    // Helper to resolve @id references
    const byId = Object.fromEntries(graph.map((e: any) => [e['@id'], e]));
    console.log("Graph entities:", graph);
    console.log("RO-Crate ID map:", rocrateID);
    for (const entity of graph) {
      console.log("Processing entity:", entity);
      // firt check if the @id is the rocrateID
      if (entity['@id'] === rocrateID) {
        console.log("Found RO-Crate entity:", entity);

        // Find spatial entities referenced by spatial fields in the main entity
        for (const field of spatialFields) {
          const spatialRef = entity[field];
          if (spatialRef) {
            // Handle array or single reference
            const refs = Array.isArray(spatialRef) ? spatialRef : [spatialRef];
            for (const ref of refs) {
              // If it's an object with @id, resolve it
              if (typeof ref === 'object' && ref['@id'] && byId[ref['@id']]) {
          spatialEntities.push(byId[ref['@id']]);
              }
              // If it's a string, treat as @id
              else if (typeof ref === 'string' && byId[ref]) {
          spatialEntities.push(byId[ref]);
              }
              // If it's an inline object, push directly
              else if (typeof ref === 'object') {
          spatialEntities.push(ref);
              }
            }
          }
        }
        console.log("Spatial entities in RO-Crate (bound to @id):", spatialEntities);
      break;
      }
    }

    // if rocrateid is contextual_entities then get ll spatial entities
    if (rocrateID === "Contextual_entities") {
      console.log("RO-Crate ID is 'contextual_entities', using all spatial entities in the graph");
      let boundspatialEntities = graph.filter((entity: any) => {
        return spatialFields.some(field => field in entity);
      });
      for (const entity of boundspatialEntities) {
        for (const field of spatialFields) {
          const spatialRef = entity[field];
          if (spatialRef) {
            // Handle array or single reference
            const refs = Array.isArray(spatialRef) ? spatialRef : [spatialRef];
            for (const ref of refs) {
              // If it's an object with @id, resolve it
              if (typeof ref === 'object' && ref['@id'] && byId[ref['@id']]) {
          spatialEntities.push(byId[ref['@id']]);
              }
              // If it's a string, treat as @id
              else if (typeof ref === 'string' && byId[ref]) {
          spatialEntities.push(byId[ref]);
              }
              // If it's an inline object, push directly
              else if (typeof ref === 'object') {
          spatialEntities.push(ref);
              }
            }
          }
        }
        // get all the entitities that are bound to the boundspatialEntities
        console.log("Spatial entities in RO-Crate (all):", spatialEntities);
      }
    }

    // Process each spatial entity found 
    for (const entity of spatialEntities) {
      console.log("Processing spatial entity:", entity);

      // Check if it has a geo property with WKT
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
            console.log('Failed to parse WKT:', geoValue['@value'], e);
          }
        }
      }

      // Check for point coordinates
      if ('point' in entity && Array.isArray(entity.point)) {
        points.push(entity.point);
      }

      // Check for bounding box coordinates
      if ('boundingBox' in entity && Array.isArray(entity.boundingBox) && entity.boundingBox.length === 4) {
        const [minX, minY, maxX, maxY] = entity.boundingBox;
        boundingBoxes.push({
          topLeft: [minX, maxY],
          bottomRight: [maxX, minY],
        });
      }
    }

    const result: SpatialData = {};
    if (points.length) result.points = points;
    if (boundingBoxes.length) result.boundingBoxes = boundingBoxes;
    if (geoJson.length) result.geoJson = geoJson;
    return result;
  }

  const spatialData = extractSpatialData(rocrate, rocrateID);
  console.log("Extracted spatial data:", spatialData);

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