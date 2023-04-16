import { createSignal, onMount } from 'solid-js';

const [getValidity, setValidity] = createSignal(true);

/**
 * @typedef {import("solid-js").JSX.FormHTMLAttributes<HTMLFormElement>} FormAttributes
 */
/**
 * @param {FormAttributes & {
 * }} props
 */
const Form = (props) => {
  /** @type {HTMLFormElement|undefined} */
  let form;

  function validate() {
    if (!form) return;
    setValidity(form.checkValidity());
  }
  onMount(() => {
    validate();
  });

  return (
    <form ref={form} {...props} onInput={validate} oncapture:blur={validate}>
      {/* {typeof props.children === 'function'
          ? props.children(() => getValidity())
          : props.children} */}
      {props.children}
    </form>
  );
};
Form.getValidity = () => getValidity();

export default Form;
