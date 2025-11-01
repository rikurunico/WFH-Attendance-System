<?php

namespace App\Console\Commands;

use App\Services\AttendanceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoCheckoutCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:auto-checkout';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically check out all active attendances at 23:59';

    /**
     * Execute the console command.
     */
    public function handle(AttendanceService $attendanceService): int
    {
        try {
            $this->info('Starting auto-checkout process...');
            
            $attendanceService->autoCheckout();
            
            $this->info('Auto-checkout completed successfully.');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Auto checkout command failed: ' . $e->getMessage());
            $this->error('Auto-checkout failed: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }
}
