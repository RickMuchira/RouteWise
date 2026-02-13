<!DOCTYPE html>
<html>
<head>
    <title>Route Map</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Get route data from server-side
        const routeData = @json($routeData);
        
        // Initialize the map
        var map = L.map('map').setView([routeData.centerLat, routeData.centerLng], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Add route polyline if available
        if(routeData.routePoints && routeData.routePoints.length > 1) {
            var routeLine = L.polyline(routeData.routePoints, {
                color: 'red',
                weight: 4,
                opacity: 0.7
            }).addTo(map);
            
            // Fit bounds to show the entire route
            map.fitBounds(routeLine.getBounds());
        }

        // Add route points as markers
        if(routeData.routePoints && routeData.routePoints.length > 0) {
            routeData.routePoints.forEach((point, index) => {
                L.marker([point[0], point[1]])
                  .addTo(map)
                  .bindPopup('Route Point ' + (index + 1));
            });
        }

        // Add student pickup markers
        if(routeData.studentPickups && routeData.studentPickups.length > 0) {
            routeData.studentPickups.forEach(pickup => {
                L.marker([pickup.latitude, pickup.longitude], { 
                    icon: L.divIcon({
                        className: 'student-marker', 
                        html: '<div style="background-color: green; border: 2px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>', 
                        iconSize: [16, 16]
                    }) 
                })
                  .addTo(map)
                  .bindPopup(pickup.student_name + ' - Picked up at ' + new Date(pickup.picked_up_at).toLocaleString());
            });
        }
    </script>
</body>
</html>