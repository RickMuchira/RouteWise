<?php

namespace Database\Factories;

use App\Models\Route;
use App\Models\RoutePoint;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoutePointFactory extends Factory
{
    protected $model = RoutePoint::class;

    public function definition(): array
    {
        return [
            'route_id' => Route::factory(),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'recorded_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }
}