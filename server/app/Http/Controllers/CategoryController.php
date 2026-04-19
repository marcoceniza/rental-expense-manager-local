<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::withCount('transactions')->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return new CategoryResource($category);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return new CategoryResource($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return new CategoryResource($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        if ($category->transactions()->exists()) {
            return response()->json([
                'message' => 'Category is in use and cannot be deleted.'
            ], 400);
        }
        
        $category->delete();

        return response()->noContent();
    }
    
    /**
     * Restore category.
     */
    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->restore();

        return response()->noContent();
    }
    
    /**
     * Force delete category.
     */
    public function forceDelete($id)
    {
        $category = Category::withTrashed()->findOrFail($id);

        if ($category->transactions()->exists()) {
            return response()->json([
                'error' => 'Category has transactions'
            ], 400);
        }

        $category->forceDelete();

        return response()->noContent();
    }
}
