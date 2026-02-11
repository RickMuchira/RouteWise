<?php

namespace Database\Factories;

use App\Models\Route;
use App\Models\RoutePoint;
use App\Models\Student;
use App\Models\StudentPickup;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentPickupFactory extends Factory
{
    protected $model = StudentPickup::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'route_id' => Route::factory(),
            'route_point_id' => RoutePoint::factory(),
            'picked_up_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }
}