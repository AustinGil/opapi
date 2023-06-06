import { splitProps } from 'solid-js';

/**
 * @typedef {import("solid-js").JSX.SvgSVGAttributes<SVGSVGElement>} SVGAttributes
 * @typedef {keyof definitions} SvgDef
 */

const definitions = {
  'icon-spinner': `<symbol id="icon-spinner" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 19a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" opacity=".3"/><circle cx="12" cy="2.5" r="1.5"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></circle></symbol>`,
  'icon-dice': `<symbol id="icon-dice" viewBox="0 0 32 32"><path d="M27 6h-16c-2.75 0-5 2.25-5 5v16c0 2.75 2.25 5 5 5h16c2.75 0 5-2.25 5-5v-16c0-2.75-2.25-5-5-5zM13 28c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM13 16c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM19 22c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM25 28c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM25 16c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM25.899 4c-0.467-2.275-2.491-4-4.899-4h-16c-2.75 0-5 2.25-5 5v16c0 2.408 1.725 4.432 4 4.899v-19.899c0-1.1 0.9-2 2-2h19.899z"></path></symbol>`,
};

/**
 * @param {SVGAttributes & {
 * alt: string,
 * } & (
 * { href: SvgDef, icon?: never } |
 * { icon: SvgDef, href?: never }
 * )} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['href', 'icon', 'alt']);

  return (
    <svg
      classList={{
        icon: !!local.icon,
        [String(local.icon)]: !!local.icon,
      }}
      role="presentation"
      {...props}
    >
      <use href={`#${local.href || local.icon}`} />
      {local.alt && <span class="visually-hidden">{local.alt}</span>}
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
      {/* eslint-disable-next-line solid/no-innerhtml */}
      <defs innerHTML={Object.values(definitions).join('')} />
    </svg>
  );
}
