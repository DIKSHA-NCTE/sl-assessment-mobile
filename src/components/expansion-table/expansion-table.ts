import { Component, Input } from "@angular/core";

/**
 * Generated class for the ExpansionPanel_2Component component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "expansion-table",
  templateUrl: "expansion-table.html",
})
export class ExpansionTableComponent {
  @Input() datas;

  text: string;

  constructor() {
    console.log("Hello ExpansionTable Component");
    this.text = "Hello World";
  }
}
