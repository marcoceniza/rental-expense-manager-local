<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $transactions = Transaction::whereBetween('transaction_date', [$start, $end]);

        $income = (clone $transactions)->where('type', 'income')->sum('amount');
        $expenses = (clone $transactions)->where('type', 'expense')->sum('amount');
        $liabilities = (clone $transactions)->where('type', 'liability')->sum('amount');

        return response()->json([
            'income' => $income,
            'expenses' => $expenses,
            'liabilities' => $liabilities,
            'net' => $income - ($expenses + $liabilities),
        ]);
    }

    public function byCategory(Request $request)
    {
        return Transaction::with('category')
            ->whereBetween('transaction_date', [$request->start_date, $request->end_date])
            ->get()
            ->groupBy('category.name');
    }
    
    public function annual(Request $request)
    {
        $year = $request->year;
    
        $monthly = collect(range(1, 12))->map(function ($month) use ($year) {
            $start = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $end = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();
    
            $transactions = Transaction::whereBetween('transaction_date', [$start, $end]);
    
            $income = (clone $transactions)->where('type', 'income')->sum('amount');
            $expenses = (clone $transactions)->where('type', 'expense')->sum('amount');
            $liabilities = (clone $transactions)->where('type', 'liability')->sum('amount');
    
            return [
                'month' => $start->format('F'),
                'income' => $income,
                'expense' => $expenses,
                'liability' => $liabilities,
                'net' => $income - ($expenses + $liabilities),
            ];
        });
    
        return response()->json([
            'monthly' => $monthly,
            'totals' => [
                'income' => $monthly->sum('income'),
                'expense' => $monthly->sum('expense'),
                'liability' => $monthly->sum('liability'),
                'net' => $monthly->sum('net'),
            ]
        ]);
    }
    
    public function categorySummary(Request $request)
    {
        $year = $request->year;
    
        $data = Transaction::with('category')
            ->whereYear('transaction_date', $year)
            ->get()
            ->groupBy('category.name')
            ->map(function ($items, $categoryName) {
                $first = $items->first();
    
                return [
                    'name' => $categoryName,
                    'type' => $first->category->type ?? 'unknown',
                    'total' => $items->sum('amount'),
                ];
            })
            ->values();
    
        return response()->json($data);
    }

    public function charityYear(Request $request)
    {
        $year = $request->year;

        $start = \Carbon\Carbon::create($year, 1, 1)->startOfYear();
        $end = \Carbon\Carbon::create($year, 12, 31)->endOfYear();

        // ✅ directly filter via relationship (better than pluck IDs)
        $query = Transaction::whereBetween('transaction_date', [$start, $end])
            ->where('type', 'expense')
            ->whereHas('category', function ($q) {
                $q->where('is_tuition', true);
            });

        $expense = (clone $query)->sum('amount');

        $transactions = (clone $query)
            ->with('category')
            ->orderByDesc('transaction_date')
            ->get();

        return response()->json([
            'year' => $year,
            'expense' => $expense,
            'transactions' => $transactions,
        ]);
    }
}
