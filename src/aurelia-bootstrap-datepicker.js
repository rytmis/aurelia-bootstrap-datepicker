import {customElement, bindable, inject, TaskQueue} from 'aurelia-framework';
import {BindingEngine} from 'aurelia-binding';
import 'bootstrap-datepicker';
import 'es6-object-assign';

let id = 0;
function getId() {
  id += 1;
  return id;
}

let defaultOptions = {
  autoclose: true,
  placeholder: ''
};

@customElement('bootstrap-datepicker')
@inject(Element, BindingEngine, TaskQueue)
@bindable('value', 'dpOptions', 'placeholder')
export class AureliaBootstrapDatepicker {

  constructor(element, bindingEngine, taskQueue) {
    this.element = element;
    this.bindingEngine = bindingEngine;
    this.taskQueue = taskQueue;
    this.id = getId();
  }

  attached() {
    this.__pickerElement = $(this.datepicker);

    this.dpOptions = this.dpOptions || { };
    let parentElement = this.element.parentElement;
    if (!parentElement.id) {
      parentElement.id = `au-bootstrap-picker-host-${this.id}`;
    }

    let options = Object.assign({}, defaultOptions, {container: `#${parentElement.id}`}, this.dpOptions);

    this.__pickerElement
      .datepicker(options)
      .on('changeDate', (e) => {
        this.__internalUpdate(() => {
          let changeDateEvent = new CustomEvent('changedate', {detail: {event: e}, bubbles: true});
          this.element.dispatchEvent(changeDateEvent);
          this.value = this.__pickerElement.datepicker('getDate');
        });
      });

    this.valueChanged();
  }

  bind() {
    this.placeholder = this.placeholder || '';
  }

  valueChanged() {
    this.__updateGuard(() => {
      let date = (this.value && this.value.toDate) ? this.value.toDate() : this.value;
      this.__pickerElement.datepicker('setDate', date);
    });
  }

  __internalUpdate(fn) {
    this.__updatingInternalState__ = true;

    fn();
    this.taskQueue.flushMicroTaskQueue();

    this.__updatingInternalState__ = false;
  }

  __updateGuard(fn) {
    if (this.__updatingInternalState__) {
      return;
    }

    fn();
  }
}
