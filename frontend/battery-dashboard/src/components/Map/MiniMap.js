import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import './MiniMap.css';

const MiniMap = ({ radius_metres = 5000 }) => {
    const mapRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const mapInstance = useRef(null);
    const rangeCirclesRef = useRef([]);

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
                setUserLocation({ lat: 36.171204557100324,  lng: -115.1391938386745 });
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
                zoom: 5,
            });

            new google.maps.Marker({
                position: userLocation,
                map: mapInstance.current,
                title: 'You are here',
            });

            drawRangeCircles(mapInstance.current, userLocation, radius_metres);
        });
    }, [userLocation]);

    useEffect(() => {
        if (!rangeCirclesRef.current.length) return;

        const maxRange = radius_metres;
        const targetRadii = [
            radius_metres,          
            radius_metres * 0.85,   
            radius_metres * 0.7      
        ];

        const duration = 500;
        const frameRate = 60;
        const totalFrames = Math.round((duration / 1000) * frameRate);
        let frame = 0;

        const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        const startRadii = rangeCirclesRef.current.map(circle => circle.getRadius());

        const animate = () => {
            frame++;
            const progress = frame / totalFrames;

            rangeCirclesRef.current.forEach((circle, index) => {
                const start = startRadii[index];
                const end = targetRadii[index];
                const current = start + (end - start) * easeInOutQuad(progress);
                circle.setRadius(current);
            });

            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [radius_metres]);

    const drawRangeCircles = (map, center, radius_metres) => {
        const google = window.google;

        const maxRange = radius_metres;
        const redRadius = maxRange;
        const orangeRadius = maxRange * 0.85;
        const greenRadius = maxRange * 0.7;


        const circleOptions = [
            {
                radius: redRadius,
                fillColor: '#e74c3c',
                strokeColor: '#e74c3c',
                zIndex: 1,
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
                zIndex: 3,
            },
        ];


        rangeCirclesRef.current.forEach(circle => circle.setMap(null));
        rangeCirclesRef.current = [];

        circleOptions.forEach(({ radius, fillColor, strokeColor, zIndex }) => {
            const circle = new google.maps.Circle({
                strokeColor,
                strokeOpacity: 0.6,
                strokeWeight: 1,
                fillColor,
                fillOpacity: 0.2,
                map,
                center,
                radius,
                zIndex,
            });

            rangeCirclesRef.current.push(circle);
        });
    };

    return <div ref={mapRef} className="map-container" />;
};

export default MiniMap;
