<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionCollection;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TransactionResource::collection(
            Transaction::with('category')->dashboardVisible()->latest('transaction_date')->paginate(10)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        $data = $request->validated();

        $transaction = Transaction::create($data);

        return new TransactionResource(
            $transaction->load('category')
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        return new TransactionResource(
            $transaction->load('category')
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        $data = $request->validated();

        $transaction->update($data);

        return new TransactionResource(
            $transaction->load('category')
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return response()->noContent();
    }

    /**
    * Get trashed transactions.
    */
    public function trashed()
    {
        return Transaction::onlyTrashed()->with('category')->latest('transaction_date')->paginate(10);
    }

    /**
     * Restore transaction.
     */
    public function restore($id)
    {
        $transaction = Transaction::withTrashed()->findOrFail($id);
        $transaction->restore();

        return response()->noContent();
    }
    
    /**
     * Force delete transaction.
     */
    public function forceDelete($id)
    {
        $transaction = Transaction::withTrashed()->findOrFail($id);

        $transaction->forceDelete();

        return response()->noContent();
    }
}
