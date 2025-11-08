<?php

namespace Database\Factories;

use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Holiday>
 */
class HolidayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => \App\Models\Team::factory(),
            'date' => Carbon::now()->addMonths(rand(1, 6))->format('Y-m-d'),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
        ];
    }
}
