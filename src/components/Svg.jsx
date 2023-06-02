import { splitProps, Show } from 'solid-js';

/**
 * @typedef {import("solid-js").JSX.SvgSVGAttributes<SVGElement>} SVGAttributes
 */

const defs = {
  'icon-spinner': `<symbol id="icon-spinner" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 19a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" opacity=".3"/><circle cx="12" cy="2.5" r="1.5"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></circle></symbol>`,
};

/**
 * @param {SVGAttributes & {
 * href?: keyof defs,
 * icon?: keyof defs,
 * alt: string,
 * }} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['href', 'icon', 'alt']);
  const target = local.href || local.icon;

  return (
    <svg
      classList={{
        icon: !!local.icon,
        'icon-home': true,
      }}
      {...props}
    >
      <use href={`#${target}`} />
      <Show when={true}>
        <span class="visually-hidden">{local.alt}</span>
      </Show>
    </svg>
  );
}

export function SvgDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '0',
        height: '0',
        overflow: 'hidden',
      }}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs innerHTML={Object.values(defs).join('')} />
    </svg>
  );
}
