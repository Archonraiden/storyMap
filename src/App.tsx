import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet'
import './App.css';
import teslaData from "./data/tesla-sites.json"
import timelineElements from "./data/timelineElements"
import testTimelineElements from "./data/testTimelineElements.json"
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component"
import L, { popup } from 'leaflet';

import "react-vertical-timeline-component/style.min.css"

function SetViewOnClick() {
  const map = useMapEvent('click', (e) => {
    map.setView(e.latlng, map.getZoom())
  })
  return null
}

function AddMarkerOnClick() {
  const map = useMapEvent('click', (e) => {
    var yx = L.latLng;
    var xy = function(x: number, y: number) {
      return yx(x, y);
    }
    var markerOptions = {
      draggable: true,
    }
    var coords = xy(e.latlng.lat, e.latlng.lng);
    var marker = new L.Marker(coords, markerOptions).addTo(map)
    marker.bindPopup(coords.lat.toString() + ", " + coords.lng.toString());
  })
  return null
}
interface tslaMarker {
  id: string;
  position: [number, number];
  name: string;
  status: string;
  stallCount: number;
}

function CenterOnClickMarker({ id, position, name, status, stallCount }: tslaMarker) {
  const map = useMap()

  return (
    <Marker
      key={id}
      position={position}
      eventHandlers={{
        click: () => {
          map.flyTo(position, map.getZoom())
        }
      }}>
      <Popup position={position}>
        <div>
          <h2>{"Name: " + name}</h2>
          <p>{"Status: " + status}</p>
          <p>{"Number of Charging Stations: " + stallCount}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapWithTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  const mapRef = useRef<L.Map>(null);

  const centerMap = (position: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo(position, 8);
    }
  };

  const handleTimelineScroll = (e: any) => {
    const timelineElement = document.getElementsByClassName('vertical-timeline')[0];
    if (timelineElement) {
      var index = 0;
      for (let idx = 0; idx < testTimelineElements.length; idx++) {
        const element = document.getElementById(`vertical-timeline-item-${idx}`);
        if (element) {
          const bounds = element.getBoundingClientRect();
          if (bounds.top < window.innerHeight && bounds.bottom > 0) {
            index = idx;
            break;
          }
        }
      }
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const timelineElement = document.getElementsByClassName('vertical-timeline')[0];
    if (timelineElement) {
      timelineElement.addEventListener('scroll', handleTimelineScroll);
    }
    return () => {
      if (timelineElement) {
        timelineElement.removeEventListener('scroll', handleTimelineScroll);
      }
    };
  }, []);

  useEffect(() => {
    for (let idx = 0; idx < testTimelineElements.length; idx++) {
      const element = document.getElementById(`vertical-timeline-item-${idx}`);
      if (element) {
        element.classList.remove('active');
      }
    }
    const activeItem = document.getElementById(`vertical-timeline-item-${activeIndex}`);
    activeItem?.classList.add('active');
    if (activeItem) {
      //replace latLng with x, y coords
      centerMap([testTimelineElements[activeIndex].gps.latitude, testTimelineElements[activeIndex].gps.longitude]);
    }
  }, [activeIndex]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('click', function (event) {
        // if (mapRef.current) mapRef.current.setView(event.latlng, 4)
        console.log(event.latlng);
      });
    }
  }, []);
  
  return (
    <div className="flexbox-container">
      <VerticalTimeline className="timeline" layout="1-column-left">
        {/* Map the items array to VerticalTimelineElement components */}
        {testTimelineElements.map((item, index) => (
          <VerticalTimelineElement
            id={`vertical-timeline-item-${index}`}
            key={index}
            className={!!(index === 0) ? 'active' : ''}
            date={item.dateOpened}
            contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
            iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
          >
            <h3 className="vertical-timeline-element-title">{item.name}</h3>
            <h4 className="vertical-timeline-element-subtitle">{item.status}</h4>
            <p>
              {item.stallCount}
            </p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
      <MapContainer ref={mapRef} 
        center={[-55.75, 130.13609890147245
        ]} zoom={3} scrollWheelZoom={true} zoomControl={true}
        crs={L.CRS.Simple}
        >
        <TileLayer
          url='./tiledTileStitchTifbuildFlattened/{z}/{x}/{y}.png' noWrap={true} minZoom={0} maxZoom={8}
        />
        <AddMarkerOnClick/>
        {/* Map the items array to MyMarker components */}
        {testTimelineElements.map((item, index) => {
          return (
            <Marker key={index} position={[item.gps.latitude, item.gps.longitude]}>
              <Popup position={[item.gps.latitude, item.gps.longitude]}>
                <div>
                  <h2>{"Location: " + item.name}</h2>
                  <p>{item.status}</p>
                  <p>{"Story Item Number: " + item.stallCount}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// function App() {

//   const filteredStations = teslaData.filter(tsla => tsla.address.country === "USA")
//   return (
//     <div className="flexbox-container">
//       <VerticalTimeline className="timeline" layout="1-column-left">
//         {timelineElements.map((element) => {
//           return (
//             <VerticalTimelineElement
//               key={element.id}
//               date={element.date}
//               iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//             >
//               <h3 className="vertical-timeline-element-title">
//                 {element.title}
//               </h3>
//               <h5 className="vertical-timeline-element-subtitle">
//                 {element.location}
//               </h5>
//               <p id="description">{element.description}</p>
//             </VerticalTimelineElement>)
//         })}
//       </VerticalTimeline>
//       <MapContainer center={[48.21237,-122.183551]} zoom={9} scrollWheelZoom={false}>
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
//         <SetViewOnClick />
//         {filteredStations.map(tsla => (
//           <CenterOnClickMarker id={tsla.id} position={[tsla.gps.latitude, tsla.gps.longitude]} name={tsla.name} status={tsla.status} stallCount={tsla.stallCount} />
//         ))}


//       </MapContainer>
//     </div>
//   );
// }

export default MapWithTimeline;
