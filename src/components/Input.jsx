import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { randomString } from '../utils.js';

/**
 * @typedef {import("solid-js").JSX.InputHTMLAttributes<HTMLInputElement>} InputAttributes
 * @typedef {import("solid-js").JSX.SelectHTMLAttributes<HTMLSelectElement>} SelectAttributes
 * @typedef {import("solid-js").JSX.TextareaHTMLAttributes<HTMLTextAreaElement>} TextareaAttributes
 */

/**
 * @param {InputAttributes & SelectAttributes & TextareaAttributes & {
 * name: string,
 * label: string,
 * id?: string,
 * type?: "button"|"checkbox"|"color"|"date"|"datetime-local"|"email"|"file"|"hidden"|"image"|"month"|"number"|"password"|"radio"|"range"|"reset"|"search"|"submit"|"tel"|"text"|"time"|"url"|"week"|"textarea"|'select'
 * }} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['class', 'label', 'type', 'value']);
  props.id = props.id ?? `id_${randomString(6)}`;

  let tag;
  let children = props.children;

  if ('textarea' === local.type) {
    tag = 'textarea';
    children = local.value ?? '';
  } else if ('select' === local.type) {
    tag = 'select';
  } else {
    tag = 'input';
    props.type = local.type;
    if (local.value != undefined) {
      props.value = local.value;
    }
  }

  const isLabelAfter = ['radio', 'checkbox'].includes(local.type);

  return (
    <div classList={{ [local.class]: !!local.class }}>
      {!isLabelAfter && <label for={props.id}>{local.label}</label>}
      <Dynamic component={tag} class="" {...props}>
        {children}
      </Dynamic>
      {isLabelAfter && <label for={props.id}>{local.label}</label>}
    </div>
  );
}
