import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';

/**
 * @typedef {import("solid-js").JSX.FormHTMLAttributes<HTMLFormElement>} FormAttributes
 * @typedef {import('solid-js').JSXElement} JSXElement
 */

/** @param {Event} event */
function jsFormSubmit(event) {
  const form = /** @type {HTMLFormElement} */ (event.currentTarget);
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

  event.preventDefault();

  return fetch(url, fetchOptions);
}

/**
 * @param {FormAttributes & {
 * onValid?: (event:SubmitEvent) => unknown,
 * onInvalid?: (event:SubmitEvent) => unknown,
 * onResolve?: (response:Response) => unknown,
 * onReject?: (error:unknown) => unknown,
 * children?: JSXElement | ((s: {
 *   valid:boolean,
 *   pending:boolean,
 *   data:FormData|undefined,
 *   results:unknown,
 * }) => JSXElement)
 * }} props
 */
export default (props) => {
  const [state, setState] = createStore({
    valid: true,
    pending: false,
    /** @type {FormData|undefined} */
    data: undefined,
    /** @type {unknown} */
    results: undefined,
  });
  /** @type {HTMLFormElement|undefined} */
  let form;

  function validate() {
    if (!form) return;
    setState({ valid: form.checkValidity() });
  }
  onMount(() => {
    validate();
  });

  const onSubmit = async function (/** @type {SubmitEvent} */ event) {
    const form = /** @type {HTMLFormElement} */ (event.target);
    let results;
    setState({
      pending: true,
      data: new FormData(form),
      results: results,
    });

    try {
      if (props.onSubmit) {
        results = await props.onSubmit(event);
        setState({ pending: false, results: results });
      } else if (!form.checkValidity() && props.onInvalid) {
        results = await props.onInvalid(event);
      } else if (props.onValid) {
        results = await props.onValid(event);
      } else {
        results = await jsFormSubmit(event);
      }
      if (props.onResolve) props.onResolve(results);
    } catch (error) {
      if (props.onReject) props.onReject(error);
    } finally {
      setState({ pending: false, results: results });
    }
  };

  const children = props.children;

  return (
    <form
      ref={form}
      {...props}
      onInput={validate}
      // @ts-ignore
      oncapture:blur={validate}
      onSubmit={onSubmit}
    >
      {typeof children === 'function'
        ? // eslint-disable-next-line prettier/prettier
        children(state)
        : children}
    </form>
  );
};
