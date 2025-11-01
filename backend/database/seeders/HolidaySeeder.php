<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $year = Carbon::now()->year;

        $holidays = [
            [
                'date' => "{$year}-01-01",
                'name' => "New Year's Day",
                'description' => 'New Year celebration',
            ],
            [
                'date' => "{$year}-12-25",
                'name' => 'Christmas Day',
                'description' => 'Christmas celebration',
            ],
            [
                'date' => "{$year}-08-17",
                'name' => 'Independence Day',
                'description' => 'Indonesian Independence Day',
            ],
        ];

        foreach ($holidays as $holiday) {
            Holiday::create($holiday);
        }
    }
}
