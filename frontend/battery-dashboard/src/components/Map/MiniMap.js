import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './MiniMap.css';

const MiniMap = ({ radius_metres = 5000 }) => {
    console.log("radius: " + radius_metres)
    const mapRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const mapInstance = useRef(null);
    const circleRef = useRef(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Error getting location:', error);
                setUserLocation({ lat: 51.5033, lng: -0.1196 }); // fallback: London
            }
        );
    }, []);

    useEffect(() => {
        if (!userLocation) return;

        const loader = new Loader({
            apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
            version: 'weekly',
        });

        loader.load().then(() => {
            const google = window.google;

            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: userLocation,
                zoom: 10,
            });

            new google.maps.Marker({
                position: userLocation,
                map: mapInstance.current,
                title: 'You are here',
            });

            circleRef.current = new google.maps.Circle({
                strokeColor: '#007BFF',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#007BFF',
                fillOpacity: 0.2,
                map: mapInstance.current,
                center: userLocation,
                radius: radius_metres,
            });

            drawRangeCircles(mapInstance.current, userLocation, radius_metres);
        });
    }, [userLocation]);

    // Update radius when prop changes
    useEffect(() => {
        if (!circleRef.current) return;

        const circle = circleRef.current;
        const startRadius = circle.getRadius();
        const endRadius = radius_metres;
        const duration = 500; // animation duration in ms
        const frameRate = 60;
        const totalFrames = Math.round((duration / 1000) * frameRate);
        let frame = 0;

        const animate = () => {
            frame++;
            const progress = frame / totalFrames;
            const currentRadius = startRadius + (endRadius - startRadius) * easeInOutQuad(progress);
            circle.setRadius(currentRadius);

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            }
        };

        const easeInOutQuad = (t) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        animate();
    }, [radius_metres]);

    const drawRangeCircles = (map, center, radius_metres) => {
        const google = window.google;

        const maxRange = radius_metres;
        const redRadius = maxRange * 0.3;
        const orangeRadius = maxRange * 0.6;
        const greenRadius = maxRange;

        const circleOptions = [
            {
                radius: redRadius,
                fillColor: '#e74c3c',
                strokeColor: '#e74c3c',
                zIndex: 3,
            },
            {
                radius: orangeRadius,
                fillColor: '#f39c12',
                strokeColor: '#f39c12',
                zIndex: 2,
            },
            {
                radius: greenRadius,
                fillColor: '#2ecc71',
                strokeColor: '#2ecc71',
                zIndex: 1,
            },
        ];

        circleOptions.forEach(({ radius, fillColor, strokeColor, zIndex }) => {
            new google.maps.Circle({
                strokeColor,
                strokeOpacity: 0.6,
                strokeWeight: 1,
                fillColor,
                fillOpacity: 0.2,
                map,
                center,
                radius, // ✅ Correct key
                zIndex,
            });
        });
    };



    return <div ref={mapRef} className="map-container" />;
};

export default MiniMap;
