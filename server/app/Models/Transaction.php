<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'category_id',
        'type',
        'amount',
        'transaction_date',
        'description',
        'remarks',
        'recurring_id',
        'is_recurring_generated',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'is_recurring_generated' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }
}