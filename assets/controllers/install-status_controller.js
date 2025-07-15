'use strict';

import { Controller } from '@hotwired/stimulus';

export default class extends Controller {

  static targets = ['button'];

  initialize() {
    super.initialize();
    console.log("hello from " + this.identifier);
  }

  notInstalled = () => {
    console.log('notInstalled');
    this.element.removeAttribute('hidden');
  }

  installed = () => {
    console.log('installed');
    this.element.setAttribute('hidden', '');
  }
}
