<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recurring extends Model
{
    protected $fillable = [
        'category_id',
        'amount',
        'frequency',
        'start_date',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'last_generated_at' => 'date',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
