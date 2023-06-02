import { splitProps, createUniqueId, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

/**
 * @typedef {import("solid-js").JSX.DialogHtmlAttributes<HTMLDialogElement>} DialogAttributes
 * @typedef {import('solid-js').JSXElement} JSXElement
 * @typedef {(e:CustomEvent) => void} EventHandler
 */

/**
 * @param {DialogAttributes & {
 * toggle: JSXElement,
 * open: Boolean,
 * children?: JSXElement | ((s: {
 *   close: HTMLDialogElement['close'],
 * }) => JSXElement),
 * 'on:change'?: EventHandler,
 * }} p
 */
export default function (p) {
  const [local, props] = splitProps(p, ['id', 'toggle', 'open']);
  const id = local.id ?? createUniqueId();
  const [state, setState] = createStore({
    isOpen: false,
  });

  /** @type {HTMLDialogElement|undefined} */
  let dialog = undefined;
  const children = props.children;

  function show() {
    setState({ isOpen: true });
  }
  function close() {
    setState({ isOpen: false });
  }
  /** @param {MouseEvent} event */
  function onClick(event) {
    // @ts-ignore
    if (event.target.localName !== 'dialog') return;
    close();
  }

  createEffect(() => {
    if (!dialog) return;
    if (state.isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
    dialog.dispatchEvent(new CustomEvent('change', { detail: state.isOpen }));
  });
  createEffect(() => {
    setState({ isOpen: local.open });
  });

  return (
    <>
      {local.toggle && (
        <button aria-controls={id} aria-expanded={state.isOpen} onClick={show}>
          {local.toggle}
        </button>
      )}
      {/* onClose doesn't work. Must be onclose */}
      {/* @ts-ignore */}
      <dialog ref={dialog} id={id} {...props} onclose={close} onClick={onClick}>
        <div class="p-2">
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      </dialog>
    </>
  );
}
