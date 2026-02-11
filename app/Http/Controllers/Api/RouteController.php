<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\RoutePoint;
use App\Models\Student;
use App\Models\StudentPickup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RouteController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'bus_id' => 'required|integer',
        ]);

        $route = Route::create([
            'name' => $request->name,
            'driver_id' => Auth::id(),
            'bus_id' => $request->bus_id,
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'route' => $route,
        ]);
    }

    public function saveLocation(Request $request): JsonResponse
    {
        $request->validate([
            'route_id' => 'required|exists:routes,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $route = Route::findOrFail($request->route_id);

        // Only allow updates to active routes
        if ($route->ended_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Route has already ended',
            ], 400);
        }

        $point = RoutePoint::create([
            'route_id' => $request->route_id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'recorded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'point' => $point,
        ]);
    }

    public function markPickup(Request $request): JsonResponse
    {
        $request->validate([
            'route_id' => 'required|exists:routes,id',
            'student_id' => 'required|exists:students,id',
            'point_id' => 'required|exists:route_points,id',
        ]);

        $route = Route::findOrFail($request->route_id);
        
        // Only allow updates to active routes
        if ($route->ended_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Route has already ended',
            ], 400);
        }

        $pickup = StudentPickup::create([
            'student_id' => $request->student_id,
            'route_id' => $request->route_id,
            'route_point_id' => $request->point_id,
            'picked_up_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'pickup' => $pickup,
        ]);
    }

    public function end(Request $request): JsonResponse
    {
        $request->validate([
            'route_id' => 'required|exists:routes,id',
        ]);

        $route = Route::findOrFail($request->route_id);

        // Only allow ending if not already ended
        if ($route->ended_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Route has already ended',
            ], 400);
        }

        // Update the route with end time
        $route->update([
            'ended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'route' => $route,
        ]);
    }

    public function index(): JsonResponse
    {
        $routes = Route::with(['driver', 'routePoints', 'studentPickups.student'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'routes' => $routes,
        ]);
    }

    public function show($id): JsonResponse
    {
        $route = Route::with(['driver', 'routePoints', 'studentPickups.student'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'route' => $route,
        ]);
    }

    public function getStudents(): JsonResponse
    {
        $students = Student::where('active', true)
            ->select('id', 'first_name', 'last_name', 'grade', 'pickup_latitude', 'pickup_longitude')
            ->get();

        return response()->json([
            'success' => true,
            'students' => $students,
        ]);
    }
}