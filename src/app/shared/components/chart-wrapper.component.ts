import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart-wrapper',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="relative h-full w-full">
      <canvas
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="type"
      >
      </canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ChartWrapperComponent implements OnChanges {
  @Input() type: ChartType = 'doughnut';
  @Input() labels: string[] = [];
  @Input() data: any[] = []; // Can be number[] or complex objects depending on chart type
  @Input() options: ChartConfiguration['options'] = {};
  @Input() legend: boolean = true;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public chartData: ChartData<'doughnut' | 'line' | 'bar'> = {
    labels: [],
    datasets: [],
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['labels'] || changes['data']) {
      this.updateChart();
    }
    if (changes['options']) {
      this.chartOptions = { ...this.chartOptions, ...this.options };
    }
  }

  updateChart() {
    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          data: this.data,
          backgroundColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#ec4899',
            '#06b6d4',
          ],
          borderColor: 'transparent',
        },
      ],
    };

    // Special handling for multi-dataset charts if needed later
    // For now simplistic single dataset approach

    this.chart?.update();
  }
}
