import { ArrayBufferViewInput } from '../util/buffer.js';
import { ReadableDOMStreamOptions } from './interfaces.js';
import type { ReadableOptions, Readable } from 'node:stream';
type Uint8ArrayGenerator = Generator<Uint8Array, null, {
    cmd: 'peek' | 'read';
    size: number;
}>;
type AsyncUint8ArrayGenerator = AsyncGenerator<Uint8Array, null, {
    cmd: 'peek' | 'read';
    size: number;
}>;
/** @ignore */
declare const _default: {
    fromIterable<T extends ArrayBufferViewInput>(source: Iterable<T> | T): Uint8ArrayGenerator;
    fromAsyncIterable<T extends ArrayBufferViewInput>(source: AsyncIterable<T> | PromiseLike<T>): AsyncUint8ArrayGenerator;
    fromDOMStream<T extends ArrayBufferViewInput>(source: ReadableStream<T>): AsyncUint8ArrayGenerator;
    fromNodeStream(stream: NodeJS.ReadableStream): AsyncUint8ArrayGenerator;
    toDOMStream<T>(source: Iterable<T> | AsyncIterable<T>, options?: ReadableDOMStreamOptions): ReadableStream<T>;
    toNodeStream<T>(source: Iterable<T> | AsyncIterable<T>, options?: ReadableOptions): Readable;
};
export default _default;
//# sourceMappingURL=adapters.d.ts.map