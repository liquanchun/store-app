import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DynamicFieldDirective } from './components/dynamic-field/dynamic-field.directive';
import { DynamicFormComponent } from './containers/dynamic-form/dynamic-form.component';
import { FormButtonComponent } from './components/form-button/form-button.component';
import { FormInputComponent } from './components/form-input/form-input.component';
import { FormSelectComponent } from './components/form-select/form-select.component';
import { FormCheckComponent } from './components/form-check/form-check.component';
import { FormTrueFalseComponent } from './components/form-truefalse/form-truefalse.component';
import { FormDatepickerComponent } from './components/form-datepicker/form-datepicker.component';
import { FormMultiSelectComponent } from './components/form-multiselect/form-multiselect.component';
import { FormTextareaComponent } from './components/form-textarea/form-textarea.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { GlobalState } from '../../../global.state';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    MultiselectDropdownModule,
  ],
  declarations: [
    DynamicFieldDirective,
    DynamicFormComponent,
    FormButtonComponent,
    FormInputComponent,
    FormSelectComponent,
    FormCheckComponent,
    FormTrueFalseComponent,
    FormDatepickerComponent,
    FormMultiSelectComponent,
    FormTextareaComponent
  ],
  exports: [
    DynamicFormComponent
  ],
  entryComponents: [
    FormButtonComponent,
    FormInputComponent,
    FormSelectComponent,
    FormCheckComponent,
    FormTrueFalseComponent,
    FormDatepickerComponent,
    FormMultiSelectComponent,
    FormTextareaComponent
  ],
  providers: [GlobalState]
})
export class DynamicFormModule { }
