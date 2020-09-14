import { Component } from "@angular/core";
import Highcharts from "highcharts";
import { NavParams } from "ionic-angular";
import { PollProvider } from "../../providers/poll/poll";
import { UtilsProvider } from "../../../../providers/utils/utils";

/**
 * Generated class for the ResultGraphComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "result-graph",
  templateUrl: "result-graph.html",
})
export class ResultGraphComponent {
  Highcharts = Highcharts; // required
  chartConstructor = "chart"; // optional string, defaults to 'chart'
  updateFlag = false; // optional boolean
  oneToOneFlag = true; // optional boolean, defaults to false
  runOutsideAngular = false;
  chartObj: any = {};

  constructor(public params: NavParams, public pollProvider: PollProvider, public utils: UtilsProvider) {
    console.log("Hello ResultGraphComponent Component");
    this.getPollResult();
  }

  getPollResult(): void {
    const pollId = this.params.get("pollId");
    this.utils.startLoader();
    this.pollProvider
      .getPollResult(pollId)
      .then((res: any) => {
        res ? (this.chartObj = res[0]) : (this.chartObj = null);
        if (this.chartObj) {
          this.chartObj["yAxis"] = { max: 100 };
          console.log(this.chartObj);
        }
        this.utils.stopLoader();
      })

      .catch(() => this.utils.stopLoader());
  }
}
