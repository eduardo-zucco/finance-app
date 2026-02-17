import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { FinanceService } from '../services/finance.service';
import { Transaction } from '../models/transaction.model';
import { AddTransactionModalComponent } from '../components/add-transaction-modal/add-transaction-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, BaseChartDirective],
})
export class HomePage implements OnInit {
  transactions: Transaction[] = [];
  totalIncome = 0;
  totalExpense = 0;

  chartData: ChartData<'doughnut'> = {
    labels: ['Receitas', 'Despesas'],
    datasets: [{ data: [0, 0], backgroundColor: ['#10b981', '#ef4444'] }],
  };

  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  constructor(
    private financeService: FinanceService,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.financeService.transactions$.subscribe((data) => {
      this.transactions = data;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.totalIncome = this.transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    this.totalExpense = this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    this.chartData = {
      ...this.chartData,
      datasets: [
        {
          ...this.chartData.datasets[0],
          data: [this.totalIncome, this.totalExpense],
        },
      ],
    };
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: AddTransactionModalComponent,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.financeService.addTransaction(result.data);
      }
    });

    await modal.present();
  }

  deleteTransaction(id: string) {
    this.financeService.deleteTransaction(id);
  }
}
