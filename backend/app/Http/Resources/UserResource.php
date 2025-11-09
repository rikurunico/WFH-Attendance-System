<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'team_id' => $this->team_id,
            'team' => $this->when($this->team, function () {
                return [
                    'id' => $this->team->id,
                    'name' => $this->team->name,
                    'slug' => $this->team->slug,
                ];
            }),
            'leave_quota_days' => $this->leave_quota_days,
            'approved_leaves_count' => $this->approved_leaves_count ?? 0,
            'remaining_leave_days' => $this->leave_quota_days - ($this->approved_leaves_count ?? 0),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
