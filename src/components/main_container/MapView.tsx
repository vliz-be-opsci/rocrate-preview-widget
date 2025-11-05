// Import the @terraformer/wkt package
// Use the parse function from @terraformer/wkt to handle WKT strings
import { wktToGeoJSON } from '@terraformer/wkt';
import React, { useEffect, useRef, useState } from 'react';
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
  onSelect?: (id: string) => void; // Added for popup selection
};

const MapView: React.FC<MapViewProps> = ({ rocrate, rocrateID, onSelect }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<OLMap | null>(null);
  
  // React state for popup instead of OpenLayers Overlay
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupRocrateId, setPopupRocrateId] = useState<string>('');

  // Each spatial item now carries rocrateId for traceability and linking.
  type SpatialEntityBase = { rocrateId: string; [k: string]: any };
  type PointItem = SpatialEntityBase & { coords: [number, number] };
  type BoundingBoxItem = SpatialEntityBase & { topLeft: [number, number]; bottomRight: [number, number] };
  type GeoJsonItem = SpatialEntityBase & { data: any };

  interface SpatialData {
    points?: PointItem[];
    boundingBoxes?: BoundingBoxItem[];
    geoJson?: GeoJsonItem[];
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
    // Each spatial item now carries rocrateId for traceability and linking.
    const points: PointItem[] = [];
    const boundingBoxes: BoundingBoxItem[] = [];
    const geoJson: GeoJsonItem[] = [];

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
    for (const entity of graph) {
      // firt check if the @id is the rocrateID
      if (entity['@id'] === rocrateID) {
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
        break;
      }
    }

    // if rocrateid is contextual_entities then get ll spatial entities
    if (rocrateID === "map_entity") {
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
      }
    }

    // Process each spatial entity found
    for (const entity of spatialEntities) {
      // Derive canonical rocrateId for each spatial item
      let canonicalId: string = '';
      if (typeof entity['@id'] === 'string') {
        canonicalId = String(entity['@id']);
      } else if (typeof entity['id'] === 'string') {
        canonicalId = String(entity['id']);
      } else if (typeof entity['rocrate'] === 'string') {
        canonicalId = String(entity['rocrate']);
      } else if (typeof entity['rocrate_id'] === 'string') {
        canonicalId = String(entity['rocrate_id']);
      }
      // Defensive: if no id found, set to ''
      if (!canonicalId) canonicalId = '';

      // Check if it has a geo property with WKT
      if ('geo' in entity) {
        const geoValue = entity['geo'];
        if (
          typeof geoValue === 'object' &&
          geoValue['@type'] === 'geo:wktLiteral' &&
          typeof geoValue['@value'] === 'string'
        ) {
          try {
            const geojsonObj = wktToGeoJSON(geoValue['@value']);
            geoJson.push({
              data: geojsonObj,
              rocrateId: canonicalId,
            });
          } catch (e) {
            // Failed to parse WKT
          }
        }
      }

      // Check for point coordinates
      if ('point' in entity && Array.isArray(entity.point)) {
        points.push({
          coords: entity.point,
          rocrateId: canonicalId,
        });
      }

      // Check for bounding box coordinates
      if ('boundingBox' in entity && Array.isArray(entity.boundingBox) && entity.boundingBox.length === 4) {
        const [minX, minY, maxX, maxY] = entity.boundingBox;
        boundingBoxes.push({
          topLeft: [minX, maxY],
          bottomRight: [maxX, minY],
          rocrateId: canonicalId,
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
        (item) => {
          const feature = new Feature({
            geometry: new Point(fromLonLat(item.coords)),
          });
          let rocrateId = item.rocrateId ?? (
            feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
          );
          if (!rocrateId) rocrateId = '';
          if (feature.get('@id') === undefined) feature.set('@id', String(rocrateId));
          if (feature.get('rocrateId') === undefined) feature.set('rocrateId', String(rocrateId));
          return feature;
        }
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
      const uniqueIds = Array.from(new Set(pointFeatures.map(f => f.get('rocrateId'))));
      if (uniqueIds.length === 1) {
        pointLayer.set('rocrateId', String(uniqueIds[0] ?? ''));
      }
      const pointSource = pointLayer.getSource();
      if (pointSource) {
        pointSource.on('addfeature', (evt) => {
          const feature = evt.feature;
          if (feature) {
            let rocrateId = (
              feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
            );
            if (!rocrateId) rocrateId = '';
            if (feature.get('@id') === undefined) feature.set('@id', String(rocrateId));
            if (feature.get('rocrateId') === undefined) feature.set('rocrateId', String(rocrateId));
          }
        });
      }

      mapInstance.current.addLayer(pointLayer);
    }

    // Add bounding boxes
    if (spatialData?.boundingBoxes) {
      const boxFeatures = spatialData.boundingBoxes.map((item) => {
        const topLeft = fromLonLat(item.topLeft);
        const bottomRight = fromLonLat(item.bottomRight);
        const coordinates = [
          [
            topLeft,
            [topLeft[0], bottomRight[1]],
            bottomRight,
            [bottomRight[0], topLeft[1]],
            topLeft,
          ],
        ];

        const feature = new Feature({
          geometry: new Polygon(coordinates),
        });
        let rocrateId = item.rocrateId ?? (
          feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
        );
        if (!rocrateId) rocrateId = '';
        if (feature.get('@id') === undefined) feature.set('@id', String(rocrateId));
        if (feature.get('rocrateId') === undefined) feature.set('rocrateId', String(rocrateId));
        return feature;
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
      const uniqueIds = Array.from(new Set(boxFeatures.map(f => f.get('rocrateId'))));
      if (uniqueIds.length === 1) {
        boxLayer.set('rocrateId', String(uniqueIds[0] ?? ''));
      }
      const boxSource = boxLayer.getSource();
      if (boxSource) {
        boxSource.on('addfeature', (evt) => {
          const feature = evt.feature;
          if (feature) {
            let rocrateId = (
              feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
            );
            if (!rocrateId) rocrateId = '';
            if (feature.get('@id') === undefined) feature.set('@id', String(rocrateId));
            if (feature.get('rocrateId') === undefined) feature.set('rocrateId', String(rocrateId));
          }
        });
      }

      mapInstance.current.addLayer(boxLayer);
    }

    // Add GeoJSON
    if (spatialData?.geoJson?.length) {
      spatialData.geoJson.forEach((item) => {
        const features = new GeoJSON().readFeatures(item.data, {
          featureProjection: 'EPSG:3857',
        });
        features.forEach((feature: Feature) => {
          let rocrateId = item.rocrateId ?? (
            feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
          );
          if (!rocrateId) rocrateId = '';
          if (feature.get('@id') === undefined) feature.set('@id', String(rocrateId));
          if (feature.get('rocrateId') === undefined) feature.set('rocrateId', String(rocrateId));
        });
        const geoJsonLayer = new VectorLayer({
          source: new VectorSource({
            features,
          }),
        });
        const uniqueIds = Array.from(new Set(features.map(f => f.get('rocrateId'))));
        if (uniqueIds.length === 1) {
          geoJsonLayer.set('rocrateId', String(uniqueIds[0] ?? ''));
        }
        const geoJsonSource = geoJsonLayer.getSource();
        if (geoJsonSource) {
          geoJsonSource.on('addfeature', (evt) => {
            const feature = evt.feature;
            if (feature) {
              let rocrateId = (
                feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
              );
              if (!rocrateId) rocrateId = '';
              if (feature.get('@id') === undefined) feature.set('@id', String(rocrateId));
              if (feature.get('rocrateId') === undefined) feature.set('rocrateId', String(rocrateId));
            }
          });
        }

        mapInstance.current?.addLayer(geoJsonLayer);
      });
    }

    // --- Map click handler to show popup ---
    mapInstance.current.on('singleclick', (event) => {
      let foundFeature = false;
      mapInstance.current?.forEachFeatureAtPixel(event.pixel, (feature) => {
        foundFeature = true;
        let rocrateId = (
          feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
        );
        if (!rocrateId) rocrateId = '';
        
        // Calculate pixel position for popup
        const pixel = mapInstance.current?.getPixelFromCoordinate(event.coordinate);
        if (pixel) {
          setPopupPosition({ x: pixel[0], y: pixel[1] });
          setPopupRocrateId(rocrateId);
          setPopupVisible(true);
        }
        return true; // Stop after first feature
      }, { hitTolerance: 2 });
      
      // Hide popup if no feature found
      if (!foundFeature) {
        setPopupVisible(false);
      }
    });

    // --- Cleanup on unmount ---
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, [spatialData]);

  // Handler for clicking the popup link
  const handlePopupLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupVisible(false);
    if (onSelect && popupRocrateId) {
      onSelect(popupRocrateId);
    }
  };

  // Handler for closing the popup
  const handleClosePopup = (e: React.MouseEvent) => {
    e.preventDefault();
    setPopupVisible(false);
  };

  // Render map container and popup as React-managed elements
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {popupVisible && (
        <div
          style={{
            position: 'absolute',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y - 40}px`, // Position above the click point
            transform: 'translate(-50%, -100%)', // Center horizontally, position above
            background: 'white',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10000,
            minWidth: '120px',
            pointerEvents: 'auto',
          }}
        >
          <a
            href="#"
            onClick={handleClosePopup}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              textDecoration: 'none',
              color: '#999',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ×
          </a>
          <div>
            <p style={{ margin: '0 0 4px 0' }}>RO-Crate ID:</p>
            <a
              href="#"
              onClick={handlePopupLinkClick}
              style={{
                color: '#0066cc',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {popupRocrateId}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;