import { Component, OnInit, AfterViewInit, ViewChild, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { FieldConfig } from './theme/components/dynamic-form/models/field-config.interface';
import { DynamicFormComponent }
  from './theme/components/dynamic-form/containers/dynamic-form/dynamic-form.component';
import * as _ from 'lodash';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{title}}</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body" style="padding-bottom:5px;">
      <dynamic-form [config]="config" #form="dynamicForm">
      </dynamic-form>
      <input type="hidden" [value]="form.value | json" #formvalue>
    </div>
    <div class="modal-footer btn-group">
      <button type="button" class="btn btn-success" (click)="onSave(formvalue.value)"><i class="fa fa-floppy-o" aria-hidden="true"></i> 保存</button>
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('no')"><i class="fa fa-undo" aria-hidden="true"></i> 取消</button>
    </div>
  `
})
export class NgbdModalContent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  @Input() title;
  @Input() config;
  @Input() formValue: any;
  @Input() saveFun: any;
  constructor(public activeModal: NgbActiveModal) {

  }
  ngOnInit() {

  }
  onSave(formValue) {
    const that = this;
    this.saveFun(formValue, function () {
      that.activeModal.close('no');
    });
  }
  ngAfterViewInit() {
    const that = this;
    _.delay(function (that) {
      const sf = that;
      _.each(that.config, (e) => {
        if (sf.formValue && sf.formValue[e.name]) {
          if (_.isArray(sf.formValue[e.name]) || _.isObject(sf.formValue[e.name])) {
            sf.form.setValue(e.name, sf.formValue[e.name]);
          } else {
            sf.form.setValue(e.name, sf.formValue[e.name].toString());
          }
        }
      });
    }, 50, this);
  }
}