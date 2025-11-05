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
import Overlay from 'ol/Overlay'; // Popup overlay
type OverlayType = Overlay;

interface MapViewProps {
  rocrate: Record<string, any>
  rocrateID: string;
  onSelect?: (id: string) => void; // Added for popup selection
};

const MapView: React.FC<MapViewProps> = ({ rocrate, rocrateID, onSelect }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<OLMap | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<OverlayType | null>(null);
  const popupContentRef = useRef<HTMLDivElement | null>(null);
  // Fix type: anchor not button
  const popupCloserRef = useRef<HTMLAnchorElement | null>(null);

  // Each spatial item now carries rocrateId for traceability and linking.
  type SpatialEntityBase = { rocrateId: string; [k: string]: any };
  type PointItem = SpatialEntityBase & { coords: [number, number] };
  type BoundingBoxItem = SpatialEntityBase & { topLeft: [number, number]; bottomRight: [number, number] };
  type GeoJsonItem = SpatialEntityBase & { url: string };

  interface SpatialData {
    points?: PointItem[];
    boundingBoxes?: BoundingBoxItem[];
    geoJson?: GeoJsonItem[];
  }

  function destroyMapAndNavigate(rocrateid: string) {
      // Destroy the map instance
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }

      // Navigate to the specified rocrateID using the onSelect callback
      if (onSelect) {
        onSelect(rocrateid);
      }
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
              url: URL.createObjectURL(
                new Blob([JSON.stringify(geojsonObj)], { type: 'application/json' })
              ),
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
    // --- Popup Overlay Lifecycle ---
    // 1. Render DOM elements via JSX (see below) so refs exist.
    // 2. Create Overlay only after popupRef.current is non-null.
    // 3. Add overlay to map after map is created.
    // 4. Set overlay position on feature click, hide on close.
    if (!mapRef.current) return;

    // Defensive: Clean up previous overlay and listeners before re-init
    if (overlayRef.current && mapInstance.current) {
      mapInstance.current.removeOverlay(overlayRef.current);
      overlayRef.current = null;
    }

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

    // --- Popup Overlay Setup ---
    // Defensive: Only create overlay after popupRef.current exists.
    if (popupRef.current && !overlayRef.current) {
      // Context7: Overlay must be constructed after popupRef exists and added to map.
      // See authoritative pattern: https://context7.com/openlayers/openlayers/llms.txt
      overlayRef.current = new Overlay({
        element: popupRef.current,
        autoPan: true,
        positioning: 'bottom-center'
      });
      // Set autoPan animation duration after construction (OpenLayers API)
      if (overlayRef.current) {
        // @ts-ignore: OpenLayers Overlay supports autoPanAnimation but not typed in Options
        overlayRef.current.setProperties({ autoPanAnimation: { duration: 250 } });
      }
      mapInstance.current.addOverlay(overlayRef.current);
    }

    // Defensive: Set minimal inline styles for popup visibility
    if (popupRef.current) {
      // Context7: Inline styles for overlay visibility and z-index.
      popupRef.current.style.position = 'absolute';
      popupRef.current.style.background = 'white';
      popupRef.current.style.padding = '8px';
      popupRef.current.style.borderRadius = '4px';
      popupRef.current.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      popupRef.current.style.zIndex = '10000';
      popupRef.current.style.minWidth = '120px';
      popupRef.current.style.display = 'none'; // Hide by default
    }

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
        fetch(item.url)
          .then((response) => response.json())
          .then((geoJsonData) => {
            const features = new GeoJSON().readFeatures(geoJsonData, {
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
      });
    }

    // --- Popup click handler ---
    // Context7: Use forEachFeatureAtPixel to pick top feature and anchor overlay.
    mapInstance.current.on('singleclick', (event) => {
      let foundFeature = false;
      // Defensive: ensure pointer events are not blocked by CSS
      mapInstance.current?.forEachFeatureAtPixel(event.pixel, (feature) => {
        foundFeature = true;
        let rocrateId = (
          feature.get('@id') ?? feature.get('id') ?? feature.get('rocrate') ?? feature.get('rocrate_id') ?? feature.getId()
        );
        if (!rocrateId) rocrateId = '';
        // Set popup content
        if (popupContentRef.current) {
          popupContentRef.current.innerHTML = `<p>RO-Crate ID:</p><p id="popup-link">${rocrateId}</p>`;
          // Remove previous listeners to avoid duplicate firing
          const link = popupContentRef.current.querySelector('#popup-link');
          if (link && onSelect) {
            (link as HTMLAnchorElement).onclick = (e: MouseEvent) => {
              destroyMapAndNavigate(rocrateId);
            };
          }
        }
        // Show popup at coordinate
        overlayRef.current?.setPosition(event.coordinate);
        if (popupRef.current) popupRef.current.style.display = 'block';
        return true; // Stop after first feature
      }, { hitTolerance: 2 }); // Use hitTolerance for canvas/decluttered layers
      // Hide popup if no feature found
      if (!foundFeature) {
        overlayRef.current?.setPosition(undefined);
        if (popupRef.current) popupRef.current.style.display = 'none';
      }
    });

    // --- Popup closer handler ---
    if (popupCloserRef.current) {
      popupCloserRef.current.onclick = (e) => {
        e.preventDefault();
        // Only hide the popup, do not remove DOM node
        if (overlayRef.current) {
          overlayRef.current.setPosition(undefined);
        }
        if (popupRef.current && popupRef.current.parentNode) {
          popupRef.current.style.display = 'none';
        }
        return false;
      };
    }
    // --- Cleanup on unmount ---
    // Context7: Clean up overlay and listeners on unmount.
    return () => {
      if (overlayRef.current) {
        // Only hide the popup, do not remove DOM node
        overlayRef.current.setPosition(undefined);
        if (popupRef.current) popupRef.current.style.display = 'none';
        // Detach overlay element to prevent OpenLayers from removing React node
        overlayRef.current.setElement(document.createElement('div'));
      }
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
      }
    };
  }, [spatialData]);
  // Add cleanup function to detach overlay element
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        // Only hide the popup, do not remove DOM node
        overlayRef.current.setPosition(undefined);
        if (popupRef.current) popupRef.current.style.display = 'none';
        // Detach overlay element to prevent OpenLayers from removing React node
        overlayRef.current.setElement(document.createElement('div'));
      }
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
      }
    };
  }, []);

  // Render map container and popup overlay element
  // Render map container and popup overlay element
  // The popup overlay must be rendered in the React tree so its DOM exists before Overlay construction.
  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      <div
        ref={popupRef}
        id="popup"
        className="ol-popup"
        // Inline styles for guaranteed visibility and z-index
        style={{
          position: 'absolute',
          background: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 9999,
          minWidth: '120px',
          display: 'none'
        }}
      >
        <a
          href="#"
          ref={popupCloserRef}
          id="popup-closer"
          className="ol-popup-closer"
        ></a>
        <div ref={popupContentRef} id="popup-content"></div>
      </div>
    </>
  );
};

export default MapView;