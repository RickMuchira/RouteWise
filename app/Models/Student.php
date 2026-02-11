<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'grade',
        'parent_phone',
        'parent_email',
        'address',
        'pickup_latitude',
        'pickup_longitude',
        'active',
    ];

    protected $casts = [
        'pickup_latitude' => 'decimal:8',
        'pickup_longitude' => 'decimal:8',
        'active' => 'boolean',
    ];

    public function studentPickups(): HasMany
    {
        return $this->hasMany(StudentPickup::class);
    }
}