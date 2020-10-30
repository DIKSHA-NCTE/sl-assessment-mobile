import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";

/**
 * Generated class for the SimpleListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "simple-list",
  templateUrl: "simple-list.html",
})
export class SimpleListComponent implements OnInit {
  @Input() heading: string;
  @Input() subheading: string;
  @Input() forwardIcon: string;
  @Input() viewReport: string;
  @Input() status: string;
  @Output() reportAction = new EventEmitter();
  text: string;
  color: string;

  constructor() {
    console.log("Hello SimpleListComponent Component");
    this.text = "Hello World";
  }
  ngOnInit(): void {
    this.setStatusColor();
  }

  onViewReport() {
    
    this.reportAction.emit();
  }

  setStatusColor(): void {
    switch (this.status) {
      case "started":
        this.color = "orange";
        break;
      case "completed":
        this.color = "lightgreen";
        break;
      case "expired":
        this.color = "grey";
        break;

      default:
        break;
    }
  }
}
