import { splitProps, onMount, For } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';
import { randomString, isType } from '../utils.js';

/**
 * @typedef {import("solid-js").JSX.InputHTMLAttributes<HTMLInputElement>} InputAttributes
 * @typedef {import("solid-js").JSX.SelectHTMLAttributes<HTMLSelectElement>} SelectAttributes
 * @typedef {import("solid-js").JSX.TextareaHTMLAttributes<HTMLTextAreaElement>} TextareaAttributes
 */

export function createInput() {
  const [state, setState] = createStore({
    valid: true,
    dirty: false,
  });

  /**
   * @param {InputAttributes & SelectAttributes & TextareaAttributes & {
   * name: string,
   * label: string,
   * id?: string,
   * type?: "button"|"checkbox"|"color"|"date"|"datetime-local"|"email"|"file"|"hidden"|"image"|"month"|"number"|"password"|"radio"|"range"|"reset"|"search"|"submit"|"tel"|"text"|"time"|"url"|"week"|"textarea"|'select',
   * options?: Array<string | { label: string, value: string }>
   * }} p
   */
  function Input(p) {
    const [local, props] = splitProps(p, [
      'class',
      'label',
      'type',
      'value',
      'options',
    ]);
    props.id = props.id ?? `id_${randomString(6)}`;

    const isRadioCheckbox = ['radio', 'checkbox'].includes(local.type);
    const localOptions = (local.options ?? []).map((item, index) => {
      item = isType(item, 'object') ? item : { value: item, label: item };
      // Object.assign(item, props);
      if (isRadioCheckbox) {
        item.id = `${props.id}__input${index}`;
        item.type = local.type;
        item.name = props.name;
      }
      return item;
    });
    const isFieldset = isRadioCheckbox && localOptions.length;

    let tag;
    /** @type {HTMLInputElement|undefined} */
    let input;

    if ('textarea' === local.type) {
      tag = 'textarea';
    } else if ('select' === local.type) {
      tag = 'select';
    } else {
      tag = 'input';
      props.type = local.type;
      if (local.value != undefined) {
        props.value = local.value;
      }
    }

    function validate() {
      if (!input) return;
      setState({
        valid: input.checkValidity(),
      });
    }
    onMount(() => {
      validate();
    });
    function onBlur() {
      setState({ dirty: true });
      validate();
    }

    return (
      <div
        classList={{
          _dirty: state.dirty,
          [String(local.class)]: !!local.class,
        }}
      >
        {isFieldset && (
          <fieldset>
            <legend>{local.label}</legend>
            <For each={localOptions}>
              {(option) => (
                <>
                  <input {...option} />
                  <label for={option.id}>{option.label}</label>
                </>
              )}
            </For>
          </fieldset>
        )}
        {!isFieldset && (
          <>
            <label for={props.id}>{local.label}</label>
            <Dynamic
              ref={input}
              component={tag}
              {...props}
              onInput={validate}
              onBlur={onBlur}
            >
              {tag === 'textarea' && (local.value ?? '')}
              {tag === 'select' &&
                localOptions.map((option) => (
                  <option {...option} label={null}>
                    {option.label}
                  </option>
                ))}
            </Dynamic>
          </>
        )}

        {props.children}
      </div>
    );
  }
  Input.state = state;

  return Input;
}

const globalInput = createInput();
delete globalInput.state;

export default globalInput;
