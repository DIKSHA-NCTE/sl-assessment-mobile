import { Component, Input, Output, EventEmitter } from "@angular/core";

/**
 * Generated class for the PollOptionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "poll-option",
  templateUrl: "poll-option.html",
})
export class PollOptionComponent {
  @Input() selectedResponseType;
  @Input() options;
  @Input() canEditOption = false;
  @Input() canSubmit = false;
  @Output() editAction = new EventEmitter();
  @Output() response = new EventEmitter();
  selectedResponse: any;

  constructor() {
    console.log("Hello PollOptionComponent Component");
  }

  editOption(option) {
    this.editAction.emit(option);
  }

  updateResponse(opt) {
    Array.isArray(this.selectedResponse) ? null : (this.selectedResponse = []);
    const index = this.selectedResponse.indexOf(opt);
    index >= 0 ? this.selectedResponse.splice(index, 1) : this.selectedResponse.push(opt);
    this.emitResponse();
  }

  emitResponse(): void {
    console.log(this.selectedResponse);
    this.response.emit(this.selectedResponse);
  }
}
