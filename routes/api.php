<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RouteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public API routes for mobile app (will implement auth later)
Route::prefix('mobile')->group(function () {
    Route::post('start-route', [RouteController::class, 'start']);
    Route::post('save-location', [RouteController::class, 'saveLocation']);
    Route::post('mark-pickup', [RouteController::class, 'markPickup']);
    Route::post('end-route', [RouteController::class, 'end']);
    Route::get('students', [RouteController::class, 'getStudents']);
});

// Protected API routes for web dashboard
Route::middleware('auth:sanctum')->group(function () {
    Route::get('routes', [RouteController::class, 'index']);
    Route::get('routes/{id}', [RouteController::class, 'show']);
});