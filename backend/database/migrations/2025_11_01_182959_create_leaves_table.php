<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason');
            $table->string('status')->default('pending'); // enum: pending, approved, rejected
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable(); // Manager's notes when approving/rejecting
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
            // Note: SQLite doesn't support 'setNull', using 'restrict' instead
            // In PostgreSQL, this can be changed to 'setNull'
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
