<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'grade' => $this->faker->randomElement(['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']),
            'parent_phone' => $this->faker->optional()->phoneNumber(),
            'parent_email' => $this->faker->optional()->safeEmail(),
            'address' => $this->faker->optional()->address(),
            'pickup_latitude' => $this->faker->optional()->latitude(),
            'pickup_longitude' => $this->faker->optional()->longitude(),
            'active' => $this->faker->boolean(95), // 95% chance of being active
        ];
    }
}