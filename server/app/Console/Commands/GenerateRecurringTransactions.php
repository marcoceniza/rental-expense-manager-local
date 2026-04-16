<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;

class GenerateRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate-recurring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate recurring transactions for the current month';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $recurrings = RecurringTransaction::all();
    
        foreach ($recurrings as $r) {
    
            $exists = Transaction::where('recurring_id', $r->id)
                ->whereMonth('transaction_date', $today->month)
                ->whereYear('transaction_date', $today->year)
                ->where('is_recurring_generated', true)
                ->exists();
    
            if (!$exists && $today->day >= Carbon::parse($r->start_date)->day) {
    
                Transaction::create([
                    'category_id' => $r->category_id,
                    'amount' => $r->amount,
                    'description' => $r->description,
                    'transaction_date' => $today,
                    'recurring_id' => $r->id,
                    'is_recurring_generated' => true,
                ]);
            }
        }
    }
}
