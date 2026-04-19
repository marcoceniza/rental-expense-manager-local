<?php

namespace App\Http\Controllers;

use App\Models\Recurring;
use App\Http\Requests\StoreRecurringRequest;
use App\Http\Resources\RecurringResource;
use Illuminate\Http\Request;

class RecurringController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RecurringResource::collection(
            Recurring::with('category')->latest()->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRecurringRequest $request)
    {
        $recurring = Recurring::create($request->validated());

        return new RecurringResource($recurring->load('category'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Recurring $recurring)
    {
        return new RecurringResource($recurring->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreRecurringRequest $request, $id)
    {
        $recurring = Recurring::findOrFail($id);

        $recurring->update($request->validated());
    
        return new RecurringResource($recurring->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Recurring::findOrFail($id)->delete();

        return response()->noContent();
    }
}
