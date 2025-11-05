<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Convert all existing UTC timestamps to WIB (Asia/Jakarta) by adding 7 hours.
     * This migration is necessary because the application timezone was changed from UTC to Asia/Jakarta.
     * 
     * IMPORTANT: This migration should only be run ONCE on existing data.
     * If you're setting up a fresh installation, you can skip this migration.
     */
    public function up(): void
    {
        // Add 7 hours (25200 seconds) to convert UTC to WIB
        $offset = 7 * 3600; // 7 hours in seconds

        // Update attendances table
        DB::statement("
            UPDATE attendances 
            SET 
                check_in = datetime(check_in, '+7 hours'),
                check_out = CASE 
                    WHEN check_out IS NOT NULL THEN datetime(check_out, '+7 hours')
                    ELSE NULL 
                END,
                created_at = datetime(created_at, '+7 hours'),
                updated_at = datetime(updated_at, '+7 hours')
        ");

        // Update leaves table
        DB::statement("
            UPDATE leaves 
            SET 
                created_at = datetime(created_at, '+7 hours'),
                updated_at = datetime(updated_at, '+7 hours')
        ");

        // Update activity_logs table (no updated_at column)
        DB::statement("
            UPDATE activity_logs 
            SET 
                created_at = datetime(created_at, '+7 hours')
        ");

        // Update users table
        DB::statement("
            UPDATE users 
            SET 
                email_verified_at = CASE 
                    WHEN email_verified_at IS NOT NULL THEN datetime(email_verified_at, '+7 hours')
                    ELSE NULL 
                END,
                created_at = datetime(created_at, '+7 hours'),
                updated_at = datetime(updated_at, '+7 hours')
        ");

        // Update holidays table
        DB::statement("
            UPDATE holidays 
            SET 
                created_at = datetime(created_at, '+7 hours'),
                updated_at = datetime(updated_at, '+7 hours')
        ");

        // Update tasks table
        DB::statement("
            UPDATE tasks 
            SET 
                created_at = datetime(created_at, '+7 hours'),
                updated_at = datetime(updated_at, '+7 hours')
        ");
    }

    /**
     * Reverse the migrations.
     * 
     * Convert WIB timestamps back to UTC by subtracting 7 hours.
     */
    public function down(): void
    {
        // Subtract 7 hours to convert WIB back to UTC
        
        // Revert attendances table
        DB::statement("
            UPDATE attendances 
            SET 
                check_in = datetime(check_in, '-7 hours'),
                check_out = CASE 
                    WHEN check_out IS NOT NULL THEN datetime(check_out, '-7 hours')
                    ELSE NULL 
                END,
                created_at = datetime(created_at, '-7 hours'),
                updated_at = datetime(updated_at, '-7 hours')
        ");

        // Revert leaves table
        DB::statement("
            UPDATE leaves 
            SET 
                created_at = datetime(created_at, '-7 hours'),
                updated_at = datetime(updated_at, '-7 hours')
        ");

        // Revert activity_logs table (no updated_at column)
        DB::statement("
            UPDATE activity_logs 
            SET 
                created_at = datetime(created_at, '-7 hours')
        ");

        // Revert users table
        DB::statement("
            UPDATE users 
            SET 
                email_verified_at = CASE 
                    WHEN email_verified_at IS NOT NULL THEN datetime(email_verified_at, '-7 hours')
                    ELSE NULL 
                END,
                created_at = datetime(created_at, '-7 hours'),
                updated_at = datetime(updated_at, '-7 hours')
        ");

        // Revert holidays table
        DB::statement("
            UPDATE holidays 
            SET 
                created_at = datetime(created_at, '-7 hours'),
                updated_at = datetime(updated_at, '-7 hours')
        ");

        // Revert tasks table
        DB::statement("
            UPDATE tasks 
            SET 
                created_at = datetime(created_at, '-7 hours'),
                updated_at = datetime(updated_at, '-7 hours')
        ");
    }
};
