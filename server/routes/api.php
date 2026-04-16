<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuthController;

Route::middleware(['web'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('recurring-transactions', RecurringTransactionController::class);
    
    Route::get('reports/summary', [ReportController::class, 'summary']);
    Route::get('reports/by-category', [ReportController::class, 'byCategory']);
    Route::get('reports/annual', [ReportController::class, 'annual']);
    Route::get('reports/category-summary', [ReportController::class, 'categorySummary']);
    
    Route::post('/logout', [AuthController::class, 'logout']);
});