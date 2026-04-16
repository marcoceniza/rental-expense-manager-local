<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Resources\RecurringTransactionResource;
use Illuminate\Http\Request;

class RecurringTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RecurringTransactionResource::collection(
            RecurringTransaction::with('category')->latest()->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRecurringTransactionRequest $request)
    {
        $recurring = RecurringTransaction::create($request->validated());

        return new RecurringTransactionResource($recurring->load('category'));
    }

    /**
     * Display the specified resource.
     */
    public function show(RecurringTransaction $recurringTransaction)
    {
        return $recurringTransaction->load('category');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreRecurringTransactionRequest $request, $id)
    {
        $recurring = RecurringTransaction::findOrFail($id);

        $recurring->update($request->validated());
    
        return new RecurringTransactionResource($recurring->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        RecurringTransaction::findOrFail($id)->delete();

        return response()->noContent();
    }
}
