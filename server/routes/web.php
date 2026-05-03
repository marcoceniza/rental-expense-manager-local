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
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // current user
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | REPORTS (ALL AUTH USERS)
    |--------------------------------------------------------------------------
    */
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/by-category', [ReportController::class, 'byCategory']);
    Route::get('/reports/annual', [ReportController::class, 'annual']);
    Route::get('/reports/category-summary', [ReportController::class, 'categorySummary']);
    Route::get('/reports/charity-year', [ReportController::class, 'charityYear']);

    /*
    |--------------------------------------------------------------------------
    | USER ROUTES (same endpoint, backend decides access)
    |--------------------------------------------------------------------------
    */
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY ROUTES (SECURITY LAYER)
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->group(function () {

        Route::get('/reports/other-year', [ReportController::class, 'otherYear']);
        Route::post('/create-user', [AuthController::class, 'createUser']);

        // extra admin actions
        Route::get('/transactions/trashed', [TransactionController::class, 'trashed']);
        Route::post('/transactions/{id}/restore', [TransactionController::class, 'restore']);
        Route::delete('/transactions/{id}/force-delete', [TransactionController::class, 'forceDelete']);

        // full CRUD
        Route::apiResource('categories', CategoryController::class)->except(['index']);
        Route::apiResource('transactions', TransactionController::class)->withTrashed()->except(['index']);
        Route::apiResource('recurrings', RecurringController::class);
    });

});