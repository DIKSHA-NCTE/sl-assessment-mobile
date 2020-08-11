import { Component, Input, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

/**
 * Generated class for the BarChartComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bar-chart',
  templateUrl: 'bar-chart.html'
})
export class BarChartComponent implements OnInit {

  @Input() data;
  @Input() questionNumber;
  Highcharts = Highcharts; // required
  chartConstructor = 'chart'; // optional string, defaults to 'chart'
  updateFlag = false; // optional boolean
  oneToOneFlag = true; // optional boolean, defaults to false
  runOutsideAngular = false;
  chartObj;

  constructor() {
    console.log('Hello BarChartComponent Component');
  }

  ngOnInit() {
    if (this.data && this.data.chart && this.data.chart.data) {
      for (const instance of this.data.chart.data) {
        const array = []
        for (let value of instance.data) {
          array.push(parseFloat(value));
        }
        instance.data = array;
      }
    }

    this.chartObj = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: this.data.chart.type ? this.data.chart.type :'bar'
      },
      title: {
        text: " "
      },
      xAxis: this.data.chart.xAxis,
      yAxis: this.data.chart.yAxis,
      tooltip: {
        // pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: this.data.chart.plotOptions ? this.data.chart.plotOptions : ({
        bar: {
          dataLabels: {
            enabled: false
          },
          showInLegend: false
        }
      }),
      series: this.data.chart.data,
      legend: this.data.chart.legend ? this.data.chart.legend : ({
        "enabled": false
      })

    }

  }

}