<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentPickup extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'route_id',
        'route_point_id',
        'picked_up_at',
    ];

    protected $casts = [
        'picked_up_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function routePoint(): BelongsTo
    {
        return $this->belongsTo(RoutePoint::class, 'route_point_id');
    }
}