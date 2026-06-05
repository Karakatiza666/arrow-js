import { TypedArray, TypedArrayConstructor, BigIntArrayConstructor } from '../interfaces.js';
import { ByteBuffer } from 'flatbuffers';
import type { ReadableStreamReadResult } from 'node:stream/web';
/** @ignore */
export declare function memcpy<TTarget extends ArrayBufferView, TSource extends ArrayBufferView>(target: TTarget, source: TSource, targetByteOffset?: number, sourceByteLength?: number): TTarget;
/** @ignore */
export declare function joinUint8Arrays(chunks: Uint8Array[], size?: number | null): [Uint8Array, Uint8Array[], number];
/** @ignore */
export type ArrayBufferViewInput = ArrayBufferView | ArrayBufferLike | ArrayBufferView | Iterable<number> | Iterable<bigint> | ArrayLike<number> | ArrayLike<bigint> | ByteBuffer | string | null | undefined | IteratorResult<ArrayBufferView | ArrayBufferLike | ArrayBufferView | Iterable<number> | Iterable<bigint> | ArrayLike<number> | ArrayLike<bigint> | ByteBuffer | string | null | undefined> | ReadableStreamReadResult<ArrayBufferView | ArrayBufferLike | ArrayBufferView | Iterable<number> | Iterable<bigint> | ArrayLike<number> | ArrayLike<bigint> | ByteBuffer | string | null | undefined>;
/** @ignore */
export declare function toArrayBufferView<T extends TypedArrayConstructor<any> | BigIntArrayConstructor<any>>(ArrayBufferViewCtor: any, input: ArrayBufferViewInput): InstanceType<T>;
/** @ignore */ export declare const toInt8Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toInt16Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toInt32Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toBigInt64Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toUint8Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toUint16Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toUint32Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toBigUint64Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toFloat32Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toFloat64Array: (input: ArrayBufferViewInput) => any;
/** @ignore */ export declare const toUint8ClampedArray: (input: ArrayBufferViewInput) => any;
/** @ignore */
type ArrayBufferViewIteratorInput = Iterable<ArrayBufferViewInput> | ArrayBufferViewInput;
/** @ignore */
export declare function toArrayBufferViewIterator<T extends TypedArray>(ArrayCtor: TypedArrayConstructor<T>, source: ArrayBufferViewIteratorInput): Generator<T, T, number>;
/** @ignore */ export declare const toInt8ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Int8Array<ArrayBufferLike>, Int8Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toInt16ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Int16Array<ArrayBufferLike>, Int16Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toInt32ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Int32Array<ArrayBufferLike>, Int32Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint8ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Uint8Array<ArrayBufferLike>, Uint8Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint16ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Uint16Array<ArrayBufferLike>, Uint16Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint32ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Uint32Array<ArrayBufferLike>, Uint32Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toFloat32ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Float32Array<ArrayBufferLike>, Float32Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toFloat64ArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Float64Array<ArrayBufferLike>, Float64Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint8ClampedArrayIterator: (input: ArrayBufferViewIteratorInput) => Generator<Uint8ClampedArray<ArrayBufferLike>, Uint8ClampedArray<ArrayBufferLike>, number>;
/** @ignore */
type ArrayBufferViewAsyncIteratorInput = AsyncIterable<ArrayBufferViewInput> | Iterable<ArrayBufferViewInput> | PromiseLike<ArrayBufferViewInput> | ArrayBufferViewInput;
/** @ignore */
export declare function toArrayBufferViewAsyncIterator<T extends TypedArray>(ArrayCtor: TypedArrayConstructor<T>, source: ArrayBufferViewAsyncIteratorInput): AsyncGenerator<T, T, number | undefined>;
/** @ignore */ export declare const toInt8ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Int8Array<ArrayBufferLike>, Int8Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toInt16ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Int16Array<ArrayBufferLike>, Int16Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toInt32ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Int32Array<ArrayBufferLike>, Int32Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint8ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Uint8Array<ArrayBufferLike>, Uint8Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint16ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Uint16Array<ArrayBufferLike>, Uint16Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint32ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Uint32Array<ArrayBufferLike>, Uint32Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toFloat32ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Float32Array<ArrayBufferLike>, Float32Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toFloat64ArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Float64Array<ArrayBufferLike>, Float64Array<ArrayBufferLike>, number>;
/** @ignore */ export declare const toUint8ClampedArrayAsyncIterator: (input: ArrayBufferViewAsyncIteratorInput) => AsyncGenerator<Uint8ClampedArray<ArrayBufferLike>, Uint8ClampedArray<ArrayBufferLike>, number>;
/** @ignore */
export declare function rebaseValueOffsets(offset: number, length: number, valueOffsets: Int32Array): Int32Array;
export declare function rebaseValueOffsets(offset: number, length: number, valueOffsets: BigInt64Array): BigInt64Array;
/** @ignore */
export declare function compareArrayLike<T extends ArrayLike<any>>(a: T, b: T): boolean;
export {};
//# sourceMappingURL=buffer.d.ts.map