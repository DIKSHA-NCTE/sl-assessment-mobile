import { Component, Input, EventEmitter, Output } from "@angular/core";

/**
 * Generated class for the ReportEntityListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "report-entity-list",
  templateUrl: "report-entity-list.html",
})
export class ReportEntityListComponent {
  text: string;
  @Input() entities;
  @Output() selectEntityEvent = new EventEmitter();
  @Output() viewInstanceReportEvent = new EventEmitter();
  constructor() {
    console.log("Hello ReportEntityListComponent Component");
    this.text = "Hello World";
  }

  selectEntity(entity) {
    // console.log(JSON.stringify(entity))
    this.selectEntityEvent.emit(entity);
  }
  viewInstanceReport(entity) {
    this.viewInstanceReportEvent.emit(entity);
  }
}
