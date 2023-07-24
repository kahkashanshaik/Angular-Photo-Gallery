import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  handlerMessage = '';
  roleMessage = '';
  constructor() {}
  public alertButtons = [{
    text: 'Cancel',
    role: 'cancel',
    handler: () => {
      this.handlerMessage = "Alert Canceled";
    }
  },{
    text: 'Ok',
    role: 'confirm',
    handler: () => {
      this.handlerMessage = "Alert Confirm"
    }
  },]
  setResult(ev:any) {
    this.roleMessage = `Dismissed With role: ${ev.detail.role}`
  }

  public alertInputs = [
    {
      placeholder: 'Name',
    },
    {
      placeholder: 'Nickname (max 8 characters)',
      attributes: {
        maxlen: 8
      }
    },
    {
      type: 'number',
      placeholder: 'Age',
      min: 1,
      max: 100
    },
    {
      type: 'textarea',
      placeholder: 'A little About Yourself'
    },
    {
      label: 'Red',
      type: 'radio',
      value: 'red',
    },
    {
      label: 'Blue',
      type: 'radio',
      value: 'blue',
    },
    {
      label: 'Green',
      type: 'radio',
      value: 'green',
    },

  ]
 
}
