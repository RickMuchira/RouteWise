<?php

namespace Database\Factories;

use App\Models\Route;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RouteFactory extends Factory
{
    protected $model = Route::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'driver_id' => User::factory(),
            'bus_id' => $this->faker->numberBetween(1, 20),
            'started_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'ended_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 week', 'now'),
            'polyline' => $this->faker->optional(0.5)->text(500),
            'distance' => $this->faker->randomFloat(2, 0, 50),
        ];
    }
}