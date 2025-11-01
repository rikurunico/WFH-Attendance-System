<?php

namespace App\Models;

use App\Enums\LeaveStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Leave extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'approved_at' => 'datetime',
            'status' => LeaveStatus::class,
        ];
    }

    /**
     * Get the user that owns the leave request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who approved/rejected the leave.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if leave is pending.
     */
    public function isPending(): bool
    {
        return $this->status === LeaveStatus::PENDING;
    }

    /**
     * Check if leave is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === LeaveStatus::APPROVED;
    }

    /**
     * Check if leave is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === LeaveStatus::REJECTED;
    }
}
