import { Switch, Match } from 'solid-js';
import { randomString } from '../utils.js';

/** @typedef {import("solid-js").JSX.InputHTMLAttributes<HTMLInputElement>} InputAttributes */

/**
 * @param {InputAttributes & {
 * name: string,
 * label: string,
 * id?: string,
 * type?: "button"|"checkbox"|"color"|"date"|"datetime-local"|"email"|"file"|"hidden"|"image"|"month"|"number"|"password"|"radio"|"range"|"reset"|"search"|"submit"|"tel"|"text"|"time"|"url"|"week"|"textarea"
 * }} properties
 */
export default function Input(properties) {
  const { label, type = 'text', value = '', ...attributes } = properties;
  attributes.id = properties.id ?? `id_${randomString(6)}`;

  return (
    <div>
      <label for={attributes.id}>{label}</label>
      <Switch fallback={<input type={type} value={value} {...attributes} />}>
        <Match when={type === 'textarea'}>
          <textarea {...attributes}>{value}</textarea>
        </Match>
      </Switch>
    </div>
  );
}
