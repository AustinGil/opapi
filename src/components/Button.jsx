import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

/**
 * @typedef {import("solid-js").JSX.ButtonHTMLAttributes<HTMLButtonElement>} ButtonAttributes
 * @typedef {import("solid-js").JSX.AnchorHTMLAttributes<HTMLAnchorElement>} AnchorAttributes
 */

/**
 * @param {ButtonAttributes & AnchorAttributes & {
 * }} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['class']);
  let tag = 'button';
  if (props.href) {
    tag = 'A';
  } else {
    props.type = props.type ?? 'button';
  }

  return (
    <Dynamic
      component={tag}
      class={local.class && ` ${local.class}`}
      {...props}
    >
      {props.children}
    </Dynamic>
  );
}
