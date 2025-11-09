<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Team extends Model
{
    public const DEFAULT_REQUIRED_WORK_HOURS = 7.0;
    public const DEFAULT_LEAVE_QUOTA_DAYS = 12;
    public const DEFAULT_MAX_LEAVE_DAYS_PER_MONTH = 5;

    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'required_work_hours',
        'default_leave_quota_days',
        'max_leave_days_per_month',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'required_work_hours' => 'decimal:2',
            'default_leave_quota_days' => 'integer',
            'max_leave_days_per_month' => 'integer',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($team) {
            if (empty($team->slug)) {
                $team->slug = Str::slug($team->name);
                
                // Ensure slug is unique
                $originalSlug = $team->slug;
                $count = 1;
                while (static::where('slug', $team->slug)->exists()) {
                    $team->slug = $originalSlug . '-' . $count;
                    $count++;
                }
            }
        });
    }

    /**
     * Get all users for the team.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all managers for the team.
     */
    public function managers(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'manager');
    }

    /**
     * Get all employees for the team.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(User::class)->where('role', 'employee');
    }

    /**
     * Check if team is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get the required work hours for this team.
     */
    public function getRequiredWorkHours(): float
    {
        return $this->required_work_hours;
    }

    /**
     * Get the default leave quota days for this team.
     */
    public function getDefaultLeaveQuotaDays(): int
    {
        return $this->default_leave_quota_days;
    }

    /**
     * Get the max leave days per month for this team.
     */
    public function getMaxLeaveDaysPerMonth(): int
    {
        return $this->max_leave_days_per_month;
    }
}
