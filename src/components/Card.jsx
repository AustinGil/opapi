import { splitProps } from 'solid-js';

/**
 * @typedef {import("solid-js").JSX.HTMLAttributes<HTMLElement>} HtmlAttributes
 */

/**
 * @param {HtmlAttributes & {
 * }} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['class']);

  return (
    <article
      class="bg-[canvas] border border-2 rounded-lg p-4"
      classList={{ [String(local.class)]: !!local.class }}
      {...props}
    >
      {props.children}
    </article>
  );
}
