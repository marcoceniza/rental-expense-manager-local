<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
        // return $this->user()->id === $this->category->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => 'sometimes|required|string|max:255',
            'is_tuition' => 'sometimes|boolean',
            'type' => [
                'sometimes',
                'required',
                'in:income,expense,liability',
                function ($attribute, $value, $fail) use ($category) {
                    if (
                        $category &&
                        $category->transactions()->exists() &&
                        $value !== $category->type
                    ) {
                        $fail('Cannot change type of category with transactions.');
                    }
                }
            ],
        ];
    }
}
