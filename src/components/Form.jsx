import { createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

/**
 * @typedef {import("solid-js").JSX.FormHTMLAttributes<HTMLFormElement>} FormAttributes
 */

/** @param {Event} event */
function jsFormSubmit(event) {
  /** @type {HTMLFormElement} */
  const form = event.currentTarget;
  const url = new URL(form.action);
  const formData = new FormData(form);
  const searchParameters = new URLSearchParams(formData);

  /** @type {Parameters<fetch>[1]} */
  const fetchOptions = {
    method: form.method,
  };

  if (form.method.toLowerCase() === 'post') {
    fetchOptions.body =
      form.enctype === 'multipart/form-data' ? formData : searchParameters;
  } else {
    url.search = searchParameters;
  }

  fetch(url, fetchOptions);

  event.preventDefault();
}

export function createForm() {
  const [valid, setValid] = createSignal(true);
  const [state, setState] = createStore({
    valid: true,
    pending: false,
  });
  /**
   * @typedef {Partial<{
   * valid: () => boolean,
   * pending: () => boolean,
   * }>} FormState
   * @type {(
   * (props: FormAttributes & {
   *     onValid?: (event:SubmitEvent) => unknown,
   *     onInvalid?: (event:SubmitEvent) => unknown,
   *   }
   * ) => import('solid-js').JSX.Element) & FormState}
   */
  const Form = (props) => {
    /** @type {HTMLFormElement|undefined} */
    let form;

    function validate() {
      if (!form) return;
      setValid(form.checkValidity());
      setState({ valid: form.checkValidity() });
    }
    onMount(() => {
      validate();
    });

    const onSubmit = async function (event) {
      console.log('setting', true);
      setState({ pending: true });
      if (props.onSubmit) {
        await props.onSubmit(event);
        setState({ pending: false });
        return;
      }

      const form = /** @type {HTMLFormElement} */ (event.target);
      if (!form.checkValidity() && props.onInvalid) {
        await props.onInvalid(event);
      } else if (props.onValid) {
        await props.onValid(event);
      } else {
        await jsFormSubmit(event);
      }
      await new Promise((r) => setTimeout(r, 500));
      console.log('setting', false);
      setState({ pending: false });
    };

    return (
      <form
        ref={form}
        {...props}
        onInput={validate}
        oncapture:blur={validate}
        onSubmit={onSubmit}
      >
        {props.children}
      </form>
    );
  };
  // Form.valid = () => valid(); //state.valid;
  Form.pending = () => state.pending;
  Form.valid = () => valid();

  return /** @type {typeof Form & Required<FormState>} */ (Form);
}

const globalForm = createForm();
// delete globalForm.valid;

export default globalForm;
