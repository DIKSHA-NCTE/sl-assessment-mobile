import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UtilsProvider } from '../../providers/utils/utils';

@Component({
  selector: 'input-type',
  templateUrl: 'input-type.html'
})
export class InputTypeComponent implements OnInit {

  @Input() data: any;
  @Input() isLast: boolean;
  @Input() isFirst: boolean;
  @Output() nextCallBack = new EventEmitter();
  @Output() previousCallBack = new EventEmitter()
  @Input() evidenceId: string;
  @Input() hideButton: boolean;
  @Input() schoolId: string;
  @Input() imageLocalCopyId: string;
  @Input() generalQuestion: boolean;

  
  notNumber: boolean;
  questionValid: boolean;

  constructor(private utils: UtilsProvider) {
    console.log('Hello RadioTypeComponent Component');

  }
  ngOnInit() {
    console.log(this.imageLocalCopyId);
    this.isaNumber();
    this.data.startTime = this.data.startTime ? this.data.startTime : Date.now();
    this.getErrorMsg();
    // this.checkForValidation();
  }


  next(status?: any) {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.nextCallBack.emit(status);
  }

  isaNumber() {
    this.notNumber =  this.utils.testRegex(this.data.validation.regex, this.data.value);
  }

  back() {
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.previousCallBack.emit('previous');
  }
  
  // checkForValidation(): void {
  //   this.questionValid = this.utils.isQuestionComplete(this.data);
  // }
  checkForValidation(): void {
    console.log("innn");
    this.data.isCompleted = this.utils.isQuestionComplete(this.data);
    this.data.endTime = this.data.isCompleted ? Date.now() : "";

  }

  getErrorMsg() {
    if(this.data.validation.regex){
      let string = this.data.validation.regex.split("[");
      string = string[1].split("]")[0];
      return "Should contain only values"+ string;
    }
  }

}
