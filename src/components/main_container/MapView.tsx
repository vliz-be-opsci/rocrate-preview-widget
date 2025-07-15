import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
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
  spatialData?: {
    points: [number, number][];
    boundingBoxes?: { topLeft: [number, number]; bottomRight: [number, number] }[];
    geoJson?: string; // URL to GeoJSON data
  };
}

const MapView: React.FC<MapViewProps> = ({ spatialData }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = new Map({
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
    if (spatialData?.geoJson) {
      fetch(spatialData.geoJson)
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
    }

    return () => {
      mapInstance.current?.setTarget(null);
    };
  }, [spatialData]);

  return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

export default MapView;