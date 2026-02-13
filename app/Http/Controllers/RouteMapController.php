<?php

namespace App\Http\Controllers;

use App\Models\Route;
use Illuminate\Http\Request;

class RouteMapController extends Controller
{
    public function show($id)
    {
        $route = Route::with(['driver', 'routePoints', 'studentPickups.student'])->findOrFail($id);

        // Format route points for the map
        $routePoints = $route->routePoints->map(function ($point) {
            return [$point->latitude, $point->longitude];
        })->toArray();

        // Calculate center of the map based on route points
        $centerLat = 0;
        $centerLng = 0;
        if (!empty($routePoints)) {
            $latitudes = array_column($routePoints, 0);
            $longitudes = array_column($routePoints, 1);
            $centerLat = array_sum($latitudes) / count($latitudes);
            $centerLng = array_sum($longitudes) / count($longitudes);
        } else {
            // Default center if no points
            $centerLat = 37.78825;
            $centerLng = -122.4324;
        }

        // Format student pickups
        $studentPickups = $route->studentPickups->map(function ($pickup) {
            return [
                'id' => $pickup->id,
                'student_name' => $pickup->student->first_name . ' ' . $pickup->student->last_name,
                'latitude' => $pickup->routePoint->latitude ?? 0,
                'longitude' => $pickup->routePoint->longitude ?? 0,
                'picked_up_at' => $pickup->picked_up_at,
            ];
        })->toArray();

        $routeData = [
            'id' => $route->id,
            'name' => $route->name,
            'driver' => $route->driver->name ?? 'Unknown',
            'bus_id' => $route->bus_id,
            'started_at' => $route->started_at,
            'ended_at' => $route->ended_at,
            'centerLat' => $centerLat,
            'centerLng' => $centerLng,
            'routePoints' => $routePoints,
            'studentPickups' => $studentPickups,
        ];

        return view('route-map', compact('routeData'));
    }
}