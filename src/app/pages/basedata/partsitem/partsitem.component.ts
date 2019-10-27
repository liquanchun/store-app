import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { FieldConfig } from '../../../theme/components/dynamic-form/models/field-config.interface';
import { PartsComponent } from '../parts/parts.component';
import { PartsComboComponent } from '../partscombo/partscombo.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-partsitem',
  templateUrl: './partsitem.component.html'
})
export class PartsItemComponent implements OnInit {
  ngOnInit() {}
}
