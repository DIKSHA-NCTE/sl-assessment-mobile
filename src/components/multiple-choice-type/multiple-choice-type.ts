import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { UtilsProvider } from "../../providers/utils/utils";
import { HintProvider } from "../../providers/hint/hint";

@Component({
  selector: "multiple-choice-type",
  templateUrl: "multiple-choice-type.html",
})
export class MultipleChoiceTypeComponent implements OnInit {
  text: string;
  @Input() data: any;
  @Input() isLast: boolean;
  @Input() isFirst: boolean;
  @Output() nextCallBack = new EventEmitter();
  @Output() previousCallBack = new EventEmitter();
  @Input() evidenceId: string;
  @Input() hideButton: boolean;
  @Input() schoolId: string;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;
  @Input() submissionId: any;
  @Input() inputIndex;
  @Input() enableQuestionReadOut: boolean;
  constructor(private utils: UtilsProvider, private hintService: HintProvider) {
    console.log("Hello checkboxTypeComponent Component");
    this.text = "Hello World";

    // if(!this.data.value) {
    //   this.data.value = [];
    // }
  }
  ngOnInit() {
    this.data.value = this.data.value ? this.data.value : [];
    this.data.startTime = this.data.startTime
      ? this.data.startTime
      : Date.now();

    if (
      !this.data.validation.required ||
      (this.data.value && this.data.value.length)
    ) {
      this.data.isCompleted = true;
    }
  }

  updateModelValue(val) {
    if (this.data.value.indexOf(val) > -1) {
      let index = this.data.value.indexOf(val);
      this.data.value.splice(index, 1);
    } else {
      this.data.value.push(val);
    }
    this.checkForValidation();
    console.log(this.data.value);
  }

  next(status?: string) {
    // this.utils.isQuestionComplete(this.data);
    console.log(this.utils.isQuestionComplete(this.data));
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.nextCallBack.emit(status);
  }

  back() {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.previousCallBack.emit("previous");
  }

  checkForValidation(): void {
    console.log("innnn");
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";
  }

  openHint(hint) {
    this.hintService.presentHintModal({ hint: hint });
  }
}
