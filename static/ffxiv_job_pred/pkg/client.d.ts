/* tslint:disable */
/* eslint-disable */
/**
* @param {string} name
* @returns {string}
*/
export function greet(name: string): string;
/**
* @param {Float64Array} data
* @returns {Float64Array}
*/
export function test(data: Float64Array): Float64Array;
/**
* @param {Float64Array} prior
* @param {Float64Array} raw_likelihood
* @param {Uint8Array} answers
* @param {Uint8Array} indexes
* @returns {Float64Array}
*/
export function calc_posterior(prior: Float64Array, raw_likelihood: Float64Array, answers: Uint8Array, indexes: Uint8Array): Float64Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly greet: (a: number, b: number, c: number) => void;
  readonly test: (a: number, b: number, c: number) => void;
  readonly calc_posterior: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
