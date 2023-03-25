import { mount, StartClient } from "solid-start/entry-client";
mount(() => <StartClient />, document);

/** @typedef {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} HTMLFormControl */

const FORM_CONTROL_TAGS = new Set(['input', 'textarea', 'select'])

window.addEventListener('blur', (event) => {
  const control = /** @type {HTMLFormControl} */ (event.target)
  if (!control) return
  if (!FORM_CONTROL_TAGS.has(control.localName)) return
  validateControl(control)
}, { capture: true })

window.addEventListener('invalid', (event) => {
  const control = /** @type {HTMLFormControl} */ (event.target)
  if (!control) return
  event.preventDefault()
  validateControl(control)
}, { capture: true })

/**
 * @param {HTMLFormControl} control 
 */
function validateControl(control) {
  const inputId = control.id || Math.random().toString(36).slice(2);
  control.id = inputId;
  const errorsId = `${inputId}-input-errors`;
  let descriptors = control.getAttribute('aria-describedby');
  descriptors = descriptors ? descriptors.split(' ') : [];
  descriptors = descriptors.filter((s) => s !== errorsId);

  const { validity } = control;
  control.setAttribute('aria-invalid', 'false');
  document.getElementById(errorsId)?.remove();

  if (!validity.valid) {
    control.setAttribute('aria-invalid', 'true');
    const errors = [];
    const errorContainer = document.createElement('div');
    errorContainer.id = errorsId;
    errorContainer.classList.add('control__errors');
    if (validity.valueMissing) {
      const error = control.dataset.errorRequired || `Field is required.`
      errors.push(error);
    }
    if (validity.typeMismatch) {
      const error = control.dataset.errorType || `Must be of type ${control.type}.`
      errors.push(error);
    }
    if (validity.rangeUnderflow) {
      const error = control.dataset.errorMin || `Must be greater than ${control.min}.`
      errors.push(error)
    }
    if (validity.rangeOverflow) {
      const error = control.dataset.errorMax || `Must be less than ${control.max}.`
      errors.push(error)
    }
    if (validity.tooShort) {
      const error = control.dataset.errorMinLength || `Must be longer than ${control.minLength}.`
      errors.push(error)
    }
    if (validity.tooLong) {
      const error = control.dataset.errorMaxLength || `Must be shorter than ${control.maxLength}.`
      errors.push(error)
    }
    if (validity.patternMismatch) {
      const error = control.dataset.errorPattern || `Does not match pattern (${control.pattern}).`
      errors.push(error)
    }
    errorContainer.innerText = errors.join(' ');
    descriptors.push(errorsId);
    control.after(errorContainer);
  }
  if (descriptors.length > 0) {
    control.setAttribute('aria-describedby', descriptors.join(' '));
  }
}