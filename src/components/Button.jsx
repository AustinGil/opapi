import { splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { Svg } from './index.js';

/**
 * @typedef {import("solid-js").JSX.ButtonHTMLAttributes<HTMLButtonElement>} ButtonAttributes
 * @typedef {import("solid-js").JSX.AnchorHTMLAttributes<HTMLAnchorElement>} AnchorAttributes
 */

/**
 * @param {ButtonAttributes & AnchorAttributes & {
 * loading?: boolean
 * }} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['loading']);
  let tag = 'button';
  let type = 'button';
  if (props.href) {
    tag = 'A';
  } else {
    type = props.type ?? 'button';
  }

  return (
    <Dynamic
      component={tag}
      aria-disabled={local.loading || props['aria-disabled']}
      type={type}
      {...props}
    >
      {local.loading ? (
        <Svg icon="icon-spinner" alt="loading" />
      ) : (
        props.children
      )}
    </Dynamic>
  );
}
