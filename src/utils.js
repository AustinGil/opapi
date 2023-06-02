/**
 * Generates a random string of the give length made up of the allowed characters.
 *
 * @param {number} [length=10] - Length of resulting string.
 * @param {string} [allowed=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789] - Characters allowed in the results.
 * @returns {string}
 */
export function randomString(
  length = 10,
  allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) {
  let result = '';
  for (let index = 0; index < length; index++) {
    result += allowed.charAt(Math.floor(Math.random() * allowed.length));
  }
  return result;
}

/** @typedef {"string"|"number"|"boolean"|"array"|"function"|"null"|"undefined"|"object"} TypesUnion */
/**
 * @param {unknown} v
 */
export function getRawType(v) {
  const type = /** @type {TypesUnion} */ (
    Object.prototype.toString.call(v).slice(8, -1).toLowerCase()
  );
  return type;
}

/**
 * @param {unknown} v
 * @param {TypesUnion} type
 */
export function isType(v, type) {
  return getRawType(v) === type;
}

/**
 * @param {Array<string|number>} list
 */
export function listFormatter(list) {
  const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });
  return formatter.format(list);
}

class LazyPromise extends Promise {
  /** @param {ConstructorParameters<PromiseConstructor>[0]} fn */
  constructor(fn) {
    super(fn);
    if (typeof fn !== 'function') {
      throw new TypeError(`Promise resolver is not a function`);
    }
    this._fn = fn;
  }
  then() {
    this.promise = this.promise || new Promise(this._fn);
    return this.promise.then.apply(this.promise, arguments);
  }
}

class FetchError extends Error {
  /**
   * @param {ConstructorParameters<ErrorConstructor>[0]} message
   * @param {ConstructorParameters<ErrorConstructor>[1]} [options]
   */
  constructor(message, options) {
    super(message, options);
    this.name = 'FetchError';
  }
}

/**
 * @param {Parameters<typeof fetch>[0]} url
 * @param {Parameters<typeof fetch>[1] & {
 * modifyRequest?: (init: Parameters<typeof enhancedFetch>[1]) => Parameters<typeof enhancedFetch>[1]
 * modifyResponse?: (response: Awaited<ReturnType<enhancedFetch>>) => any
 * }} [init={}]
 */
export function enhancedFetch(url, init = {}) {
  url = new URL(url);
  const controller = new AbortController();
  if (!init.signal) {
    init.signal = controller.signal;
  }
  init.headers = init.headers || {};

  /** @type {Promise<Response & { data?: unknown }> & { abort: typeof controller.abort }} */
  const promise = new LazyPromise(async (resolve, reject) => {
    try {
      if (init.modifyRequest) {
        init = init.modifyRequest(init);
      }

      /** @type {Response & { data?: unknown }} */
      let response = await fetch(url, init);
      if (!response.ok) {
        throw new FetchError(`${response.status} ${response.statusText}`, {
          cause: response,
        });
      }

      /** @type {'text'|'json'} */
      let bodyType = 'text';
      if (response.headers.get('content-type')?.includes('application/json')) {
        bodyType = 'json';
      }

      const data = await response[bodyType]();
      response.data = data;

      if (init.modifyResponse) {
        response = init.modifyResponse(response);
      }

      resolve(response);
    } catch (error) {
      if (error.name !== 'AbortError') {
        reject(error);
      }
    }
  });

  promise.abort = () => controller.abort();
  return promise;
}

/**
 * @param {HTMLFormElement} form
 * @param {{
 * onData: (value: string) => unknown
 * }} [options={}]
 */
export async function jsSubmitForm(form, options = {}) {
  if (form.__pendingRequest) {
    form.__pendingRequest?.abort && form.__pendingRequest.abort();
  }

  const url = new URL(form.action);
  const formData = new FormData(form);
  const searchParameters = new URLSearchParams(formData);
  /** @type {Parameters<fetch>[1]} */
  const fetchOptions = {
    method: form.method,
  };

  if (fetchOptions.method.toUpperCase() === 'POST') {
    fetchOptions.body =
      form.enctype === 'multipart/form-data' ? formData : searchParameters;
  } else {
    url.search = searchParameters;
  }
  const request = new Request(url, fetchOptions);
  form._pendingRequest = request;

  return fetch(request).then(async (response) => {
    delete form._pendingRequest;

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = response.body;
    if (!data || !options.onData) {
      return response;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let doneReading = false;

    while (!doneReading) {
      const { value, done } = await reader.read();
      doneReading = done;

      const chunkValue = decoder.decode(value);
      options.onData(chunkValue);
    }

    return response;
  });
}
