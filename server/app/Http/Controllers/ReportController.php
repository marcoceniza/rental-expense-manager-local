<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use Carbon\Carbon;

class ReportController extends Controller
{
    // ✅ CENTRAL QUERY (reusable for all reports)
    private function baseTransactionQuery($start, $end)
    {
        $query = Transaction::with('category')
            ->whereBetween('transaction_date', [$start, $end]);

        // 👇 role-based filtering
        if (auth()->user()->user_type === 'user') {
            $query->whereHas('category', function ($q) {
                $q->where('is_other', false);
            });
        }

        return $query;
    }

    public function summary(Request $request)
    {
        $start = $request->start_date;
        $end = $request->end_date;

        $query = $this->baseTransactionQuery($start, $end);

        $income = (clone $query)->where('type', 'income')->sum('amount');
        $expenses = (clone $query)->where('type', 'expense')->sum('amount');
        $liabilities = (clone $query)->where('type', 'liability')->sum('amount');

        return response()->json([
            'income' => $income,
            'expenses' => $expenses,
            'liabilities' => $liabilities,
            'net' => $income - ($expenses + $liabilities),
        ]);
    }

    public function byCategory(Request $request)
    {
        $query = $this->baseTransactionQuery($request->start_date, $request->end_date);

        return $query->get()
            ->groupBy('category.name');
    }

    public function annual(Request $request)
    {
        $year = $request->year;

        $monthly = collect(range(1, 12))->map(function ($month) use ($year) {

            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();

            $query = $this->baseTransactionQuery($start, $end);

            $income = (clone $query)->where('type', 'income')->sum('amount');
            $expense = (clone $query)->where('type', 'expense')->sum('amount');
            $liability = (clone $query)->where('type', 'liability')->sum('amount');

            return [
                'month' => $start->format('F'),
                'income' => $income,
                'expense' => $expense,
                'liability' => $liability,
                'net' => $income - ($expense + $liability),
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

        $query = $this->baseTransactionQuery(
            Carbon::create($year, 1, 1),
            Carbon::create($year, 12, 31)
        );

        $data = $query->get()
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

        $start = Carbon::create($year, 1, 1)->startOfYear();
        $end = Carbon::create($year, 12, 31)->endOfYear();

        $query = $this->baseTransactionQuery($start, $end)
            ->where('type', 'expense')
            ->whereHas('category', function ($q) {
                $q->where('is_tuition', true);
            });

        return $this->buildYearResponse($query, $year);
    }

    public function otherYear(Request $request)
    {
        $year = $request->year;

        $start = Carbon::create($year, 1, 1)->startOfYear();
        $end = Carbon::create($year, 12, 31)->endOfYear();

        $query = $this->baseTransactionQuery($start, $end)
            ->whereHas('category', function ($q) {
                $q->where('is_other', true);
            });

        return $this->buildYearResponse($query, $year);
    }

    private function buildYearResponse($query, $year)
    {
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