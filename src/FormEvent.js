class FormEvent {
  constructor(name, params = {}) {
    this.name = name;
    this.prevented = false;
    this.params = params;
  }

  preventDefault() {
    this.prevented = true;
  }

  allowed() {
    return this.prevented === false;
  }
}

export default FormEvent;
