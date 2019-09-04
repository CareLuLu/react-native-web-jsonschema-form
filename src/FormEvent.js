class FormEvent {
  constructor(name, params = {}) {
    this.name = name;
    this.prevented = false;
    this.params = params;
  }

  preventDefault() {
    this.prevented = true;
  }

  isDefaultPrevented() {
    return this.prevented === true;
  }
}

export default FormEvent;
