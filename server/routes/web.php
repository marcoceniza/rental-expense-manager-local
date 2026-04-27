<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RecurringController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Single auth wrapper)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Shared
    Route::get('/me', fn (Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    // Reports (shared)
    Route::prefix('reports')->group(function () {
        Route::get('summary', [ReportController::class, 'summary']);
        Route::get('by-category', [ReportController::class, 'byCategory']);
        Route::get('annual', [ReportController::class, 'annual']);
        Route::get('category-summary', [ReportController::class, 'categorySummary']);
        Route::get('charity-year', [ReportController::class, 'charityYear']);
    });

    // USER (read-only)
    Route::prefix('user')->group(function () {
        Route::get('transactions', [TransactionController::class, 'index']);
    });

    // ADMIN (restricted)
    Route::prefix('admin')->middleware('admin')->group(function () {

        Route::get('transactions/trashed', [TransactionController::class, 'trashed']);
        Route::post('transactions/{id}/restore', [TransactionController::class, 'restore']);
        Route::delete('transactions/{id}/force-delete', [TransactionController::class, 'forceDelete']);

        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('transactions', TransactionController::class);
        Route::apiResource('recurrings', RecurringController::class);
    });

});