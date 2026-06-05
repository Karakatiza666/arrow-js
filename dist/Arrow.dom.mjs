var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/util/buffer.ts
var buffer_exports = {};
__export(buffer_exports, {
  compareArrayLike: () => compareArrayLike,
  joinUint8Arrays: () => joinUint8Arrays,
  memcpy: () => memcpy,
  rebaseValueOffsets: () => rebaseValueOffsets,
  toArrayBufferView: () => toArrayBufferView,
  toArrayBufferViewAsyncIterator: () => toArrayBufferViewAsyncIterator,
  toArrayBufferViewIterator: () => toArrayBufferViewIterator,
  toBigInt64Array: () => toBigInt64Array,
  toBigUint64Array: () => toBigUint64Array,
  toFloat32Array: () => toFloat32Array,
  toFloat32ArrayAsyncIterator: () => toFloat32ArrayAsyncIterator,
  toFloat32ArrayIterator: () => toFloat32ArrayIterator,
  toFloat64Array: () => toFloat64Array,
  toFloat64ArrayAsyncIterator: () => toFloat64ArrayAsyncIterator,
  toFloat64ArrayIterator: () => toFloat64ArrayIterator,
  toInt16Array: () => toInt16Array,
  toInt16ArrayAsyncIterator: () => toInt16ArrayAsyncIterator,
  toInt16ArrayIterator: () => toInt16ArrayIterator,
  toInt32Array: () => toInt32Array,
  toInt32ArrayAsyncIterator: () => toInt32ArrayAsyncIterator,
  toInt32ArrayIterator: () => toInt32ArrayIterator,
  toInt8Array: () => toInt8Array,
  toInt8ArrayAsyncIterator: () => toInt8ArrayAsyncIterator,
  toInt8ArrayIterator: () => toInt8ArrayIterator,
  toUint16Array: () => toUint16Array,
  toUint16ArrayAsyncIterator: () => toUint16ArrayAsyncIterator,
  toUint16ArrayIterator: () => toUint16ArrayIterator,
  toUint32Array: () => toUint32Array,
  toUint32ArrayAsyncIterator: () => toUint32ArrayAsyncIterator,
  toUint32ArrayIterator: () => toUint32ArrayIterator,
  toUint8Array: () => toUint8Array,
  toUint8ArrayAsyncIterator: () => toUint8ArrayAsyncIterator,
  toUint8ArrayIterator: () => toUint8ArrayIterator,
  toUint8ClampedArray: () => toUint8ClampedArray,
  toUint8ClampedArrayAsyncIterator: () => toUint8ClampedArrayAsyncIterator,
  toUint8ClampedArrayIterator: () => toUint8ClampedArrayIterator
});

// src/util/utf8.ts
var decoder = new TextDecoder("utf-8");
var decodeUtf8 = decoder.decode.bind(decoder);
var encoder = new TextEncoder();
var encodeUtf8 = (value) => encoder.encode(value);

// src/util/compat.ts
var isNumber = (x) => typeof x === "number";
var isBoolean = (x) => typeof x === "boolean";
var isFunction = (x) => typeof x === "function";
var isObject = (x) => x != null && Object(x) === x;
var isPromise = (x) => {
  return isObject(x) && isFunction(x.then);
};
var isIterable = (x) => {
  return isObject(x) && isFunction(x[Symbol.iterator]);
};
var isAsyncIterable = (x) => {
  return isObject(x) && isFunction(x[Symbol.asyncIterator]);
};
var isArrowJSON = (x) => {
  return isObject(x) && isObject(x["schema"]);
};
var isIteratorResult = (x) => {
  return isObject(x) && "done" in x && "value" in x;
};
var isFileHandle = (x) => {
  return isObject(x) && isFunction(x["stat"]) && isNumber(x["fd"]);
};
var isFetchResponse = (x) => {
  return isObject(x) && isReadableDOMStream(x["body"]);
};
var isReadableInterop = (x) => "_getDOMStream" in x && "_getNodeStream" in x;
var isWritableDOMStream = (x) => {
  return isObject(x) && isFunction(x["abort"]) && isFunction(x["getWriter"]) && !isReadableInterop(x);
};
var isReadableDOMStream = (x) => {
  return isObject(x) && isFunction(x["cancel"]) && isFunction(x["getReader"]) && !isReadableInterop(x);
};
var isWritableNodeStream = (x) => {
  return isObject(x) && isFunction(x["end"]) && isFunction(x["write"]) && isBoolean(x["writable"]) && !isReadableInterop(x);
};
var isReadableNodeStream = (x) => {
  return isObject(x) && isFunction(x["read"]) && isFunction(x["pipe"]) && isBoolean(x["readable"]) && !isReadableInterop(x);
};
var isFlatbuffersByteBuffer = (x) => {
  return isObject(x) && isFunction(x["clear"]) && isFunction(x["bytes"]) && isFunction(x["position"]) && isFunction(x["setPosition"]) && isFunction(x["capacity"]) && isFunction(x["getBufferIdentifier"]) && isFunction(x["createLong"]);
};

// src/util/buffer.ts
var SharedArrayBuf = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : ArrayBuffer;
function collapseContiguousByteRanges(chunks) {
  const result = chunks[0] ? [chunks[0]] : [];
  let xOffset, yOffset, xLen, yLen;
  for (let x, y, i = 0, j = 0, n = chunks.length; ++i < n; ) {
    x = result[j];
    y = chunks[i];
    if (!x || !y || x.buffer !== y.buffer || y.byteOffset < x.byteOffset) {
      y && (result[++j] = y);
      continue;
    }
    ({ byteOffset: xOffset, byteLength: xLen } = x);
    ({ byteOffset: yOffset, byteLength: yLen } = y);
    if (xOffset + xLen < yOffset || yOffset + yLen < xOffset) {
      y && (result[++j] = y);
      continue;
    }
    result[j] = new Uint8Array(x.buffer, xOffset, yOffset - xOffset + yLen);
  }
  return result;
}
function memcpy(target, source, targetByteOffset = 0, sourceByteLength = source.byteLength) {
  const targetByteLength = target.byteLength;
  const dst = new Uint8Array(target.buffer, target.byteOffset, targetByteLength);
  const src = new Uint8Array(source.buffer, source.byteOffset, Math.min(sourceByteLength, targetByteLength));
  dst.set(src, targetByteOffset);
  return target;
}
function joinUint8Arrays(chunks, size) {
  const result = collapseContiguousByteRanges(chunks);
  const byteLength = result.reduce((x, b) => x + b.byteLength, 0);
  let source, sliced, buffer;
  let offset = 0, index = -1;
  const length = Math.min(size || Number.POSITIVE_INFINITY, byteLength);
  for (const n = result.length; ++index < n; ) {
    source = result[index];
    sliced = source.subarray(0, Math.min(source.length, length - offset));
    if (length <= offset + sliced.length) {
      if (sliced.length < source.length) {
        result[index] = source.subarray(sliced.length);
      } else if (sliced.length === source.length) {
        index++;
      }
      buffer ? memcpy(buffer, sliced, offset) : buffer = sliced;
      break;
    }
    memcpy(buffer || (buffer = new Uint8Array(length)), sliced, offset);
    offset += sliced.length;
  }
  return [buffer || new Uint8Array(0), result.slice(index), byteLength - (buffer ? buffer.byteLength : 0)];
}
function toArrayBufferView(ArrayBufferViewCtor, input) {
  let value = isIteratorResult(input) ? input.value : input;
  if (value instanceof ArrayBufferViewCtor) {
    if (ArrayBufferViewCtor === Uint8Array) {
      return new ArrayBufferViewCtor(value.buffer, value.byteOffset, value.byteLength);
    }
    return value;
  }
  if (!value) {
    return new ArrayBufferViewCtor(0);
  }
  if (typeof value === "string") {
    value = encodeUtf8(value);
  }
  if (value instanceof ArrayBuffer) {
    return new ArrayBufferViewCtor(value);
  }
  if (value instanceof SharedArrayBuf) {
    return new ArrayBufferViewCtor(value);
  }
  if (isFlatbuffersByteBuffer(value)) {
    return toArrayBufferView(ArrayBufferViewCtor, value.bytes());
  }
  return !ArrayBuffer.isView(value) ? ArrayBufferViewCtor.from(value) : value.byteLength <= 0 ? new ArrayBufferViewCtor(0) : new ArrayBufferViewCtor(value.buffer, value.byteOffset, value.byteLength / ArrayBufferViewCtor.BYTES_PER_ELEMENT);
}
var toInt8Array = (input) => toArrayBufferView(Int8Array, input);
var toInt16Array = (input) => toArrayBufferView(Int16Array, input);
var toInt32Array = (input) => toArrayBufferView(Int32Array, input);
var toBigInt64Array = (input) => toArrayBufferView(BigInt64Array, input);
var toUint8Array = (input) => toArrayBufferView(Uint8Array, input);
var toUint16Array = (input) => toArrayBufferView(Uint16Array, input);
var toUint32Array = (input) => toArrayBufferView(Uint32Array, input);
var toBigUint64Array = (input) => toArrayBufferView(BigUint64Array, input);
var toFloat32Array = (input) => toArrayBufferView(Float32Array, input);
var toFloat64Array = (input) => toArrayBufferView(Float64Array, input);
var toUint8ClampedArray = (input) => toArrayBufferView(Uint8ClampedArray, input);
var pump = (iterator) => {
  iterator.next();
  return iterator;
};
function* toArrayBufferViewIterator(ArrayCtor, source) {
  const wrap = function* (x) {
    yield x;
  };
  const buffers = typeof source === "string" ? wrap(source) : ArrayBuffer.isView(source) ? wrap(source) : source instanceof ArrayBuffer ? wrap(source) : source instanceof SharedArrayBuf ? wrap(source) : !isIterable(source) ? wrap(source) : source;
  yield* pump((function* (it) {
    let r = null;
    do {
      r = it.next(yield toArrayBufferView(ArrayCtor, r));
    } while (!r.done);
  })(buffers[Symbol.iterator]()));
  return new ArrayCtor();
}
var toInt8ArrayIterator = (input) => toArrayBufferViewIterator(Int8Array, input);
var toInt16ArrayIterator = (input) => toArrayBufferViewIterator(Int16Array, input);
var toInt32ArrayIterator = (input) => toArrayBufferViewIterator(Int32Array, input);
var toUint8ArrayIterator = (input) => toArrayBufferViewIterator(Uint8Array, input);
var toUint16ArrayIterator = (input) => toArrayBufferViewIterator(Uint16Array, input);
var toUint32ArrayIterator = (input) => toArrayBufferViewIterator(Uint32Array, input);
var toFloat32ArrayIterator = (input) => toArrayBufferViewIterator(Float32Array, input);
var toFloat64ArrayIterator = (input) => toArrayBufferViewIterator(Float64Array, input);
var toUint8ClampedArrayIterator = (input) => toArrayBufferViewIterator(Uint8ClampedArray, input);
async function* toArrayBufferViewAsyncIterator(ArrayCtor, source) {
  if (isPromise(source)) {
    return yield* toArrayBufferViewAsyncIterator(ArrayCtor, await source);
  }
  const wrap = async function* (x) {
    yield await x;
  };
  const emit = async function* (source2) {
    yield* pump((function* (it) {
      let r = null;
      do {
        r = it.next(yield r?.value);
      } while (!r.done);
    })(source2[Symbol.iterator]()));
  };
  const buffers = typeof source === "string" ? wrap(source) : ArrayBuffer.isView(source) ? wrap(source) : source instanceof ArrayBuffer ? wrap(source) : source instanceof SharedArrayBuf ? wrap(source) : isIterable(source) ? emit(source) : !isAsyncIterable(source) ? wrap(source) : source;
  yield* pump((async function* (it) {
    let r = null;
    do {
      r = await it.next(yield toArrayBufferView(ArrayCtor, r));
    } while (!r.done);
  })(buffers[Symbol.asyncIterator]()));
  return new ArrayCtor();
}
var toInt8ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Int8Array, input);
var toInt16ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Int16Array, input);
var toInt32ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Int32Array, input);
var toUint8ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint8Array, input);
var toUint16ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint16Array, input);
var toUint32ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint32Array, input);
var toFloat32ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Float32Array, input);
var toFloat64ArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Float64Array, input);
var toUint8ClampedArrayAsyncIterator = (input) => toArrayBufferViewAsyncIterator(Uint8ClampedArray, input);
function rebaseValueOffsets(offset, length, valueOffsets) {
  if (offset !== 0) {
    valueOffsets = valueOffsets.slice(0, length);
    const delta = typeof valueOffsets[0] === "bigint" ? BigInt(offset) : offset;
    for (let i = -1, n = valueOffsets.length; ++i < n; ) {
      valueOffsets[i] += delta;
    }
  }
  return valueOffsets.subarray(0, length);
}
function compareArrayLike(a, b) {
  let i = 0;
  const n = a.length;
  if (n !== b.length) {
    return false;
  }
  if (n > 0) {
    do {
      if (a[i] !== b[i]) {
        return false;
      }
    } while (++i < n);
  }
  return true;
}

// src/io/adapters.ts
var adapters_default = {
  fromIterable(source) {
    return pump2(fromIterable(source));
  },
  fromAsyncIterable(source) {
    return pump2(fromAsyncIterable(source));
  },
  fromDOMStream(source) {
    return pump2(fromDOMStream(source));
  },
  fromNodeStream(stream) {
    return pump2(fromNodeStream(stream));
  },
  // @ts-ignore
  toDOMStream(source, options) {
    throw new Error(`"toDOMStream" not available in this environment`);
  },
  // @ts-ignore
  toNodeStream(source, options) {
    throw new Error(`"toNodeStream" not available in this environment`);
  }
};
var pump2 = (iterator) => {
  iterator.next();
  return iterator;
};
function* fromIterable(source) {
  let done, threw = false;
  let buffers = [], buffer;
  let cmd, size, bufferLength = 0;
  function byteRange() {
    if (cmd === "peek") {
      return joinUint8Arrays(buffers, size)[0];
    }
    [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
    return buffer;
  }
  ({ cmd, size } = (yield /* @__PURE__ */ (() => null)()) || { cmd: "read", size: 0 });
  const it = toUint8ArrayIterator(source)[Symbol.iterator]();
  try {
    do {
      ({ done, value: buffer } = Number.isNaN(size - bufferLength) ? it.next() : it.next(size - bufferLength));
      if (!done && buffer.byteLength > 0) {
        buffers.push(buffer);
        bufferLength += buffer.byteLength;
      }
      if (done || size <= bufferLength) {
        do {
          ({ cmd, size } = yield byteRange());
        } while (size < bufferLength);
      }
    } while (!done);
  } catch (e) {
    threw = true;
    typeof it.throw === "function" && it.throw(e);
  } finally {
    threw === false && typeof it.return === "function" && it.return(null);
  }
  return null;
}
async function* fromAsyncIterable(source) {
  let done, threw = false;
  let buffers = [], buffer;
  let cmd, size, bufferLength = 0;
  function byteRange() {
    if (cmd === "peek") {
      return joinUint8Arrays(buffers, size)[0];
    }
    [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
    return buffer;
  }
  ({ cmd, size } = (yield /* @__PURE__ */ (() => null)()) || { cmd: "read", size: 0 });
  const it = toUint8ArrayAsyncIterator(source)[Symbol.asyncIterator]();
  try {
    do {
      ({ done, value: buffer } = Number.isNaN(size - bufferLength) ? await it.next() : await it.next(size - bufferLength));
      if (!done && buffer.byteLength > 0) {
        buffers.push(buffer);
        bufferLength += buffer.byteLength;
      }
      if (done || size <= bufferLength) {
        do {
          ({ cmd, size } = yield byteRange());
        } while (size < bufferLength);
      }
    } while (!done);
  } catch (e) {
    threw = true;
    typeof it.throw === "function" && await it.throw(e);
  } finally {
    threw === false && typeof it.return === "function" && await it.return(new Uint8Array(0));
  }
  return null;
}
async function* fromDOMStream(source) {
  let done = false, threw = false;
  let buffers = [], buffer;
  let cmd, size, bufferLength = 0;
  function byteRange() {
    if (cmd === "peek") {
      return joinUint8Arrays(buffers, size)[0];
    }
    [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
    return buffer;
  }
  ({ cmd, size } = (yield /* @__PURE__ */ (() => null)()) || { cmd: "read", size: 0 });
  const it = new AdaptiveByteReader(source);
  try {
    do {
      ({ done, value: buffer } = Number.isNaN(size - bufferLength) ? await it["read"]() : await it["read"](size - bufferLength));
      if (!done && buffer.byteLength > 0) {
        buffers.push(toUint8Array(buffer));
        bufferLength += buffer.byteLength;
      }
      if (done || size <= bufferLength) {
        do {
          ({ cmd, size } = yield byteRange());
        } while (size < bufferLength);
      }
    } while (!done);
  } catch (e) {
    threw = true;
    await it["cancel"](e);
  } finally {
    threw === false ? await it["cancel"]() : source["locked"] && it.releaseLock();
  }
  return null;
}
var AdaptiveByteReader = class {
  constructor(source) {
    this.source = source;
    this.reader = this.source["getReader"]();
    this.reader["closed"].catch(() => {
    });
  }
  reader = null;
  get closed() {
    return this.reader ? this.reader["closed"].catch(() => {
    }) : Promise.resolve();
  }
  releaseLock() {
    if (this.reader) {
      this.reader.releaseLock();
    }
    this.reader = null;
  }
  async cancel(reason) {
    const { reader, source } = this;
    reader && await reader["cancel"](reason).catch(() => {
    });
    source && (source["locked"] && this.releaseLock());
  }
  async read(size) {
    if (size === 0) {
      return { done: this.reader == null, value: new Uint8Array(0) };
    }
    const result = await this.reader.read();
    !result.done && (result.value = toUint8Array(result));
    return result;
  }
};
var onEvent = (stream, event) => {
  const handler = (_) => resolve([event, _]);
  let resolve;
  return [event, handler, new Promise(
    (r) => (resolve = r) && stream["once"](event, handler)
  )];
};
async function* fromNodeStream(stream) {
  const events = [];
  let event = "error";
  let done = false, err = null;
  let cmd, size, bufferLength = 0;
  let buffers = [], buffer;
  function byteRange() {
    if (cmd === "peek") {
      return joinUint8Arrays(buffers, size)[0];
    }
    [buffer, buffers, bufferLength] = joinUint8Arrays(buffers, size);
    return buffer;
  }
  ({ cmd, size } = (yield /* @__PURE__ */ (() => null)()) || { cmd: "read", size: 0 });
  if (stream["isTTY"]) {
    yield new Uint8Array(0);
    return null;
  }
  try {
    events[0] = onEvent(stream, "end");
    events[1] = onEvent(stream, "error");
    do {
      events[2] = onEvent(stream, "readable");
      [event, err] = await Promise.race(events.map((x) => x[2]));
      if (event === "error") {
        break;
      }
      if (!(done = event === "end")) {
        if (!Number.isFinite(size - bufferLength)) {
          buffer = toUint8Array(stream["read"]());
        } else {
          buffer = toUint8Array(stream["read"](size - bufferLength));
          if (buffer.byteLength < size - bufferLength) {
            buffer = toUint8Array(stream["read"]());
          }
        }
        if (buffer.byteLength > 0) {
          buffers.push(buffer);
          bufferLength += buffer.byteLength;
        }
      }
      if (done || size <= bufferLength) {
        do {
          ({ cmd, size } = yield byteRange());
        } while (size < bufferLength);
      }
    } while (!done);
  } finally {
    await cleanup(events, event === "error" ? err : null);
  }
  return null;
  function cleanup(events2, err2) {
    buffer = buffers = null;
    return new Promise((resolve, reject) => {
      for (const [evt, fn] of events2) {
        stream["off"](evt, fn);
      }
      try {
        const destroy = stream["destroy"];
        destroy && destroy.call(stream, err2);
        err2 = void 0;
      } catch (e) {
        err2 = e || err2;
      } finally {
        err2 != null ? reject(err2) : resolve();
      }
    });
  }
}

// src/fb/metadata-version.ts
var MetadataVersion = /* @__PURE__ */ ((MetadataVersion2) => {
  MetadataVersion2[MetadataVersion2["V1"] = 0] = "V1";
  MetadataVersion2[MetadataVersion2["V2"] = 1] = "V2";
  MetadataVersion2[MetadataVersion2["V3"] = 2] = "V3";
  MetadataVersion2[MetadataVersion2["V4"] = 3] = "V4";
  MetadataVersion2[MetadataVersion2["V5"] = 4] = "V5";
  return MetadataVersion2;
})(MetadataVersion || {});

// src/fb/union-mode.ts
var UnionMode = /* @__PURE__ */ ((UnionMode2) => {
  UnionMode2[UnionMode2["Sparse"] = 0] = "Sparse";
  UnionMode2[UnionMode2["Dense"] = 1] = "Dense";
  return UnionMode2;
})(UnionMode || {});

// src/fb/precision.ts
var Precision = /* @__PURE__ */ ((Precision2) => {
  Precision2[Precision2["HALF"] = 0] = "HALF";
  Precision2[Precision2["SINGLE"] = 1] = "SINGLE";
  Precision2[Precision2["DOUBLE"] = 2] = "DOUBLE";
  return Precision2;
})(Precision || {});

// src/fb/date-unit.ts
var DateUnit = /* @__PURE__ */ ((DateUnit2) => {
  DateUnit2[DateUnit2["DAY"] = 0] = "DAY";
  DateUnit2[DateUnit2["MILLISECOND"] = 1] = "MILLISECOND";
  return DateUnit2;
})(DateUnit || {});

// src/fb/time-unit.ts
var TimeUnit = /* @__PURE__ */ ((TimeUnit2) => {
  TimeUnit2[TimeUnit2["SECOND"] = 0] = "SECOND";
  TimeUnit2[TimeUnit2["MILLISECOND"] = 1] = "MILLISECOND";
  TimeUnit2[TimeUnit2["MICROSECOND"] = 2] = "MICROSECOND";
  TimeUnit2[TimeUnit2["NANOSECOND"] = 3] = "NANOSECOND";
  return TimeUnit2;
})(TimeUnit || {});

// src/fb/interval-unit.ts
var IntervalUnit = /* @__PURE__ */ ((IntervalUnit2) => {
  IntervalUnit2[IntervalUnit2["YEAR_MONTH"] = 0] = "YEAR_MONTH";
  IntervalUnit2[IntervalUnit2["DAY_TIME"] = 1] = "DAY_TIME";
  IntervalUnit2[IntervalUnit2["MONTH_DAY_NANO"] = 2] = "MONTH_DAY_NANO";
  return IntervalUnit2;
})(IntervalUnit || {});

// src/fb/dictionary-batch.ts
import * as flatbuffers3 from "flatbuffers";

// src/fb/record-batch.ts
import * as flatbuffers2 from "flatbuffers";

// src/fb/body-compression.ts
import * as flatbuffers from "flatbuffers";

// src/fb/compression-type.ts
var CompressionType = /* @__PURE__ */ ((CompressionType2) => {
  CompressionType2[CompressionType2["LZ4_FRAME"] = 0] = "LZ4_FRAME";
  CompressionType2[CompressionType2["ZSTD"] = 1] = "ZSTD";
  return CompressionType2;
})(CompressionType || {});

// src/fb/body-compression.ts
var BodyCompression = class _BodyCompression {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsBodyCompression(bb, obj) {
    return (obj || new _BodyCompression()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsBodyCompression(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new _BodyCompression()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * Compressor library.
   * For LZ4_FRAME, each compressed buffer must consist of a single frame.
   */
  codec() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt8(this.bb_pos + offset) : 0 /* LZ4_FRAME */;
  }
  /**
   * Indicates the way the record batch body was compressed
   */
  method() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readInt8(this.bb_pos + offset) : 0 /* BUFFER */;
  }
  static startBodyCompression(builder) {
    builder.startObject(2);
  }
  static addCodec(builder, codec) {
    builder.addFieldInt8(0, codec, 0 /* LZ4_FRAME */);
  }
  static addMethod(builder, method) {
    builder.addFieldInt8(1, method, 0 /* BUFFER */);
  }
  static endBodyCompression(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createBodyCompression(builder, codec, method) {
    _BodyCompression.startBodyCompression(builder);
    _BodyCompression.addCodec(builder, codec);
    _BodyCompression.addMethod(builder, method);
    return _BodyCompression.endBodyCompression(builder);
  }
};

// src/fb/buffer.ts
var Buffer2 = class {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  /**
   * The relative offset into the shared memory page where the bytes for this
   * buffer starts
   */
  offset() {
    return this.bb.readInt64(this.bb_pos);
  }
  /**
   * The absolute length (in bytes) of the memory buffer. The memory is found
   * from offset (inclusive) to offset + length (non-inclusive). When building
   * messages using the encapsulated IPC message, padding bytes may be written
   * after a buffer, but such padding bytes do not need to be accounted for in
   * the size here.
   */
  length() {
    return this.bb.readInt64(this.bb_pos + 8);
  }
  static sizeOf() {
    return 16;
  }
  static createBuffer(builder, offset, length) {
    builder.prep(8, 16);
    builder.writeInt64(BigInt(length ?? 0));
    builder.writeInt64(BigInt(offset ?? 0));
    return builder.offset();
  }
};

// src/fb/field-node.ts
var FieldNode = class {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  /**
   * The number of value slots in the Arrow array at this level of a nested
   * tree
   */
  length() {
    return this.bb.readInt64(this.bb_pos);
  }
  /**
   * The number of observed nulls. Fields with null_count == 0 may choose not
   * to write their physical validity bitmap out as a materialized buffer,
   * instead setting the length of the bitmap buffer to 0.
   */
  nullCount() {
    return this.bb.readInt64(this.bb_pos + 8);
  }
  static sizeOf() {
    return 16;
  }
  static createFieldNode(builder, length, null_count) {
    builder.prep(8, 16);
    builder.writeInt64(BigInt(null_count ?? 0));
    builder.writeInt64(BigInt(length ?? 0));
    return builder.offset();
  }
};

// src/fb/record-batch.ts
var RecordBatch = class _RecordBatch {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsRecordBatch(bb, obj) {
    return (obj || new _RecordBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsRecordBatch(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers2.SIZE_PREFIX_LENGTH);
    return (obj || new _RecordBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * number of records / rows. The arrays in the batch should all have this
   * length
   */
  length() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt("0");
  }
  /**
   * Nodes correspond to the pre-ordered flattened logical schema
   */
  nodes(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new FieldNode()).__init(this.bb.__vector(this.bb_pos + offset) + index * 16, this.bb) : null;
  }
  nodesLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  /**
   * Buffers correspond to the pre-ordered flattened buffer tree
   *
   * The number of buffers appended to this list depends on the schema. For
   * example, most primitive arrays will have 2 buffers, 1 for the validity
   * bitmap and 1 for the values. For struct arrays, there will only be a
   * single buffer for the validity (nulls) bitmap
   */
  buffers(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? (obj || new Buffer2()).__init(this.bb.__vector(this.bb_pos + offset) + index * 16, this.bb) : null;
  }
  buffersLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  /**
   * Optional compression of the message body
   */
  compression(obj) {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? (obj || new BodyCompression()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
  }
  /**
   * Some types such as Utf8View are represented using a variable number of buffers.
   * For each such Field in the pre-ordered flattened logical schema, there will be
   * an entry in variadicBufferCounts to indicate the number of number of variadic
   * buffers which belong to that Field in the current RecordBatch.
   *
   * For example, the schema
   *     col1: Struct<alpha: Int32, beta: BinaryView, gamma: Float64>
   *     col2: Utf8View
   * contains two Fields with variadic buffers so variadicBufferCounts will have
   * two entries, the first counting the variadic buffers of `col1.beta` and the
   * second counting `col2`'s.
   *
   * This field may be omitted if and only if the schema contains no Fields with
   * a variable number of buffers, such as BinaryView and Utf8View.
   */
  variadicBufferCounts(index) {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.readInt64(this.bb.__vector(this.bb_pos + offset) + index * 8) : BigInt(0);
  }
  variadicBufferCountsLength() {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startRecordBatch(builder) {
    builder.startObject(5);
  }
  static addLength(builder, length) {
    builder.addFieldInt64(0, length, BigInt("0"));
  }
  static addNodes(builder, nodesOffset) {
    builder.addFieldOffset(1, nodesOffset, 0);
  }
  static startNodesVector(builder, numElems) {
    builder.startVector(16, numElems, 8);
  }
  static addBuffers(builder, buffersOffset) {
    builder.addFieldOffset(2, buffersOffset, 0);
  }
  static startBuffersVector(builder, numElems) {
    builder.startVector(16, numElems, 8);
  }
  static addCompression(builder, compressionOffset) {
    builder.addFieldOffset(3, compressionOffset, 0);
  }
  static addVariadicBufferCounts(builder, variadicBufferCountsOffset) {
    builder.addFieldOffset(4, variadicBufferCountsOffset, 0);
  }
  static createVariadicBufferCountsVector(builder, data) {
    builder.startVector(8, data.length, 8);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt64(data[i]);
    }
    return builder.endVector();
  }
  static startVariadicBufferCountsVector(builder, numElems) {
    builder.startVector(8, numElems, 8);
  }
  static endRecordBatch(builder) {
    const offset = builder.endObject();
    return offset;
  }
};

// src/fb/dictionary-batch.ts
var DictionaryBatch = class _DictionaryBatch {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsDictionaryBatch(bb, obj) {
    return (obj || new _DictionaryBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsDictionaryBatch(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers3.SIZE_PREFIX_LENGTH);
    return (obj || new _DictionaryBatch()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  id() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt("0");
  }
  data(obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new RecordBatch()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
  }
  /**
   * If isDelta is true the values in the dictionary are to be appended to a
   * dictionary with the indicated id. If isDelta is false this dictionary
   * should replace the existing dictionary.
   */
  isDelta() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }
  static startDictionaryBatch(builder) {
    builder.startObject(3);
  }
  static addId(builder, id) {
    builder.addFieldInt64(0, id, BigInt("0"));
  }
  static addData(builder, dataOffset) {
    builder.addFieldOffset(1, dataOffset, 0);
  }
  static addIsDelta(builder, isDelta) {
    builder.addFieldInt8(2, +isDelta, 0);
  }
  static endDictionaryBatch(builder) {
    const offset = builder.endObject();
    return offset;
  }
};

// src/fb/schema.ts
import * as flatbuffers33 from "flatbuffers";

// src/fb/field.ts
import * as flatbuffers32 from "flatbuffers";

// src/fb/dictionary-encoding.ts
import * as flatbuffers5 from "flatbuffers";

// src/fb/int.ts
import * as flatbuffers4 from "flatbuffers";
var Int = class _Int {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsInt(bb, obj) {
    return (obj || new _Int()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsInt(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers4.SIZE_PREFIX_LENGTH);
    return (obj || new _Int()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  bitWidth() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }
  isSigned() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }
  static startInt(builder) {
    builder.startObject(2);
  }
  static addBitWidth(builder, bitWidth) {
    builder.addFieldInt32(0, bitWidth, 0);
  }
  static addIsSigned(builder, isSigned) {
    builder.addFieldInt8(1, +isSigned, 0);
  }
  static endInt(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createInt(builder, bitWidth, isSigned) {
    _Int.startInt(builder);
    _Int.addBitWidth(builder, bitWidth);
    _Int.addIsSigned(builder, isSigned);
    return _Int.endInt(builder);
  }
};

// src/fb/dictionary-encoding.ts
var DictionaryEncoding = class _DictionaryEncoding {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsDictionaryEncoding(bb, obj) {
    return (obj || new _DictionaryEncoding()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsDictionaryEncoding(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers5.SIZE_PREFIX_LENGTH);
    return (obj || new _DictionaryEncoding()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * The known dictionary id in the application where this data is used. In
   * the file or streaming formats, the dictionary ids are found in the
   * DictionaryBatch messages
   */
  id() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt("0");
  }
  /**
   * The dictionary indices are constrained to be non-negative integers. If
   * this field is null, the indices must be signed int32. To maximize
   * cross-language compatibility and performance, implementations are
   * recommended to prefer signed integer types over unsigned integer types
   * and to avoid uint64 indices unless they are required by an application.
   */
  indexType(obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new Int()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
  }
  /**
   * By default, dictionaries are not ordered, or the order does not have
   * semantic meaning. In some statistical, applications, dictionary-encoding
   * is used to represent ordered categorical data, and we provide a way to
   * preserve that metadata here
   */
  isOrdered() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }
  dictionaryKind() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* DenseArray */;
  }
  static startDictionaryEncoding(builder) {
    builder.startObject(4);
  }
  static addId(builder, id) {
    builder.addFieldInt64(0, id, BigInt("0"));
  }
  static addIndexType(builder, indexTypeOffset) {
    builder.addFieldOffset(1, indexTypeOffset, 0);
  }
  static addIsOrdered(builder, isOrdered) {
    builder.addFieldInt8(2, +isOrdered, 0);
  }
  static addDictionaryKind(builder, dictionaryKind) {
    builder.addFieldInt16(3, dictionaryKind, 0 /* DenseArray */);
  }
  static endDictionaryEncoding(builder) {
    const offset = builder.endObject();
    return offset;
  }
};

// src/fb/key-value.ts
import * as flatbuffers6 from "flatbuffers";
var KeyValue = class _KeyValue {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsKeyValue(bb, obj) {
    return (obj || new _KeyValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsKeyValue(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers6.SIZE_PREFIX_LENGTH);
    return (obj || new _KeyValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  key(optionalEncoding) {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }
  value(optionalEncoding) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }
  static startKeyValue(builder) {
    builder.startObject(2);
  }
  static addKey(builder, keyOffset) {
    builder.addFieldOffset(0, keyOffset, 0);
  }
  static addValue(builder, valueOffset) {
    builder.addFieldOffset(1, valueOffset, 0);
  }
  static endKeyValue(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createKeyValue(builder, keyOffset, valueOffset) {
    _KeyValue.startKeyValue(builder);
    _KeyValue.addKey(builder, keyOffset);
    _KeyValue.addValue(builder, valueOffset);
    return _KeyValue.endKeyValue(builder);
  }
};

// src/fb/binary.ts
import * as flatbuffers7 from "flatbuffers";
var Binary = class _Binary {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsBinary(bb, obj) {
    return (obj || new _Binary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsBinary(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers7.SIZE_PREFIX_LENGTH);
    return (obj || new _Binary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startBinary(builder) {
    builder.startObject(0);
  }
  static endBinary(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createBinary(builder) {
    _Binary.startBinary(builder);
    return _Binary.endBinary(builder);
  }
};

// src/fb/binary-view.ts
import * as flatbuffers8 from "flatbuffers";
var BinaryView = class _BinaryView {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsBinaryView(bb, obj) {
    return (obj || new _BinaryView()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsBinaryView(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers8.SIZE_PREFIX_LENGTH);
    return (obj || new _BinaryView()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startBinaryView(builder) {
    builder.startObject(0);
  }
  static endBinaryView(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createBinaryView(builder) {
    _BinaryView.startBinaryView(builder);
    return _BinaryView.endBinaryView(builder);
  }
};

// src/fb/bool.ts
import * as flatbuffers9 from "flatbuffers";
var Bool = class _Bool {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsBool(bb, obj) {
    return (obj || new _Bool()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsBool(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers9.SIZE_PREFIX_LENGTH);
    return (obj || new _Bool()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startBool(builder) {
    builder.startObject(0);
  }
  static endBool(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createBool(builder) {
    _Bool.startBool(builder);
    return _Bool.endBool(builder);
  }
};

// src/fb/date.ts
import * as flatbuffers10 from "flatbuffers";
var Date2 = class _Date {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsDate(bb, obj) {
    return (obj || new _Date()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsDate(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers10.SIZE_PREFIX_LENGTH);
    return (obj || new _Date()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  unit() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 1 /* MILLISECOND */;
  }
  static startDate(builder) {
    builder.startObject(1);
  }
  static addUnit(builder, unit) {
    builder.addFieldInt16(0, unit, 1 /* MILLISECOND */);
  }
  static endDate(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createDate(builder, unit) {
    _Date.startDate(builder);
    _Date.addUnit(builder, unit);
    return _Date.endDate(builder);
  }
};

// src/fb/decimal.ts
import * as flatbuffers11 from "flatbuffers";
var Decimal = class _Decimal {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsDecimal(bb, obj) {
    return (obj || new _Decimal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsDecimal(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers11.SIZE_PREFIX_LENGTH);
    return (obj || new _Decimal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * Total number of decimal digits
   */
  precision() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }
  /**
   * Number of digits after the decimal point "."
   */
  scale() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }
  /**
   * Number of bits per value. The only accepted widths are 128 and 256.
   * We use bitWidth for consistency with Int::bitWidth.
   */
  bitWidth() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 128;
  }
  static startDecimal(builder) {
    builder.startObject(3);
  }
  static addPrecision(builder, precision) {
    builder.addFieldInt32(0, precision, 0);
  }
  static addScale(builder, scale) {
    builder.addFieldInt32(1, scale, 0);
  }
  static addBitWidth(builder, bitWidth) {
    builder.addFieldInt32(2, bitWidth, 128);
  }
  static endDecimal(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createDecimal(builder, precision, scale, bitWidth) {
    _Decimal.startDecimal(builder);
    _Decimal.addPrecision(builder, precision);
    _Decimal.addScale(builder, scale);
    _Decimal.addBitWidth(builder, bitWidth);
    return _Decimal.endDecimal(builder);
  }
};

// src/fb/duration.ts
import * as flatbuffers12 from "flatbuffers";
var Duration = class _Duration {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsDuration(bb, obj) {
    return (obj || new _Duration()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsDuration(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers12.SIZE_PREFIX_LENGTH);
    return (obj || new _Duration()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  unit() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 1 /* MILLISECOND */;
  }
  static startDuration(builder) {
    builder.startObject(1);
  }
  static addUnit(builder, unit) {
    builder.addFieldInt16(0, unit, 1 /* MILLISECOND */);
  }
  static endDuration(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createDuration(builder, unit) {
    _Duration.startDuration(builder);
    _Duration.addUnit(builder, unit);
    return _Duration.endDuration(builder);
  }
};

// src/fb/fixed-size-binary.ts
import * as flatbuffers13 from "flatbuffers";
var FixedSizeBinary = class _FixedSizeBinary {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsFixedSizeBinary(bb, obj) {
    return (obj || new _FixedSizeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsFixedSizeBinary(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers13.SIZE_PREFIX_LENGTH);
    return (obj || new _FixedSizeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * Number of bytes per value
   */
  byteWidth() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }
  static startFixedSizeBinary(builder) {
    builder.startObject(1);
  }
  static addByteWidth(builder, byteWidth) {
    builder.addFieldInt32(0, byteWidth, 0);
  }
  static endFixedSizeBinary(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createFixedSizeBinary(builder, byteWidth) {
    _FixedSizeBinary.startFixedSizeBinary(builder);
    _FixedSizeBinary.addByteWidth(builder, byteWidth);
    return _FixedSizeBinary.endFixedSizeBinary(builder);
  }
};

// src/fb/fixed-size-list.ts
import * as flatbuffers14 from "flatbuffers";
var FixedSizeList = class _FixedSizeList {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsFixedSizeList(bb, obj) {
    return (obj || new _FixedSizeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsFixedSizeList(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers14.SIZE_PREFIX_LENGTH);
    return (obj || new _FixedSizeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * Number of list items per value
   */
  listSize() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
  }
  static startFixedSizeList(builder) {
    builder.startObject(1);
  }
  static addListSize(builder, listSize) {
    builder.addFieldInt32(0, listSize, 0);
  }
  static endFixedSizeList(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createFixedSizeList(builder, listSize) {
    _FixedSizeList.startFixedSizeList(builder);
    _FixedSizeList.addListSize(builder, listSize);
    return _FixedSizeList.endFixedSizeList(builder);
  }
};

// src/fb/floating-point.ts
import * as flatbuffers15 from "flatbuffers";
var FloatingPoint = class _FloatingPoint {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsFloatingPoint(bb, obj) {
    return (obj || new _FloatingPoint()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsFloatingPoint(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers15.SIZE_PREFIX_LENGTH);
    return (obj || new _FloatingPoint()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  precision() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* HALF */;
  }
  static startFloatingPoint(builder) {
    builder.startObject(1);
  }
  static addPrecision(builder, precision) {
    builder.addFieldInt16(0, precision, 0 /* HALF */);
  }
  static endFloatingPoint(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createFloatingPoint(builder, precision) {
    _FloatingPoint.startFloatingPoint(builder);
    _FloatingPoint.addPrecision(builder, precision);
    return _FloatingPoint.endFloatingPoint(builder);
  }
};

// src/fb/interval.ts
import * as flatbuffers16 from "flatbuffers";
var Interval = class _Interval {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsInterval(bb, obj) {
    return (obj || new _Interval()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsInterval(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers16.SIZE_PREFIX_LENGTH);
    return (obj || new _Interval()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  unit() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* YEAR_MONTH */;
  }
  static startInterval(builder) {
    builder.startObject(1);
  }
  static addUnit(builder, unit) {
    builder.addFieldInt16(0, unit, 0 /* YEAR_MONTH */);
  }
  static endInterval(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createInterval(builder, unit) {
    _Interval.startInterval(builder);
    _Interval.addUnit(builder, unit);
    return _Interval.endInterval(builder);
  }
};

// src/fb/large-binary.ts
import * as flatbuffers17 from "flatbuffers";
var LargeBinary = class _LargeBinary {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsLargeBinary(bb, obj) {
    return (obj || new _LargeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsLargeBinary(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers17.SIZE_PREFIX_LENGTH);
    return (obj || new _LargeBinary()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startLargeBinary(builder) {
    builder.startObject(0);
  }
  static endLargeBinary(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createLargeBinary(builder) {
    _LargeBinary.startLargeBinary(builder);
    return _LargeBinary.endLargeBinary(builder);
  }
};

// src/fb/large-list.ts
import * as flatbuffers18 from "flatbuffers";
var LargeList = class _LargeList {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsLargeList(bb, obj) {
    return (obj || new _LargeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsLargeList(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers18.SIZE_PREFIX_LENGTH);
    return (obj || new _LargeList()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startLargeList(builder) {
    builder.startObject(0);
  }
  static endLargeList(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createLargeList(builder) {
    _LargeList.startLargeList(builder);
    return _LargeList.endLargeList(builder);
  }
};

// src/fb/large-list-view.ts
import * as flatbuffers19 from "flatbuffers";

// src/fb/large-utf8.ts
import * as flatbuffers20 from "flatbuffers";
var LargeUtf8 = class _LargeUtf8 {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsLargeUtf8(bb, obj) {
    return (obj || new _LargeUtf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsLargeUtf8(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers20.SIZE_PREFIX_LENGTH);
    return (obj || new _LargeUtf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startLargeUtf8(builder) {
    builder.startObject(0);
  }
  static endLargeUtf8(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createLargeUtf8(builder) {
    _LargeUtf8.startLargeUtf8(builder);
    return _LargeUtf8.endLargeUtf8(builder);
  }
};

// src/fb/list.ts
import * as flatbuffers21 from "flatbuffers";
var List = class _List {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsList(bb, obj) {
    return (obj || new _List()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsList(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers21.SIZE_PREFIX_LENGTH);
    return (obj || new _List()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startList(builder) {
    builder.startObject(0);
  }
  static endList(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createList(builder) {
    _List.startList(builder);
    return _List.endList(builder);
  }
};

// src/fb/list-view.ts
import * as flatbuffers22 from "flatbuffers";

// src/fb/map.ts
import * as flatbuffers23 from "flatbuffers";
var Map2 = class _Map {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsMap(bb, obj) {
    return (obj || new _Map()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsMap(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers23.SIZE_PREFIX_LENGTH);
    return (obj || new _Map()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * Set to true if the keys within each value are sorted
   */
  keysSorted() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }
  static startMap(builder) {
    builder.startObject(1);
  }
  static addKeysSorted(builder, keysSorted) {
    builder.addFieldInt8(0, +keysSorted, 0);
  }
  static endMap(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createMap(builder, keysSorted) {
    _Map.startMap(builder);
    _Map.addKeysSorted(builder, keysSorted);
    return _Map.endMap(builder);
  }
};

// src/fb/null.ts
import * as flatbuffers24 from "flatbuffers";
var Null = class _Null {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsNull(bb, obj) {
    return (obj || new _Null()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsNull(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers24.SIZE_PREFIX_LENGTH);
    return (obj || new _Null()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startNull(builder) {
    builder.startObject(0);
  }
  static endNull(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createNull(builder) {
    _Null.startNull(builder);
    return _Null.endNull(builder);
  }
};

// src/fb/run-end-encoded.ts
import * as flatbuffers25 from "flatbuffers";

// src/fb/struct-.ts
import * as flatbuffers26 from "flatbuffers";
var Struct_ = class _Struct_ {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsStruct_(bb, obj) {
    return (obj || new _Struct_()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsStruct_(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers26.SIZE_PREFIX_LENGTH);
    return (obj || new _Struct_()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startStruct_(builder) {
    builder.startObject(0);
  }
  static endStruct_(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createStruct_(builder) {
    _Struct_.startStruct_(builder);
    return _Struct_.endStruct_(builder);
  }
};

// src/fb/time.ts
import * as flatbuffers27 from "flatbuffers";
var Time = class _Time {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsTime(bb, obj) {
    return (obj || new _Time()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsTime(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers27.SIZE_PREFIX_LENGTH);
    return (obj || new _Time()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  unit() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 1 /* MILLISECOND */;
  }
  bitWidth() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readInt32(this.bb_pos + offset) : 32;
  }
  static startTime(builder) {
    builder.startObject(2);
  }
  static addUnit(builder, unit) {
    builder.addFieldInt16(0, unit, 1 /* MILLISECOND */);
  }
  static addBitWidth(builder, bitWidth) {
    builder.addFieldInt32(1, bitWidth, 32);
  }
  static endTime(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createTime(builder, unit, bitWidth) {
    _Time.startTime(builder);
    _Time.addUnit(builder, unit);
    _Time.addBitWidth(builder, bitWidth);
    return _Time.endTime(builder);
  }
};

// src/fb/timestamp.ts
import * as flatbuffers28 from "flatbuffers";
var Timestamp = class _Timestamp {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsTimestamp(bb, obj) {
    return (obj || new _Timestamp()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsTimestamp(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers28.SIZE_PREFIX_LENGTH);
    return (obj || new _Timestamp()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  unit() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* SECOND */;
  }
  timezone(optionalEncoding) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }
  static startTimestamp(builder) {
    builder.startObject(2);
  }
  static addUnit(builder, unit) {
    builder.addFieldInt16(0, unit, 0 /* SECOND */);
  }
  static addTimezone(builder, timezoneOffset) {
    builder.addFieldOffset(1, timezoneOffset, 0);
  }
  static endTimestamp(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createTimestamp(builder, unit, timezoneOffset) {
    _Timestamp.startTimestamp(builder);
    _Timestamp.addUnit(builder, unit);
    _Timestamp.addTimezone(builder, timezoneOffset);
    return _Timestamp.endTimestamp(builder);
  }
};

// src/fb/union.ts
import * as flatbuffers29 from "flatbuffers";
var Union = class _Union {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsUnion(bb, obj) {
    return (obj || new _Union()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsUnion(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers29.SIZE_PREFIX_LENGTH);
    return (obj || new _Union()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  mode() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* Sparse */;
  }
  typeIds(index) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readInt32(this.bb.__vector(this.bb_pos + offset) + index * 4) : 0;
  }
  typeIdsLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  typeIdsArray() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? new Int32Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
  }
  static startUnion(builder) {
    builder.startObject(2);
  }
  static addMode(builder, mode) {
    builder.addFieldInt16(0, mode, 0 /* Sparse */);
  }
  static addTypeIds(builder, typeIdsOffset) {
    builder.addFieldOffset(1, typeIdsOffset, 0);
  }
  static createTypeIdsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]);
    }
    return builder.endVector();
  }
  static startTypeIdsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endUnion(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createUnion(builder, mode, typeIdsOffset) {
    _Union.startUnion(builder);
    _Union.addMode(builder, mode);
    _Union.addTypeIds(builder, typeIdsOffset);
    return _Union.endUnion(builder);
  }
};

// src/fb/utf8.ts
import * as flatbuffers30 from "flatbuffers";
var Utf8 = class _Utf8 {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsUtf8(bb, obj) {
    return (obj || new _Utf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsUtf8(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers30.SIZE_PREFIX_LENGTH);
    return (obj || new _Utf8()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startUtf8(builder) {
    builder.startObject(0);
  }
  static endUtf8(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createUtf8(builder) {
    _Utf8.startUtf8(builder);
    return _Utf8.endUtf8(builder);
  }
};

// src/fb/utf8-view.ts
import * as flatbuffers31 from "flatbuffers";
var Utf8View = class _Utf8View {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsUtf8View(bb, obj) {
    return (obj || new _Utf8View()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsUtf8View(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers31.SIZE_PREFIX_LENGTH);
    return (obj || new _Utf8View()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static startUtf8View(builder) {
    builder.startObject(0);
  }
  static endUtf8View(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createUtf8View(builder) {
    _Utf8View.startUtf8View(builder);
    return _Utf8View.endUtf8View(builder);
  }
};

// src/fb/type.ts
var Type = /* @__PURE__ */ ((Type7) => {
  Type7[Type7["NONE"] = 0] = "NONE";
  Type7[Type7["Null"] = 1] = "Null";
  Type7[Type7["Int"] = 2] = "Int";
  Type7[Type7["FloatingPoint"] = 3] = "FloatingPoint";
  Type7[Type7["Binary"] = 4] = "Binary";
  Type7[Type7["Utf8"] = 5] = "Utf8";
  Type7[Type7["Bool"] = 6] = "Bool";
  Type7[Type7["Decimal"] = 7] = "Decimal";
  Type7[Type7["Date"] = 8] = "Date";
  Type7[Type7["Time"] = 9] = "Time";
  Type7[Type7["Timestamp"] = 10] = "Timestamp";
  Type7[Type7["Interval"] = 11] = "Interval";
  Type7[Type7["List"] = 12] = "List";
  Type7[Type7["Struct_"] = 13] = "Struct_";
  Type7[Type7["Union"] = 14] = "Union";
  Type7[Type7["FixedSizeBinary"] = 15] = "FixedSizeBinary";
  Type7[Type7["FixedSizeList"] = 16] = "FixedSizeList";
  Type7[Type7["Map"] = 17] = "Map";
  Type7[Type7["Duration"] = 18] = "Duration";
  Type7[Type7["LargeBinary"] = 19] = "LargeBinary";
  Type7[Type7["LargeUtf8"] = 20] = "LargeUtf8";
  Type7[Type7["LargeList"] = 21] = "LargeList";
  Type7[Type7["RunEndEncoded"] = 22] = "RunEndEncoded";
  Type7[Type7["BinaryView"] = 23] = "BinaryView";
  Type7[Type7["Utf8View"] = 24] = "Utf8View";
  Type7[Type7["ListView"] = 25] = "ListView";
  Type7[Type7["LargeListView"] = 26] = "LargeListView";
  return Type7;
})(Type || {});

// src/fb/field.ts
var Field = class _Field {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsField(bb, obj) {
    return (obj || new _Field()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsField(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers32.SIZE_PREFIX_LENGTH);
    return (obj || new _Field()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  name(optionalEncoding) {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
  }
  /**
   * Whether or not this field can contain nulls. Should be true in general.
   */
  nullable() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
  }
  typeType() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* NONE */;
  }
  /**
   * This is the type of the decoded value if the field is dictionary encoded.
   */
  type(obj) {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }
  /**
   * Present only if the field is dictionary encoded.
   */
  dictionary(obj) {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? (obj || new DictionaryEncoding()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
  }
  /**
   * children apply only to nested data types like Struct, List and Union. For
   * primitive types children will have length 0.
   */
  children(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 14);
    return offset ? (obj || new _Field()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  childrenLength() {
    const offset = this.bb.__offset(this.bb_pos, 14);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  /**
   * User-defined metadata
   */
  customMetadata(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 16);
    return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  customMetadataLength() {
    const offset = this.bb.__offset(this.bb_pos, 16);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startField(builder) {
    builder.startObject(7);
  }
  static addName(builder, nameOffset) {
    builder.addFieldOffset(0, nameOffset, 0);
  }
  static addNullable(builder, nullable) {
    builder.addFieldInt8(1, +nullable, 0);
  }
  static addTypeType(builder, typeType) {
    builder.addFieldInt8(2, typeType, 0 /* NONE */);
  }
  static addType(builder, typeOffset) {
    builder.addFieldOffset(3, typeOffset, 0);
  }
  static addDictionary(builder, dictionaryOffset) {
    builder.addFieldOffset(4, dictionaryOffset, 0);
  }
  static addChildren(builder, childrenOffset) {
    builder.addFieldOffset(5, childrenOffset, 0);
  }
  static createChildrenVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startChildrenVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addCustomMetadata(builder, customMetadataOffset) {
    builder.addFieldOffset(6, customMetadataOffset, 0);
  }
  static createCustomMetadataVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startCustomMetadataVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endField(builder) {
    const offset = builder.endObject();
    return offset;
  }
};

// src/fb/schema.ts
var Schema = class _Schema {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsSchema(bb, obj) {
    return (obj || new _Schema()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsSchema(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers33.SIZE_PREFIX_LENGTH);
    return (obj || new _Schema()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  /**
   * endianness of the buffer
   * it is Little Endian by default
   * if endianness doesn't match the underlying system then the vectors need to be converted
   */
  endianness() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* Little */;
  }
  fields(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new Field()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  fieldsLength() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  customMetadata(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  customMetadataLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  /**
   * Features used in the stream/file.
   */
  features(index) {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readInt64(this.bb.__vector(this.bb_pos + offset) + index * 8) : BigInt(0);
  }
  featuresLength() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startSchema(builder) {
    builder.startObject(4);
  }
  static addEndianness(builder, endianness) {
    builder.addFieldInt16(0, endianness, 0 /* Little */);
  }
  static addFields(builder, fieldsOffset) {
    builder.addFieldOffset(1, fieldsOffset, 0);
  }
  static createFieldsVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startFieldsVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addCustomMetadata(builder, customMetadataOffset) {
    builder.addFieldOffset(2, customMetadataOffset, 0);
  }
  static createCustomMetadataVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startCustomMetadataVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static addFeatures(builder, featuresOffset) {
    builder.addFieldOffset(3, featuresOffset, 0);
  }
  static createFeaturesVector(builder, data) {
    builder.startVector(8, data.length, 8);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt64(data[i]);
    }
    return builder.endVector();
  }
  static startFeaturesVector(builder, numElems) {
    builder.startVector(8, numElems, 8);
  }
  static endSchema(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static createSchema(builder, endianness, fieldsOffset, customMetadataOffset, featuresOffset) {
    _Schema.startSchema(builder);
    _Schema.addEndianness(builder, endianness);
    _Schema.addFields(builder, fieldsOffset);
    _Schema.addCustomMetadata(builder, customMetadataOffset);
    _Schema.addFeatures(builder, featuresOffset);
    return _Schema.endSchema(builder);
  }
};

// src/fb/sparse-tensor.ts
import * as flatbuffers38 from "flatbuffers";

// src/fb/sparse-matrix-index-csx.ts
import * as flatbuffers34 from "flatbuffers";

// src/fb/sparse-tensor-index-coo.ts
import * as flatbuffers35 from "flatbuffers";

// src/fb/sparse-tensor-index-csf.ts
import * as flatbuffers36 from "flatbuffers";

// src/fb/tensor-dim.ts
import * as flatbuffers37 from "flatbuffers";

// src/fb/tensor.ts
import * as flatbuffers39 from "flatbuffers";

// src/fb/message-header.ts
var MessageHeader = /* @__PURE__ */ ((MessageHeader2) => {
  MessageHeader2[MessageHeader2["NONE"] = 0] = "NONE";
  MessageHeader2[MessageHeader2["Schema"] = 1] = "Schema";
  MessageHeader2[MessageHeader2["DictionaryBatch"] = 2] = "DictionaryBatch";
  MessageHeader2[MessageHeader2["RecordBatch"] = 3] = "RecordBatch";
  MessageHeader2[MessageHeader2["Tensor"] = 4] = "Tensor";
  MessageHeader2[MessageHeader2["SparseTensor"] = 5] = "SparseTensor";
  return MessageHeader2;
})(MessageHeader || {});

// src/enum.ts
var Type2 = /* @__PURE__ */ ((Type7) => {
  Type7[Type7["NONE"] = 0] = "NONE";
  Type7[Type7["Null"] = 1] = "Null";
  Type7[Type7["Int"] = 2] = "Int";
  Type7[Type7["Float"] = 3] = "Float";
  Type7[Type7["Binary"] = 4] = "Binary";
  Type7[Type7["Utf8"] = 5] = "Utf8";
  Type7[Type7["Bool"] = 6] = "Bool";
  Type7[Type7["Decimal"] = 7] = "Decimal";
  Type7[Type7["Date"] = 8] = "Date";
  Type7[Type7["Time"] = 9] = "Time";
  Type7[Type7["Timestamp"] = 10] = "Timestamp";
  Type7[Type7["Interval"] = 11] = "Interval";
  Type7[Type7["List"] = 12] = "List";
  Type7[Type7["Struct"] = 13] = "Struct";
  Type7[Type7["Union"] = 14] = "Union";
  Type7[Type7["FixedSizeBinary"] = 15] = "FixedSizeBinary";
  Type7[Type7["FixedSizeList"] = 16] = "FixedSizeList";
  Type7[Type7["Map"] = 17] = "Map";
  Type7[Type7["Duration"] = 18] = "Duration";
  Type7[Type7["LargeBinary"] = 19] = "LargeBinary";
  Type7[Type7["LargeUtf8"] = 20] = "LargeUtf8";
  Type7[Type7["LargeList"] = 21] = "LargeList";
  Type7[Type7["BinaryView"] = 23] = "BinaryView";
  Type7[Type7["Utf8View"] = 24] = "Utf8View";
  Type7[Type7["Dictionary"] = -1] = "Dictionary";
  Type7[Type7["Int8"] = -2] = "Int8";
  Type7[Type7["Int16"] = -3] = "Int16";
  Type7[Type7["Int32"] = -4] = "Int32";
  Type7[Type7["Int64"] = -5] = "Int64";
  Type7[Type7["Uint8"] = -6] = "Uint8";
  Type7[Type7["Uint16"] = -7] = "Uint16";
  Type7[Type7["Uint32"] = -8] = "Uint32";
  Type7[Type7["Uint64"] = -9] = "Uint64";
  Type7[Type7["Float16"] = -10] = "Float16";
  Type7[Type7["Float32"] = -11] = "Float32";
  Type7[Type7["Float64"] = -12] = "Float64";
  Type7[Type7["DateDay"] = -13] = "DateDay";
  Type7[Type7["DateMillisecond"] = -14] = "DateMillisecond";
  Type7[Type7["TimestampSecond"] = -15] = "TimestampSecond";
  Type7[Type7["TimestampMillisecond"] = -16] = "TimestampMillisecond";
  Type7[Type7["TimestampMicrosecond"] = -17] = "TimestampMicrosecond";
  Type7[Type7["TimestampNanosecond"] = -18] = "TimestampNanosecond";
  Type7[Type7["TimeSecond"] = -19] = "TimeSecond";
  Type7[Type7["TimeMillisecond"] = -20] = "TimeMillisecond";
  Type7[Type7["TimeMicrosecond"] = -21] = "TimeMicrosecond";
  Type7[Type7["TimeNanosecond"] = -22] = "TimeNanosecond";
  Type7[Type7["DenseUnion"] = -23] = "DenseUnion";
  Type7[Type7["SparseUnion"] = -24] = "SparseUnion";
  Type7[Type7["IntervalDayTime"] = -25] = "IntervalDayTime";
  Type7[Type7["IntervalYearMonth"] = -26] = "IntervalYearMonth";
  Type7[Type7["DurationSecond"] = -27] = "DurationSecond";
  Type7[Type7["DurationMillisecond"] = -28] = "DurationMillisecond";
  Type7[Type7["DurationMicrosecond"] = -29] = "DurationMicrosecond";
  Type7[Type7["DurationNanosecond"] = -30] = "DurationNanosecond";
  Type7[Type7["IntervalMonthDayNano"] = -31] = "IntervalMonthDayNano";
  return Type7;
})(Type2 || {});
var BufferType = /* @__PURE__ */ ((BufferType2) => {
  BufferType2[BufferType2["OFFSET"] = 0] = "OFFSET";
  BufferType2[BufferType2["DATA"] = 1] = "DATA";
  BufferType2[BufferType2["VALIDITY"] = 2] = "VALIDITY";
  BufferType2[BufferType2["TYPE"] = 3] = "TYPE";
  return BufferType2;
})(BufferType || {});

// src/util/vector.ts
var vector_exports = {};
__export(vector_exports, {
  clampRange: () => clampRange,
  createElementComparator: () => createElementComparator,
  wrapIndex: () => wrapIndex
});

// src/util/pretty.ts
var pretty_exports = {};
__export(pretty_exports, {
  valueToString: () => valueToString
});
var undf = void 0;
function valueToString(x) {
  if (x === null) {
    return "null";
  }
  if (x === undf) {
    return "undefined";
  }
  switch (typeof x) {
    case "number":
      return `${x}`;
    case "bigint":
      return `${x}`;
    case "string":
      return `"${x}"`;
  }
  if (typeof x[Symbol.toPrimitive] === "function") {
    return x[Symbol.toPrimitive]("string");
  }
  if (ArrayBuffer.isView(x)) {
    if (x instanceof BigInt64Array || x instanceof BigUint64Array) {
      return `[${[...x].map((x2) => valueToString(x2))}]`;
    }
    return `[${x}]`;
  }
  return ArrayBuffer.isView(x) ? `[${x}]` : JSON.stringify(x, (_, y) => typeof y === "bigint" ? `${y}` : y);
}

// src/util/bn.ts
var bn_exports = {};
__export(bn_exports, {
  BN: () => BN,
  bigNumToBigInt: () => bigNumToBigInt,
  bigNumToNumber: () => bigNumToNumber,
  bigNumToString: () => bigNumToString,
  isArrowBigNumSymbol: () => isArrowBigNumSymbol
});

// src/util/bigint.ts
function bigIntToNumber(number) {
  if (typeof number === "bigint" && (number < Number.MIN_SAFE_INTEGER || number > Number.MAX_SAFE_INTEGER)) {
    throw new TypeError(`${number} is not safe to convert to a number.`);
  }
  return Number(number);
}
function divideBigInts(number, divisor) {
  return bigIntToNumber(number / divisor) + bigIntToNumber(number % divisor) / bigIntToNumber(divisor);
}

// src/util/bn.ts
var isArrowBigNumSymbol = /* @__PURE__ */ Symbol.for("isArrowBigNum");
function BigNum(x, ...xs) {
  if (xs.length === 0) {
    return Object.setPrototypeOf(toArrayBufferView(this["TypedArray"], x), this.constructor.prototype);
  }
  return Object.setPrototypeOf(new this["TypedArray"](x, ...xs), this.constructor.prototype);
}
BigNum.prototype[isArrowBigNumSymbol] = true;
BigNum.prototype.toJSON = function() {
  return `"${bigNumToString(this)}"`;
};
BigNum.prototype.valueOf = function(scale) {
  return bigNumToNumber(this, scale);
};
BigNum.prototype.toString = function() {
  return bigNumToString(this);
};
BigNum.prototype[Symbol.toPrimitive] = function(hint = "default") {
  switch (hint) {
    case "number":
      return bigNumToNumber(this);
    case "string":
      return bigNumToString(this);
    case "default":
      return bigNumToBigInt(this);
  }
  return bigNumToString(this);
};
function SignedBigNum(...args) {
  return BigNum.apply(this, args);
}
function UnsignedBigNum(...args) {
  return BigNum.apply(this, args);
}
function DecimalBigNum(...args) {
  return BigNum.apply(this, args);
}
Object.setPrototypeOf(SignedBigNum.prototype, Object.create(Int32Array.prototype));
Object.setPrototypeOf(UnsignedBigNum.prototype, Object.create(Uint32Array.prototype));
Object.setPrototypeOf(DecimalBigNum.prototype, Object.create(Uint32Array.prototype));
Object.assign(SignedBigNum.prototype, BigNum.prototype, { "constructor": SignedBigNum, "signed": true, "TypedArray": Int32Array, "BigIntArray": BigInt64Array });
Object.assign(UnsignedBigNum.prototype, BigNum.prototype, { "constructor": UnsignedBigNum, "signed": false, "TypedArray": Uint32Array, "BigIntArray": BigUint64Array });
Object.assign(DecimalBigNum.prototype, BigNum.prototype, { "constructor": DecimalBigNum, "signed": true, "TypedArray": Uint32Array, "BigIntArray": BigUint64Array });
var TWO_TO_THE_64 = BigInt(4294967296) * BigInt(4294967296);
var TWO_TO_THE_64_MINUS_1 = TWO_TO_THE_64 - BigInt(1);
function bigNumToNumber(bn, scale) {
  const { buffer, byteOffset, byteLength, "signed": signed } = bn;
  const words = new BigUint64Array(buffer, byteOffset, byteLength / 8);
  const negative = signed && words.at(-1) & BigInt(1) << BigInt(63);
  let number = BigInt(0);
  let i = 0;
  if (negative) {
    for (const word of words) {
      number |= (word ^ TWO_TO_THE_64_MINUS_1) * (BigInt(1) << BigInt(64 * i++));
    }
    number *= BigInt(-1);
    number -= BigInt(1);
  } else {
    for (const word of words) {
      number |= word * (BigInt(1) << BigInt(64 * i++));
    }
  }
  if (typeof scale === "number" && scale > 0) {
    const denominator = BigInt("1".padEnd(scale + 1, "0"));
    const quotient = number / denominator;
    const remainder = negative ? -(number % denominator) : number % denominator;
    const integerPart = bigIntToNumber(quotient);
    const fractionPart = `${remainder}`.padStart(scale, "0");
    const sign = negative && integerPart === 0 ? "-" : "";
    return +`${sign}${integerPart}.${fractionPart}`;
  }
  return bigIntToNumber(number);
}
function bigNumToString(a) {
  if (a.byteLength === 8) {
    const bigIntArray = new a["BigIntArray"](a.buffer, a.byteOffset, 1);
    return `${bigIntArray[0]}`;
  }
  if (!a["signed"]) {
    return unsignedBigNumToString(a);
  }
  let array = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
  const highOrderWord = new Int16Array([array.at(-1)])[0];
  if (highOrderWord >= 0) {
    return unsignedBigNumToString(a);
  }
  array = array.slice();
  let carry = 1;
  for (let i = 0; i < array.length; i++) {
    const elem = array[i];
    const updated = ~elem + carry;
    array[i] = updated;
    carry &= elem === 0 ? 1 : 0;
  }
  const negated = unsignedBigNumToString(array);
  return `-${negated}`;
}
function bigNumToBigInt(a) {
  if (a.byteLength === 8) {
    const bigIntArray = new a["BigIntArray"](a.buffer, a.byteOffset, 1);
    return bigIntArray[0];
  } else {
    return bigNumToString(a);
  }
}
function unsignedBigNumToString(a) {
  let digits = "";
  const base64 = new Uint32Array(2);
  let base32 = new Uint16Array(a.buffer, a.byteOffset, a.byteLength / 2);
  const checks = new Uint32Array((base32 = new Uint16Array(base32).reverse()).buffer);
  let i = -1;
  const n = base32.length - 1;
  do {
    for (base64[0] = base32[i = 0]; i < n; ) {
      base32[i++] = base64[1] = base64[0] / 10;
      base64[0] = (base64[0] - base64[1] * 10 << 16) + base32[i];
    }
    base32[i] = base64[1] = base64[0] / 10;
    base64[0] = base64[0] - base64[1] * 10;
    digits = `${base64[0]}${digits}`;
  } while (checks[0] || checks[1] || checks[2] || checks[3]);
  return digits ?? `0`;
}
var BN = class _BN {
  /** @nocollapse */
  static new(num, isSigned) {
    switch (isSigned) {
      case true:
        return new SignedBigNum(num);
      case false:
        return new UnsignedBigNum(num);
    }
    switch (num.constructor) {
      case Int8Array:
      case Int16Array:
      case Int32Array:
      case BigInt64Array:
        return new SignedBigNum(num);
    }
    if (num.byteLength === 16) {
      return new DecimalBigNum(num);
    }
    return new UnsignedBigNum(num);
  }
  /** @nocollapse */
  static signed(num) {
    return new SignedBigNum(num);
  }
  /** @nocollapse */
  static unsigned(num) {
    return new UnsignedBigNum(num);
  }
  /** @nocollapse */
  static decimal(num) {
    return new DecimalBigNum(num);
  }
  constructor(num, isSigned) {
    return _BN.new(num, isSigned);
  }
};

// src/type.ts
var kDataTypeSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/DataType");
var DataType = class _DataType {
  /**
   * Check if an object is an instance of DataType.
   * This works across different instances of the Arrow library.
   * 
   * Note: We intentionally do NOT implement Symbol.hasInstance here because
   * it would break instanceof checks for subclasses like Struct, Dictionary, etc.
   * Use DataType.isDataType() for cross-library type checking instead.
   * @nocollapse
   */
  static isDataType(x) {
    return x?.[kDataTypeSymbol] === true;
  }
  /** @nocollapse */
  static isNull(x) {
    return x?.typeId === 1 /* Null */;
  }
  /** @nocollapse */
  static isInt(x) {
    return x?.typeId === 2 /* Int */;
  }
  /** @nocollapse */
  static isFloat(x) {
    return x?.typeId === 3 /* Float */;
  }
  /** @nocollapse */
  static isBinary(x) {
    return x?.typeId === 4 /* Binary */;
  }
  /** @nocollapse */
  static isBinaryView(x) {
    return x?.typeId === 23 /* BinaryView */;
  }
  /** @nocollapse */
  static isLargeBinary(x) {
    return x?.typeId === 19 /* LargeBinary */;
  }
  /** @nocollapse */
  static isUtf8(x) {
    return x?.typeId === 5 /* Utf8 */;
  }
  /** @nocollapse */
  static isUtf8View(x) {
    return x?.typeId === 24 /* Utf8View */;
  }
  /** @nocollapse */
  static isLargeUtf8(x) {
    return x?.typeId === 20 /* LargeUtf8 */;
  }
  /** @nocollapse */
  static isBool(x) {
    return x?.typeId === 6 /* Bool */;
  }
  /** @nocollapse */
  static isDecimal(x) {
    return x?.typeId === 7 /* Decimal */;
  }
  /** @nocollapse */
  static isDate(x) {
    return x?.typeId === 8 /* Date */;
  }
  /** @nocollapse */
  static isTime(x) {
    return x?.typeId === 9 /* Time */;
  }
  /** @nocollapse */
  static isTimestamp(x) {
    return x?.typeId === 10 /* Timestamp */;
  }
  /** @nocollapse */
  static isInterval(x) {
    return x?.typeId === 11 /* Interval */;
  }
  /** @nocollapse */
  static isDuration(x) {
    return x?.typeId === 18 /* Duration */;
  }
  /** @nocollapse */
  static isList(x) {
    return x?.typeId === 12 /* List */;
  }
  /** @nocollapse */
  static isLargeList(x) {
    return x?.typeId === 21 /* LargeList */;
  }
  // TODO: Implement ListView type
  //     /** @nocollapse */ static isListView(x: any): x is ListView { return x?.typeId === Type.ListView; }
  /** @nocollapse */
  static isStruct(x) {
    return x?.typeId === 13 /* Struct */;
  }
  /** @nocollapse */
  static isUnion(x) {
    return x?.typeId === 14 /* Union */;
  }
  /** @nocollapse */
  static isFixedSizeBinary(x) {
    return x?.typeId === 15 /* FixedSizeBinary */;
  }
  /** @nocollapse */
  static isFixedSizeList(x) {
    return x?.typeId === 16 /* FixedSizeList */;
  }
  /** @nocollapse */
  static isMap(x) {
    return x?.typeId === 17 /* Map */;
  }
  /** @nocollapse */
  static isDictionary(x) {
    return x?.typeId === -1 /* Dictionary */;
  }
  /** @nocollapse */
  static isDenseUnion(x) {
    return _DataType.isUnion(x) && x.mode === 1 /* Dense */;
  }
  /** @nocollapse */
  static isSparseUnion(x) {
    return _DataType.isUnion(x) && x.mode === 0 /* Sparse */;
  }
  constructor(typeId) {
    this.typeId = typeId;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.children = null;
    proto.ArrayType = Array;
    proto.OffsetArrayType = Int32Array;
    proto[kDataTypeSymbol] = true;
    return proto[Symbol.toStringTag] = "DataType";
  })(_DataType.prototype);
};
var Null2 = class _Null extends DataType {
  constructor() {
    super(1 /* Null */);
  }
  toString() {
    return `Null`;
  }
  static [Symbol.toStringTag] = ((proto) => proto[Symbol.toStringTag] = "Null")(_Null.prototype);
};
var Int_ = class _Int_ extends DataType {
  constructor(isSigned, bitWidth) {
    super(2 /* Int */);
    this.isSigned = isSigned;
    this.bitWidth = bitWidth;
  }
  get ArrayType() {
    switch (this.bitWidth) {
      case 8:
        return this.isSigned ? Int8Array : Uint8Array;
      case 16:
        return this.isSigned ? Int16Array : Uint16Array;
      case 32:
        return this.isSigned ? Int32Array : Uint32Array;
      case 64:
        return this.isSigned ? BigInt64Array : BigUint64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
  toString() {
    return `${this.isSigned ? `I` : `Ui`}nt${this.bitWidth}`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.isSigned = null;
    proto.bitWidth = null;
    return proto[Symbol.toStringTag] = "Int";
  })(_Int_.prototype);
};
var Int8 = class extends Int_ {
  constructor() {
    super(true, 8);
  }
  get ArrayType() {
    return Int8Array;
  }
};
var Int16 = class extends Int_ {
  constructor() {
    super(true, 16);
  }
  get ArrayType() {
    return Int16Array;
  }
};
var Int32 = class extends Int_ {
  constructor() {
    super(true, 32);
  }
  get ArrayType() {
    return Int32Array;
  }
};
var Int64 = class extends Int_ {
  constructor() {
    super(true, 64);
  }
  get ArrayType() {
    return BigInt64Array;
  }
};
var Uint8 = class extends Int_ {
  constructor() {
    super(false, 8);
  }
  get ArrayType() {
    return Uint8Array;
  }
};
var Uint16 = class extends Int_ {
  constructor() {
    super(false, 16);
  }
  get ArrayType() {
    return Uint16Array;
  }
};
var Uint32 = class extends Int_ {
  constructor() {
    super(false, 32);
  }
  get ArrayType() {
    return Uint32Array;
  }
};
var Uint64 = class extends Int_ {
  constructor() {
    super(false, 64);
  }
  get ArrayType() {
    return BigUint64Array;
  }
};
Object.defineProperty(Int8.prototype, "ArrayType", { value: Int8Array });
Object.defineProperty(Int16.prototype, "ArrayType", { value: Int16Array });
Object.defineProperty(Int32.prototype, "ArrayType", { value: Int32Array });
Object.defineProperty(Int64.prototype, "ArrayType", { value: BigInt64Array });
Object.defineProperty(Uint8.prototype, "ArrayType", { value: Uint8Array });
Object.defineProperty(Uint16.prototype, "ArrayType", { value: Uint16Array });
Object.defineProperty(Uint32.prototype, "ArrayType", { value: Uint32Array });
Object.defineProperty(Uint64.prototype, "ArrayType", { value: BigUint64Array });
var Float = class _Float extends DataType {
  constructor(precision) {
    super(3 /* Float */);
    this.precision = precision;
  }
  get ArrayType() {
    switch (this.precision) {
      case 0 /* HALF */:
        return Uint16Array;
      case 1 /* SINGLE */:
        return Float32Array;
      case 2 /* DOUBLE */:
        return Float64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
  toString() {
    return `Float${this.precision << 5 || 16}`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.precision = null;
    return proto[Symbol.toStringTag] = "Float";
  })(_Float.prototype);
};
var Float16 = class extends Float {
  constructor() {
    super(0 /* HALF */);
  }
};
var Float32 = class extends Float {
  constructor() {
    super(1 /* SINGLE */);
  }
};
var Float64 = class extends Float {
  constructor() {
    super(2 /* DOUBLE */);
  }
};
Object.defineProperty(Float16.prototype, "ArrayType", { value: Uint16Array });
Object.defineProperty(Float32.prototype, "ArrayType", { value: Float32Array });
Object.defineProperty(Float64.prototype, "ArrayType", { value: Float64Array });
var Binary2 = class _Binary extends DataType {
  constructor() {
    super(4 /* Binary */);
  }
  toString() {
    return `Binary`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = "Binary";
  })(_Binary.prototype);
};
var BinaryView2 = class _BinaryView extends DataType {
  static ELEMENT_WIDTH = 16;
  static INLINE_CAPACITY = 12;
  static LENGTH_OFFSET = 0;
  static INLINE_OFFSET = 4;
  static BUFFER_INDEX_OFFSET = 8;
  static BUFFER_OFFSET_OFFSET = 12;
  constructor() {
    super(23 /* BinaryView */);
  }
  toString() {
    return `BinaryView`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = "BinaryView";
  })(_BinaryView.prototype);
};
var LargeBinary2 = class _LargeBinary extends DataType {
  constructor() {
    super(19 /* LargeBinary */);
  }
  toString() {
    return `LargeBinary`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = "LargeBinary";
  })(_LargeBinary.prototype);
};
var Utf82 = class _Utf8 extends DataType {
  constructor() {
    super(5 /* Utf8 */);
  }
  toString() {
    return `Utf8`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = "Utf8";
  })(_Utf8.prototype);
};
var Utf8View2 = class _Utf8View extends DataType {
  static ELEMENT_WIDTH = BinaryView2.ELEMENT_WIDTH;
  static INLINE_CAPACITY = BinaryView2.INLINE_CAPACITY;
  constructor() {
    super(24 /* Utf8View */);
  }
  toString() {
    return `Utf8View`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = "Utf8View";
  })(_Utf8View.prototype);
};
var LargeUtf82 = class _LargeUtf8 extends DataType {
  constructor() {
    super(20 /* LargeUtf8 */);
  }
  toString() {
    return `LargeUtf8`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = "LargeUtf8";
  })(_LargeUtf8.prototype);
};
var Bool2 = class _Bool extends DataType {
  constructor() {
    super(6 /* Bool */);
  }
  toString() {
    return `Bool`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = "Bool";
  })(_Bool.prototype);
};
var Decimal2 = class _Decimal extends DataType {
  constructor(scale, precision, bitWidth = 128) {
    super(7 /* Decimal */);
    this.scale = scale;
    this.precision = precision;
    this.bitWidth = bitWidth;
  }
  toString() {
    return `Decimal[${this.precision}e${this.scale > 0 ? `+` : ``}${this.scale}]`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.scale = null;
    proto.precision = null;
    proto.ArrayType = Uint32Array;
    return proto[Symbol.toStringTag] = "Decimal";
  })(_Decimal.prototype);
};
var Date_ = class _Date_ extends DataType {
  constructor(unit) {
    super(8 /* Date */);
    this.unit = unit;
  }
  toString() {
    return `Date${(this.unit + 1) * 32}<${DateUnit[this.unit]}>`;
  }
  get ArrayType() {
    return this.unit === 0 /* DAY */ ? Int32Array : BigInt64Array;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.unit = null;
    return proto[Symbol.toStringTag] = "Date";
  })(_Date_.prototype);
};
var DateDay = class extends Date_ {
  constructor() {
    super(0 /* DAY */);
  }
};
var DateMillisecond = class extends Date_ {
  constructor() {
    super(1 /* MILLISECOND */);
  }
};
var Time_ = class _Time_ extends DataType {
  constructor(unit, bitWidth) {
    super(9 /* Time */);
    this.unit = unit;
    this.bitWidth = bitWidth;
  }
  toString() {
    return `Time${this.bitWidth}<${TimeUnit[this.unit]}>`;
  }
  get ArrayType() {
    switch (this.bitWidth) {
      case 32:
        return Int32Array;
      case 64:
        return BigInt64Array;
    }
    throw new Error(`Unrecognized ${this[Symbol.toStringTag]} type`);
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.unit = null;
    proto.bitWidth = null;
    return proto[Symbol.toStringTag] = "Time";
  })(_Time_.prototype);
};
var TimeSecond = class extends Time_ {
  constructor() {
    super(0 /* SECOND */, 32);
  }
};
var TimeMillisecond = class extends Time_ {
  constructor() {
    super(1 /* MILLISECOND */, 32);
  }
};
var TimeMicrosecond = class extends Time_ {
  constructor() {
    super(2 /* MICROSECOND */, 64);
  }
};
var TimeNanosecond = class extends Time_ {
  constructor() {
    super(3 /* NANOSECOND */, 64);
  }
};
var Timestamp_ = class _Timestamp_ extends DataType {
  constructor(unit, timezone) {
    super(10 /* Timestamp */);
    this.unit = unit;
    this.timezone = timezone;
  }
  toString() {
    return `Timestamp<${TimeUnit[this.unit]}${this.timezone ? `, ${this.timezone}` : ``}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.unit = null;
    proto.timezone = null;
    proto.ArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = "Timestamp";
  })(_Timestamp_.prototype);
};
var TimestampSecond = class extends Timestamp_ {
  constructor(timezone) {
    super(0 /* SECOND */, timezone);
  }
};
var TimestampMillisecond = class extends Timestamp_ {
  constructor(timezone) {
    super(1 /* MILLISECOND */, timezone);
  }
};
var TimestampMicrosecond = class extends Timestamp_ {
  constructor(timezone) {
    super(2 /* MICROSECOND */, timezone);
  }
};
var TimestampNanosecond = class extends Timestamp_ {
  constructor(timezone) {
    super(3 /* NANOSECOND */, timezone);
  }
};
var Interval_ = class _Interval_ extends DataType {
  constructor(unit) {
    super(11 /* Interval */);
    this.unit = unit;
  }
  toString() {
    return `Interval<${IntervalUnit[this.unit]}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.unit = null;
    proto.ArrayType = Int32Array;
    return proto[Symbol.toStringTag] = "Interval";
  })(_Interval_.prototype);
};
var IntervalDayTime = class extends Interval_ {
  constructor() {
    super(1 /* DAY_TIME */);
  }
};
var IntervalYearMonth = class extends Interval_ {
  constructor() {
    super(0 /* YEAR_MONTH */);
  }
};
var IntervalMonthDayNano = class extends Interval_ {
  constructor() {
    super(2 /* MONTH_DAY_NANO */);
  }
};
var Duration2 = class _Duration extends DataType {
  constructor(unit) {
    super(18 /* Duration */);
    this.unit = unit;
  }
  toString() {
    return `Duration<${TimeUnit[this.unit]}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.unit = null;
    proto.ArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = "Duration";
  })(_Duration.prototype);
};
var DurationSecond = class extends Duration2 {
  constructor() {
    super(0 /* SECOND */);
  }
};
var DurationMillisecond = class extends Duration2 {
  constructor() {
    super(1 /* MILLISECOND */);
  }
};
var DurationMicrosecond = class extends Duration2 {
  constructor() {
    super(2 /* MICROSECOND */);
  }
};
var DurationNanosecond = class extends Duration2 {
  constructor() {
    super(3 /* NANOSECOND */);
  }
};
var List2 = class _List extends DataType {
  constructor(child) {
    super(12 /* List */);
    this.children = [child];
  }
  toString() {
    return `List<${this.valueType}>`;
  }
  get valueType() {
    return this.children[0].type;
  }
  get valueField() {
    return this.children[0];
  }
  get ArrayType() {
    return this.valueType.ArrayType;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.children = null;
    return proto[Symbol.toStringTag] = "List";
  })(_List.prototype);
};
var LargeList2 = class _LargeList extends DataType {
  constructor(child) {
    super(21 /* LargeList */);
    this.children = [child];
  }
  toString() {
    return `LargeList<${this.valueType}>`;
  }
  get valueType() {
    return this.children[0].type;
  }
  get valueField() {
    return this.children[0];
  }
  get ArrayType() {
    return this.valueType.ArrayType;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.children = null;
    proto.OffsetArrayType = BigInt64Array;
    return proto[Symbol.toStringTag] = "LargeList";
  })(_LargeList.prototype);
};
var Struct = class _Struct extends DataType {
  constructor(children) {
    super(13 /* Struct */);
    this.children = children;
  }
  toString() {
    return `Struct<{${this.children.map((f) => `${f.name}:${f.type}`).join(`, `)}}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.children = null;
    return proto[Symbol.toStringTag] = "Struct";
  })(_Struct.prototype);
};
var Union_ = class _Union_ extends DataType {
  constructor(mode, typeIds, children) {
    super(14 /* Union */);
    this.mode = mode;
    this.children = children;
    this.typeIds = typeIds = Int32Array.from(typeIds);
    this.typeIdToChildIndex = typeIds.reduce((typeIdToChildIndex, typeId, idx) => (typeIdToChildIndex[typeId] = idx) && typeIdToChildIndex || typeIdToChildIndex, /* @__PURE__ */ Object.create(null));
  }
  toString() {
    return `${this[Symbol.toStringTag]}<${this.children.map((x) => `${x.type}`).join(` | `)}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.mode = null;
    proto.typeIds = null;
    proto.children = null;
    proto.typeIdToChildIndex = null;
    proto.ArrayType = Int8Array;
    return proto[Symbol.toStringTag] = "Union";
  })(_Union_.prototype);
};
var DenseUnion = class extends Union_ {
  constructor(typeIds, children) {
    super(1 /* Dense */, typeIds, children);
  }
};
var SparseUnion = class extends Union_ {
  constructor(typeIds, children) {
    super(0 /* Sparse */, typeIds, children);
  }
};
var FixedSizeBinary2 = class _FixedSizeBinary extends DataType {
  constructor(byteWidth) {
    super(15 /* FixedSizeBinary */);
    this.byteWidth = byteWidth;
  }
  toString() {
    return `FixedSizeBinary[${this.byteWidth}]`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.byteWidth = null;
    proto.ArrayType = Uint8Array;
    return proto[Symbol.toStringTag] = "FixedSizeBinary";
  })(_FixedSizeBinary.prototype);
};
var FixedSizeList2 = class _FixedSizeList extends DataType {
  constructor(listSize, child) {
    super(16 /* FixedSizeList */);
    this.listSize = listSize;
    this.children = [child];
  }
  get valueType() {
    return this.children[0].type;
  }
  get valueField() {
    return this.children[0];
  }
  get ArrayType() {
    return this.valueType.ArrayType;
  }
  toString() {
    return `FixedSizeList[${this.listSize}]<${this.valueType}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.children = null;
    proto.listSize = null;
    return proto[Symbol.toStringTag] = "FixedSizeList";
  })(_FixedSizeList.prototype);
};
var Map_ = class _Map_ extends DataType {
  constructor(entries, keysSorted = false) {
    super(17 /* Map */);
    this.children = [entries];
    this.keysSorted = keysSorted;
    if (entries) {
      entries["name"] = "entries";
      if (entries?.type?.children) {
        const key = entries?.type?.children[0];
        if (key) {
          key["name"] = "key";
        }
        const val = entries?.type?.children[1];
        if (val) {
          val["name"] = "value";
        }
      }
    }
  }
  get keyType() {
    return this.children[0].type.children[0].type;
  }
  get valueType() {
    return this.children[0].type.children[1].type;
  }
  get childType() {
    return this.children[0].type;
  }
  toString() {
    return `Map<{${this.children[0].type.children.map((f) => `${f.name}:${f.type}`).join(`, `)}}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.children = null;
    proto.keysSorted = null;
    return proto[Symbol.toStringTag] = "Map_";
  })(_Map_.prototype);
};
var getId = /* @__PURE__ */ ((atomicDictionaryId) => () => ++atomicDictionaryId)(-1);
var Dictionary = class _Dictionary extends DataType {
  constructor(dictionary, indices, id, isOrdered) {
    super(-1 /* Dictionary */);
    this.indices = indices;
    this.dictionary = dictionary;
    this.isOrdered = isOrdered || false;
    this.id = id == null ? getId() : bigIntToNumber(id);
  }
  get children() {
    return this.dictionary.children;
  }
  get valueType() {
    return this.dictionary;
  }
  get ArrayType() {
    return this.dictionary.ArrayType;
  }
  toString() {
    return `Dictionary<${this.indices}, ${this.dictionary}>`;
  }
  static [Symbol.toStringTag] = ((proto) => {
    proto.id = null;
    proto.indices = null;
    proto.isOrdered = null;
    proto.dictionary = null;
    return proto[Symbol.toStringTag] = "Dictionary";
  })(_Dictionary.prototype);
};
function strideForType(type) {
  const t = type;
  switch (type.typeId) {
    case 7 /* Decimal */:
      return type.bitWidth / 32;
    case 11 /* Interval */: {
      if (t.unit === 2 /* MONTH_DAY_NANO */) {
        return 4;
      }
      return 1 + t.unit;
    }
    // case Type.Int: return 1 + +((t as Int_).bitWidth > 32);
    // case Type.Time: return 1 + +((t as Time_).bitWidth > 32);
    case 23 /* BinaryView */:
    case 24 /* Utf8View */:
      return 16;
    case 16 /* FixedSizeList */:
      return t.listSize;
    case 15 /* FixedSizeBinary */:
      return t.byteWidth;
    default:
      return 1;
  }
}

// src/visitor.ts
var Visitor = class {
  visitMany(nodes, ...args) {
    return nodes.map((node, i) => this.visit(node, ...args.map((x) => x[i])));
  }
  visit(...args) {
    return this.getVisitFn(args[0], false).apply(this, args);
  }
  getVisitFn(node, throwIfNotFound = true) {
    return getVisitFn(this, node, throwIfNotFound);
  }
  getVisitFnByTypeId(typeId, throwIfNotFound = true) {
    return getVisitFnByTypeId(this, typeId, throwIfNotFound);
  }
  visitNull(_node, ..._args) {
    return null;
  }
  visitBool(_node, ..._args) {
    return null;
  }
  visitInt(_node, ..._args) {
    return null;
  }
  visitFloat(_node, ..._args) {
    return null;
  }
  visitUtf8(_node, ..._args) {
    return null;
  }
  visitLargeUtf8(_node, ..._args) {
    return null;
  }
  visitUtf8View(_node, ..._args) {
    return null;
  }
  visitBinary(_node, ..._args) {
    return null;
  }
  visitLargeBinary(_node, ..._args) {
    return null;
  }
  visitBinaryView(_node, ..._args) {
    return null;
  }
  visitFixedSizeBinary(_node, ..._args) {
    return null;
  }
  visitDate(_node, ..._args) {
    return null;
  }
  visitTimestamp(_node, ..._args) {
    return null;
  }
  visitTime(_node, ..._args) {
    return null;
  }
  visitDecimal(_node, ..._args) {
    return null;
  }
  visitList(_node, ..._args) {
    return null;
  }
  visitLargeList(_node, ..._args) {
    return null;
  }
  visitStruct(_node, ..._args) {
    return null;
  }
  visitUnion(_node, ..._args) {
    return null;
  }
  visitDictionary(_node, ..._args) {
    return null;
  }
  visitInterval(_node, ..._args) {
    return null;
  }
  visitDuration(_node, ..._args) {
    return null;
  }
  visitFixedSizeList(_node, ..._args) {
    return null;
  }
  visitMap(_node, ..._args) {
    return null;
  }
};
function getVisitFn(visitor, node, throwIfNotFound = true) {
  if (typeof node === "number") {
    return getVisitFnByTypeId(visitor, node, throwIfNotFound);
  }
  if (typeof node === "string" && node in Type2) {
    return getVisitFnByTypeId(visitor, Type2[node], throwIfNotFound);
  }
  if (node && node instanceof DataType) {
    return getVisitFnByTypeId(visitor, inferDType(node), throwIfNotFound);
  }
  if (node?.type && node.type instanceof DataType) {
    return getVisitFnByTypeId(visitor, inferDType(node.type), throwIfNotFound);
  }
  return getVisitFnByTypeId(visitor, 0 /* NONE */, throwIfNotFound);
}
function getVisitFnByTypeId(visitor, dtype, throwIfNotFound = true) {
  let fn = null;
  switch (dtype) {
    case 1 /* Null */:
      fn = visitor.visitNull;
      break;
    case 6 /* Bool */:
      fn = visitor.visitBool;
      break;
    case 2 /* Int */:
      fn = visitor.visitInt;
      break;
    case -2 /* Int8 */:
      fn = visitor.visitInt8 || visitor.visitInt;
      break;
    case -3 /* Int16 */:
      fn = visitor.visitInt16 || visitor.visitInt;
      break;
    case -4 /* Int32 */:
      fn = visitor.visitInt32 || visitor.visitInt;
      break;
    case -5 /* Int64 */:
      fn = visitor.visitInt64 || visitor.visitInt;
      break;
    case -6 /* Uint8 */:
      fn = visitor.visitUint8 || visitor.visitInt;
      break;
    case -7 /* Uint16 */:
      fn = visitor.visitUint16 || visitor.visitInt;
      break;
    case -8 /* Uint32 */:
      fn = visitor.visitUint32 || visitor.visitInt;
      break;
    case -9 /* Uint64 */:
      fn = visitor.visitUint64 || visitor.visitInt;
      break;
    case 3 /* Float */:
      fn = visitor.visitFloat;
      break;
    case -10 /* Float16 */:
      fn = visitor.visitFloat16 || visitor.visitFloat;
      break;
    case -11 /* Float32 */:
      fn = visitor.visitFloat32 || visitor.visitFloat;
      break;
    case -12 /* Float64 */:
      fn = visitor.visitFloat64 || visitor.visitFloat;
      break;
    case 5 /* Utf8 */:
      fn = visitor.visitUtf8;
      break;
    case 20 /* LargeUtf8 */:
      fn = visitor.visitLargeUtf8;
      break;
    case 24 /* Utf8View */:
      fn = visitor.visitUtf8View || visitor.visitUtf8;
      break;
    case 4 /* Binary */:
      fn = visitor.visitBinary;
      break;
    case 19 /* LargeBinary */:
      fn = visitor.visitLargeBinary;
      break;
    case 23 /* BinaryView */:
      fn = visitor.visitBinaryView || visitor.visitBinary;
      break;
    case 15 /* FixedSizeBinary */:
      fn = visitor.visitFixedSizeBinary;
      break;
    case 8 /* Date */:
      fn = visitor.visitDate;
      break;
    case -13 /* DateDay */:
      fn = visitor.visitDateDay || visitor.visitDate;
      break;
    case -14 /* DateMillisecond */:
      fn = visitor.visitDateMillisecond || visitor.visitDate;
      break;
    case 10 /* Timestamp */:
      fn = visitor.visitTimestamp;
      break;
    case -15 /* TimestampSecond */:
      fn = visitor.visitTimestampSecond || visitor.visitTimestamp;
      break;
    case -16 /* TimestampMillisecond */:
      fn = visitor.visitTimestampMillisecond || visitor.visitTimestamp;
      break;
    case -17 /* TimestampMicrosecond */:
      fn = visitor.visitTimestampMicrosecond || visitor.visitTimestamp;
      break;
    case -18 /* TimestampNanosecond */:
      fn = visitor.visitTimestampNanosecond || visitor.visitTimestamp;
      break;
    case 9 /* Time */:
      fn = visitor.visitTime;
      break;
    case -19 /* TimeSecond */:
      fn = visitor.visitTimeSecond || visitor.visitTime;
      break;
    case -20 /* TimeMillisecond */:
      fn = visitor.visitTimeMillisecond || visitor.visitTime;
      break;
    case -21 /* TimeMicrosecond */:
      fn = visitor.visitTimeMicrosecond || visitor.visitTime;
      break;
    case -22 /* TimeNanosecond */:
      fn = visitor.visitTimeNanosecond || visitor.visitTime;
      break;
    case 7 /* Decimal */:
      fn = visitor.visitDecimal;
      break;
    case 12 /* List */:
      fn = visitor.visitList;
      break;
    case 21 /* LargeList */:
      fn = visitor.visitLargeList;
      break;
    case 13 /* Struct */:
      fn = visitor.visitStruct;
      break;
    case 14 /* Union */:
      fn = visitor.visitUnion;
      break;
    case -23 /* DenseUnion */:
      fn = visitor.visitDenseUnion || visitor.visitUnion;
      break;
    case -24 /* SparseUnion */:
      fn = visitor.visitSparseUnion || visitor.visitUnion;
      break;
    case -1 /* Dictionary */:
      fn = visitor.visitDictionary;
      break;
    case 11 /* Interval */:
      fn = visitor.visitInterval;
      break;
    case -25 /* IntervalDayTime */:
      fn = visitor.visitIntervalDayTime || visitor.visitInterval;
      break;
    case -26 /* IntervalYearMonth */:
      fn = visitor.visitIntervalYearMonth || visitor.visitInterval;
      break;
    case -31 /* IntervalMonthDayNano */:
      fn = visitor.visitIntervalMonthDayNano || visitor.visitInterval;
      break;
    case 18 /* Duration */:
      fn = visitor.visitDuration;
      break;
    case -27 /* DurationSecond */:
      fn = visitor.visitDurationSecond || visitor.visitDuration;
      break;
    case -28 /* DurationMillisecond */:
      fn = visitor.visitDurationMillisecond || visitor.visitDuration;
      break;
    case -29 /* DurationMicrosecond */:
      fn = visitor.visitDurationMicrosecond || visitor.visitDuration;
      break;
    case -30 /* DurationNanosecond */:
      fn = visitor.visitDurationNanosecond || visitor.visitDuration;
      break;
    case 16 /* FixedSizeList */:
      fn = visitor.visitFixedSizeList;
      break;
    case 17 /* Map */:
      fn = visitor.visitMap;
      break;
  }
  if (typeof fn === "function") return fn;
  if (!throwIfNotFound) return () => null;
  throw new Error(`Unrecognized type '${Type2[dtype]}'`);
}
function inferDType(type) {
  switch (type.typeId) {
    case 1 /* Null */:
      return 1 /* Null */;
    case 2 /* Int */: {
      const { bitWidth, isSigned } = type;
      switch (bitWidth) {
        case 8:
          return isSigned ? -2 /* Int8 */ : -6 /* Uint8 */;
        case 16:
          return isSigned ? -3 /* Int16 */ : -7 /* Uint16 */;
        case 32:
          return isSigned ? -4 /* Int32 */ : -8 /* Uint32 */;
        case 64:
          return isSigned ? -5 /* Int64 */ : -9 /* Uint64 */;
      }
      return 2 /* Int */;
    }
    case 3 /* Float */:
      switch (type.precision) {
        case 0 /* HALF */:
          return -10 /* Float16 */;
        case 1 /* SINGLE */:
          return -11 /* Float32 */;
        case 2 /* DOUBLE */:
          return -12 /* Float64 */;
      }
      return 3 /* Float */;
    case 4 /* Binary */:
      return 4 /* Binary */;
    case 19 /* LargeBinary */:
      return 19 /* LargeBinary */;
    case 23 /* BinaryView */:
      return 23 /* BinaryView */;
    case 5 /* Utf8 */:
      return 5 /* Utf8 */;
    case 20 /* LargeUtf8 */:
      return 20 /* LargeUtf8 */;
    case 24 /* Utf8View */:
      return 24 /* Utf8View */;
    case 6 /* Bool */:
      return 6 /* Bool */;
    case 7 /* Decimal */:
      return 7 /* Decimal */;
    case 9 /* Time */:
      switch (type.unit) {
        case 0 /* SECOND */:
          return -19 /* TimeSecond */;
        case 1 /* MILLISECOND */:
          return -20 /* TimeMillisecond */;
        case 2 /* MICROSECOND */:
          return -21 /* TimeMicrosecond */;
        case 3 /* NANOSECOND */:
          return -22 /* TimeNanosecond */;
      }
      return 9 /* Time */;
    case 10 /* Timestamp */:
      switch (type.unit) {
        case 0 /* SECOND */:
          return -15 /* TimestampSecond */;
        case 1 /* MILLISECOND */:
          return -16 /* TimestampMillisecond */;
        case 2 /* MICROSECOND */:
          return -17 /* TimestampMicrosecond */;
        case 3 /* NANOSECOND */:
          return -18 /* TimestampNanosecond */;
      }
      return 10 /* Timestamp */;
    case 8 /* Date */:
      switch (type.unit) {
        case 0 /* DAY */:
          return -13 /* DateDay */;
        case 1 /* MILLISECOND */:
          return -14 /* DateMillisecond */;
      }
      return 8 /* Date */;
    case 11 /* Interval */:
      switch (type.unit) {
        case 1 /* DAY_TIME */:
          return -25 /* IntervalDayTime */;
        case 0 /* YEAR_MONTH */:
          return -26 /* IntervalYearMonth */;
        case 2 /* MONTH_DAY_NANO */:
          return -31 /* IntervalMonthDayNano */;
      }
      return 11 /* Interval */;
    case 18 /* Duration */:
      switch (type.unit) {
        case 0 /* SECOND */:
          return -27 /* DurationSecond */;
        case 1 /* MILLISECOND */:
          return -28 /* DurationMillisecond */;
        case 2 /* MICROSECOND */:
          return -29 /* DurationMicrosecond */;
        case 3 /* NANOSECOND */:
          return -30 /* DurationNanosecond */;
      }
      return 18 /* Duration */;
    case 17 /* Map */:
      return 17 /* Map */;
    case 12 /* List */:
      return 12 /* List */;
    case 21 /* LargeList */:
      return 21 /* LargeList */;
    case 13 /* Struct */:
      return 13 /* Struct */;
    case 14 /* Union */:
      switch (type.mode) {
        case 1 /* Dense */:
          return -23 /* DenseUnion */;
        case 0 /* Sparse */:
          return -24 /* SparseUnion */;
      }
      return 14 /* Union */;
    case 15 /* FixedSizeBinary */:
      return 15 /* FixedSizeBinary */;
    case 16 /* FixedSizeList */:
      return 16 /* FixedSizeList */;
    case -1 /* Dictionary */:
      return -1 /* Dictionary */;
  }
  throw new Error(`Unrecognized type '${Type2[type.typeId]}'`);
}
Visitor.prototype.visitInt8 = null;
Visitor.prototype.visitInt16 = null;
Visitor.prototype.visitInt32 = null;
Visitor.prototype.visitInt64 = null;
Visitor.prototype.visitUint8 = null;
Visitor.prototype.visitUint16 = null;
Visitor.prototype.visitUint32 = null;
Visitor.prototype.visitUint64 = null;
Visitor.prototype.visitFloat16 = null;
Visitor.prototype.visitFloat32 = null;
Visitor.prototype.visitFloat64 = null;
Visitor.prototype.visitDateDay = null;
Visitor.prototype.visitDateMillisecond = null;
Visitor.prototype.visitTimestampSecond = null;
Visitor.prototype.visitTimestampMillisecond = null;
Visitor.prototype.visitTimestampMicrosecond = null;
Visitor.prototype.visitTimestampNanosecond = null;
Visitor.prototype.visitTimeSecond = null;
Visitor.prototype.visitTimeMillisecond = null;
Visitor.prototype.visitTimeMicrosecond = null;
Visitor.prototype.visitTimeNanosecond = null;
Visitor.prototype.visitDenseUnion = null;
Visitor.prototype.visitSparseUnion = null;
Visitor.prototype.visitIntervalDayTime = null;
Visitor.prototype.visitIntervalYearMonth = null;
Visitor.prototype.visitIntervalMonthDayNano = null;
Visitor.prototype.visitDuration = null;
Visitor.prototype.visitDurationSecond = null;
Visitor.prototype.visitDurationMillisecond = null;
Visitor.prototype.visitDurationMicrosecond = null;
Visitor.prototype.visitDurationNanosecond = null;

// src/util/math.ts
var math_exports = {};
__export(math_exports, {
  float64ToUint16: () => float64ToUint16,
  uint16ToFloat64: () => uint16ToFloat64
});
var f64 = new Float64Array(1);
var u32 = new Uint32Array(f64.buffer);
function uint16ToFloat64(h) {
  const expo = (h & 31744) >> 10;
  const sigf = (h & 1023) / 1024;
  const sign = (-1) ** ((h & 32768) >> 15);
  switch (expo) {
    case 31:
      return sign * (sigf ? Number.NaN : 1 / 0);
    case 0:
      return sign * (sigf ? 6103515625e-14 * sigf : 0);
  }
  return sign * 2 ** (expo - 15) * (1 + sigf);
}
function float64ToUint16(d) {
  if (d !== d) {
    return 32256;
  }
  f64[0] = d;
  const sign = (u32[1] & 2147483648) >> 16 & 65535;
  let expo = u32[1] & 2146435072, sigf = 0;
  if (expo >= 1089470464) {
    if (u32[0] > 0) {
      expo = 31744;
    } else {
      expo = (expo & 2080374784) >> 16;
      sigf = (u32[1] & 1048575) >> 10;
    }
  } else if (expo <= 1056964608) {
    sigf = 1048576 + (u32[1] & 1048575);
    sigf = 1048576 + (sigf << (expo >> 20) - 998) >> 21;
    expo = 0;
  } else {
    expo = expo - 1056964608 >> 10;
    sigf = (u32[1] & 1048575) + 512 >> 10;
  }
  return sign | expo | sigf & 65535;
}

// src/visitor/set.ts
var SetVisitor = class extends Visitor {
};
function wrapSet(fn) {
  return (data, _1, _2) => {
    if (data.setValid(_1, _2 != null)) {
      return fn(data, _1, _2);
    }
  };
}
var setEpochMsToDays = (data, index, epochMs) => {
  data[index] = Math.floor(epochMs / 864e5);
};
var setVariableWidthBytes = (values, valueOffsets, index, value) => {
  if (index + 1 < valueOffsets.length) {
    const x = bigIntToNumber(valueOffsets[index]);
    const y = bigIntToNumber(valueOffsets[index + 1]);
    values.set(value.subarray(0, y - x), x);
  }
};
var setBool = ({ offset, values }, index, val) => {
  const idx = offset + index;
  val ? values[idx >> 3] |= 1 << idx % 8 : values[idx >> 3] &= ~(1 << idx % 8);
};
var setInt = ({ values }, index, value) => {
  values[index] = value;
};
var setFloat = ({ values }, index, value) => {
  values[index] = value;
};
var setFloat16 = ({ values }, index, value) => {
  values[index] = float64ToUint16(value);
};
var setAnyFloat = (data, index, value) => {
  switch (data.type.precision) {
    case 0 /* HALF */:
      return setFloat16(data, index, value);
    case 1 /* SINGLE */:
    case 2 /* DOUBLE */:
      return setFloat(data, index, value);
  }
};
var setDateDay = ({ values }, index, value) => {
  setEpochMsToDays(values, index, value.valueOf());
};
var setDateMillisecond = ({ values }, index, value) => {
  values[index] = BigInt(value);
};
var setFixedSizeBinary = ({ stride, values }, index, value) => {
  values.set(value.subarray(0, stride), stride * index);
};
var setBinary = ({ values, valueOffsets }, index, value) => setVariableWidthBytes(values, valueOffsets, index, value);
var ensureWritableVariadicBuffers = (data) => {
  let buffers = data.variadicBuffers;
  if (!Array.isArray(buffers) || Object.isFrozen(buffers)) {
    buffers = Array.from(buffers);
    data.variadicBuffers = buffers;
  }
  return buffers;
};
var setBinaryViewBytes = (data, index, bytes) => {
  const views = data.values;
  if (!views) {
    throw new Error("BinaryView data is missing view buffer");
  }
  const elementWidth = BinaryView2.ELEMENT_WIDTH;
  const viewOffset = index * elementWidth;
  const end = viewOffset + elementWidth;
  if (viewOffset < 0 || end > views.length) {
    throw new RangeError(`BinaryView index ${index} out of bounds`);
  }
  views.fill(0, viewOffset, end);
  const view = new DataView(views.buffer, views.byteOffset + viewOffset, elementWidth);
  const length = bytes.length;
  view.setInt32(BinaryView2.LENGTH_OFFSET, length, true);
  if (length <= BinaryView2.INLINE_CAPACITY) {
    views.set(bytes, viewOffset + BinaryView2.INLINE_OFFSET);
    return;
  }
  const prefix = (bytes[0] ?? 0) | (bytes[1] ?? 0) << 8 | (bytes[2] ?? 0) << 16 | (bytes[3] ?? 0) << 24;
  view.setUint32(BinaryView2.INLINE_OFFSET, prefix >>> 0, true);
  const buffers = ensureWritableVariadicBuffers(data);
  const copy = bytes.slice();
  const bufferIndex = buffers.push(copy) - 1;
  view.setInt32(BinaryView2.BUFFER_INDEX_OFFSET, bufferIndex, true);
  view.setInt32(BinaryView2.BUFFER_OFFSET_OFFSET, 0, true);
};
var setBinaryView = (data, index, value) => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  setBinaryViewBytes(data, index, bytes);
};
var setUtf8 = ({ values, valueOffsets }, index, value) => setVariableWidthBytes(values, valueOffsets, index, encodeUtf8(value));
var setUtf8View = (data, index, value) => {
  const bytes = encodeUtf8(value);
  setBinaryViewBytes(data, index, bytes);
};
var setDate = (data, index, value) => {
  data.type.unit === 0 /* DAY */ ? setDateDay(data, index, value) : setDateMillisecond(data, index, value);
};
var setTimestampSecond = ({ values }, index, value) => {
  values[index] = BigInt(value / 1e3);
};
var setTimestampMillisecond = ({ values }, index, value) => {
  values[index] = BigInt(value);
};
var setTimestampMicrosecond = ({ values }, index, value) => {
  values[index] = BigInt(value * 1e3);
};
var setTimestampNanosecond = ({ values }, index, value) => {
  values[index] = BigInt(value * 1e6);
};
var setTimestamp = (data, index, value) => {
  switch (data.type.unit) {
    case 0 /* SECOND */:
      return setTimestampSecond(data, index, value);
    case 1 /* MILLISECOND */:
      return setTimestampMillisecond(data, index, value);
    case 2 /* MICROSECOND */:
      return setTimestampMicrosecond(data, index, value);
    case 3 /* NANOSECOND */:
      return setTimestampNanosecond(data, index, value);
  }
};
var setTimeSecond = ({ values }, index, value) => {
  values[index] = value;
};
var setTimeMillisecond = ({ values }, index, value) => {
  values[index] = value;
};
var setTimeMicrosecond = ({ values }, index, value) => {
  values[index] = value;
};
var setTimeNanosecond = ({ values }, index, value) => {
  values[index] = value;
};
var setTime = (data, index, value) => {
  switch (data.type.unit) {
    case 0 /* SECOND */:
      return setTimeSecond(data, index, value);
    case 1 /* MILLISECOND */:
      return setTimeMillisecond(data, index, value);
    case 2 /* MICROSECOND */:
      return setTimeMicrosecond(data, index, value);
    case 3 /* NANOSECOND */:
      return setTimeNanosecond(data, index, value);
  }
};
var setDecimal = ({ values, stride }, index, value) => {
  values.set(value.subarray(0, stride), stride * index);
};
var setList = (data, index, value) => {
  const values = data.children[0];
  const valueOffsets = data.valueOffsets;
  const set = instance.getVisitFn(values);
  const begin = bigIntToNumber(valueOffsets[index]);
  const end = bigIntToNumber(valueOffsets[index + 1]);
  if (Array.isArray(value)) {
    for (let idx = -1, itr = begin; itr < end; ) {
      set(values, itr++, value[++idx]);
    }
  } else {
    for (let idx = -1, itr = begin; itr < end; ) {
      set(values, itr++, value.get(++idx));
    }
  }
};
var setMap = (data, index, value) => {
  const values = data.children[0];
  const { valueOffsets } = data;
  const set = instance.getVisitFn(values);
  let { [index]: idx, [index + 1]: end } = valueOffsets;
  const entries = value instanceof Map ? value.entries() : Object.entries(value);
  for (const val of entries) {
    set(values, idx, val);
    if (++idx >= end) break;
  }
};
var _setStructArrayValue = (o, v) => (set, c, _, i) => c && set(c, o, v[i]);
var _setStructVectorValue = (o, v) => (set, c, _, i) => c && set(c, o, v.get(i));
var _setStructMapValue = (o, v) => (set, c, f, _) => c && set(c, o, v.get(f.name));
var _setStructObjectValue = (o, v) => (set, c, f, _) => c && set(c, o, v[f.name]);
var setStruct = (data, index, value) => {
  const childSetters = data.type.children.map((f) => instance.getVisitFn(f.type));
  const set = value instanceof Map ? _setStructMapValue(index, value) : value instanceof Vector ? _setStructVectorValue(index, value) : Array.isArray(value) ? _setStructArrayValue(index, value) : _setStructObjectValue(index, value);
  data.type.children.forEach((f, i) => set(childSetters[i], data.children[i], f, i));
};
var setUnion = (data, index, value) => {
  data.type.mode === 1 /* Dense */ ? setDenseUnion(data, index, value) : setSparseUnion(data, index, value);
};
var setDenseUnion = (data, index, value) => {
  const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
  const child = data.children[childIndex];
  instance.visit(child, data.valueOffsets[index], value);
};
var setSparseUnion = (data, index, value) => {
  const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
  const child = data.children[childIndex];
  instance.visit(child, index, value);
};
var setDictionary = (data, index, value) => {
  data.dictionary?.set(data.values[index], value);
};
var setIntervalValue = (data, index, value) => {
  switch (data.type.unit) {
    case 0 /* YEAR_MONTH */:
      return setIntervalYearMonth(data, index, value);
    case 1 /* DAY_TIME */:
      return setIntervalDayTime(data, index, value);
    case 2 /* MONTH_DAY_NANO */:
      return setIntervalMonthDayNano(data, index, value);
  }
};
var setIntervalDayTime = ({ values }, index, value) => {
  values.set(value.subarray(0, 2), 2 * index);
};
var setIntervalYearMonth = ({ values }, index, value) => {
  values[index] = value[0] * 12 + value[1] % 12;
};
var setIntervalMonthDayNano = ({ values, stride }, index, value) => {
  values.set(value.subarray(0, stride), stride * index);
};
var setDurationSecond = ({ values }, index, value) => {
  values[index] = value;
};
var setDurationMillisecond = ({ values }, index, value) => {
  values[index] = value;
};
var setDurationMicrosecond = ({ values }, index, value) => {
  values[index] = value;
};
var setDurationNanosecond = ({ values }, index, value) => {
  values[index] = value;
};
var setDuration = (data, index, value) => {
  switch (data.type.unit) {
    case 0 /* SECOND */:
      return setDurationSecond(data, index, value);
    case 1 /* MILLISECOND */:
      return setDurationMillisecond(data, index, value);
    case 2 /* MICROSECOND */:
      return setDurationMicrosecond(data, index, value);
    case 3 /* NANOSECOND */:
      return setDurationNanosecond(data, index, value);
  }
};
var setFixedSizeList = (data, index, value) => {
  const { stride } = data;
  const child = data.children[0];
  const set = instance.getVisitFn(child);
  if (Array.isArray(value)) {
    for (let idx = -1, offset = index * stride; ++idx < stride; ) {
      set(child, offset + idx, value[idx]);
    }
  } else {
    for (let idx = -1, offset = index * stride; ++idx < stride; ) {
      set(child, offset + idx, value.get(idx));
    }
  }
};
SetVisitor.prototype.visitBool = wrapSet(setBool);
SetVisitor.prototype.visitInt = wrapSet(setInt);
SetVisitor.prototype.visitInt8 = wrapSet(setInt);
SetVisitor.prototype.visitInt16 = wrapSet(setInt);
SetVisitor.prototype.visitInt32 = wrapSet(setInt);
SetVisitor.prototype.visitInt64 = wrapSet(setInt);
SetVisitor.prototype.visitUint8 = wrapSet(setInt);
SetVisitor.prototype.visitUint16 = wrapSet(setInt);
SetVisitor.prototype.visitUint32 = wrapSet(setInt);
SetVisitor.prototype.visitUint64 = wrapSet(setInt);
SetVisitor.prototype.visitFloat = wrapSet(setAnyFloat);
SetVisitor.prototype.visitFloat16 = wrapSet(setFloat16);
SetVisitor.prototype.visitFloat32 = wrapSet(setFloat);
SetVisitor.prototype.visitFloat64 = wrapSet(setFloat);
SetVisitor.prototype.visitUtf8 = wrapSet(setUtf8);
SetVisitor.prototype.visitLargeUtf8 = wrapSet(setUtf8);
SetVisitor.prototype.visitUtf8View = wrapSet(setUtf8View);
SetVisitor.prototype.visitBinary = wrapSet(setBinary);
SetVisitor.prototype.visitLargeBinary = wrapSet(setBinary);
SetVisitor.prototype.visitBinaryView = wrapSet(setBinaryView);
SetVisitor.prototype.visitFixedSizeBinary = wrapSet(setFixedSizeBinary);
SetVisitor.prototype.visitDate = wrapSet(setDate);
SetVisitor.prototype.visitDateDay = wrapSet(setDateDay);
SetVisitor.prototype.visitDateMillisecond = wrapSet(setDateMillisecond);
SetVisitor.prototype.visitTimestamp = wrapSet(setTimestamp);
SetVisitor.prototype.visitTimestampSecond = wrapSet(setTimestampSecond);
SetVisitor.prototype.visitTimestampMillisecond = wrapSet(setTimestampMillisecond);
SetVisitor.prototype.visitTimestampMicrosecond = wrapSet(setTimestampMicrosecond);
SetVisitor.prototype.visitTimestampNanosecond = wrapSet(setTimestampNanosecond);
SetVisitor.prototype.visitTime = wrapSet(setTime);
SetVisitor.prototype.visitTimeSecond = wrapSet(setTimeSecond);
SetVisitor.prototype.visitTimeMillisecond = wrapSet(setTimeMillisecond);
SetVisitor.prototype.visitTimeMicrosecond = wrapSet(setTimeMicrosecond);
SetVisitor.prototype.visitTimeNanosecond = wrapSet(setTimeNanosecond);
SetVisitor.prototype.visitDecimal = wrapSet(setDecimal);
SetVisitor.prototype.visitList = wrapSet(setList);
SetVisitor.prototype.visitLargeList = wrapSet(setList);
SetVisitor.prototype.visitStruct = wrapSet(setStruct);
SetVisitor.prototype.visitUnion = wrapSet(setUnion);
SetVisitor.prototype.visitDenseUnion = wrapSet(setDenseUnion);
SetVisitor.prototype.visitSparseUnion = wrapSet(setSparseUnion);
SetVisitor.prototype.visitDictionary = wrapSet(setDictionary);
SetVisitor.prototype.visitInterval = wrapSet(setIntervalValue);
SetVisitor.prototype.visitIntervalDayTime = wrapSet(setIntervalDayTime);
SetVisitor.prototype.visitIntervalYearMonth = wrapSet(setIntervalYearMonth);
SetVisitor.prototype.visitIntervalMonthDayNano = wrapSet(setIntervalMonthDayNano);
SetVisitor.prototype.visitDuration = wrapSet(setDuration);
SetVisitor.prototype.visitDurationSecond = wrapSet(setDurationSecond);
SetVisitor.prototype.visitDurationMillisecond = wrapSet(setDurationMillisecond);
SetVisitor.prototype.visitDurationMicrosecond = wrapSet(setDurationMicrosecond);
SetVisitor.prototype.visitDurationNanosecond = wrapSet(setDurationNanosecond);
SetVisitor.prototype.visitFixedSizeList = wrapSet(setFixedSizeList);
SetVisitor.prototype.visitMap = wrapSet(setMap);
var instance = new SetVisitor();

// src/row/struct.ts
var kParent = /* @__PURE__ */ Symbol.for("parent");
var kRowIndex = /* @__PURE__ */ Symbol.for("rowIndex");
var StructRow = class {
  constructor(parent, rowIndex) {
    this[kParent] = parent;
    this[kRowIndex] = rowIndex;
    return new Proxy(this, structRowProxyHandler);
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const i = this[kRowIndex];
    const parent = this[kParent];
    const keys = parent.type.children;
    const json = {};
    for (let j = -1, n = keys.length; ++j < n; ) {
      json[keys[j].name] = instance2.visit(parent.children[j], i);
    }
    return json;
  }
  toString() {
    return `{${[...this].map(
      ([key, val]) => `${valueToString(key)}: ${valueToString(val)}`
    ).join(", ")}}`;
  }
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
  [Symbol.iterator]() {
    return new StructRowIterator(this[kParent], this[kRowIndex]);
  }
};
var StructRowIterator = class {
  constructor(data, rowIndex) {
    this.childIndex = 0;
    this.children = data.children;
    this.rowIndex = rowIndex;
    this.childFields = data.type.children;
    this.numChildren = this.childFields.length;
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const i = this.childIndex;
    if (i < this.numChildren) {
      this.childIndex = i + 1;
      return {
        done: false,
        value: [
          this.childFields[i].name,
          instance2.visit(this.children[i], this.rowIndex)
        ]
      };
    }
    return { done: true, value: null };
  }
};
Object.defineProperties(StructRow.prototype, {
  [Symbol.toStringTag]: { enumerable: false, configurable: false, value: "Row" },
  [kParent]: { writable: true, enumerable: false, configurable: false, value: null },
  [kRowIndex]: { writable: true, enumerable: false, configurable: false, value: -1 }
});
var StructRowProxyHandler = class {
  isExtensible() {
    return false;
  }
  deleteProperty() {
    return false;
  }
  preventExtensions() {
    return true;
  }
  ownKeys(row) {
    return row[kParent].type.children.map((f) => f.name);
  }
  has(row, key) {
    return row[kParent].type.children.some((f) => f.name === key);
  }
  getOwnPropertyDescriptor(row, key) {
    if (row[kParent].type.children.some((f) => f.name === key)) {
      return { writable: true, enumerable: true, configurable: true };
    }
    return;
  }
  get(row, key) {
    if (Reflect.has(row, key)) {
      return row[key];
    }
    const idx = row[kParent].type.children.findIndex((f) => f.name === key);
    if (idx !== -1) {
      const val = instance2.visit(row[kParent].children[idx], row[kRowIndex]);
      Reflect.set(row, key, val);
      return val;
    }
  }
  set(row, key, val) {
    const idx = row[kParent].type.children.findIndex((f) => f.name === key);
    if (idx !== -1) {
      instance.visit(row[kParent].children[idx], row[kRowIndex], val);
      return Reflect.set(row, key, val);
    } else if (Reflect.has(row, key) || typeof key === "symbol") {
      return Reflect.set(row, key, val);
    }
    return false;
  }
};
var structRowProxyHandler = new StructRowProxyHandler();

// src/visitor/get.ts
var GetVisitor = class extends Visitor {
};
function wrapGet(fn) {
  return (data, _1) => data.getValid(_1) ? fn(data, _1) : null;
}
var epochDaysToMs = (data, index) => 864e5 * data[index];
var BINARY_VIEW_SIZE = 16;
var BINARY_VIEW_INLINE_CAPACITY = 12;
var getNull = (_data, _index) => null;
var getVariableWidthBytes = (values, valueOffsets, index) => {
  if (index + 1 >= valueOffsets.length) {
    return null;
  }
  const x = bigIntToNumber(valueOffsets[index]);
  const y = bigIntToNumber(valueOffsets[index + 1]);
  return values.subarray(x, y);
};
var getBool = ({ offset, values }, index) => {
  const idx = offset + index;
  const byte = values[idx >> 3];
  return (byte & 1 << idx % 8) !== 0;
};
var getDateDay = ({ values }, index) => epochDaysToMs(values, index);
var getDateMillisecond = ({ values }, index) => bigIntToNumber(values[index]);
var getNumeric = ({ stride, values }, index) => values[stride * index];
var getFloat16 = ({ stride, values }, index) => uint16ToFloat64(values[stride * index]);
var getBigInts = ({ values }, index) => values[index];
var getFixedSizeBinary = ({ stride, values }, index) => values.subarray(stride * index, stride * (index + 1));
var getBinary = ({ values, valueOffsets }, index) => getVariableWidthBytes(values, valueOffsets, index);
var getBinaryViewBytes = (data, index) => {
  const values = data.values;
  if (!values) {
    throw new Error("BinaryView data is missing view buffer");
  }
  const viewOffset = index * BINARY_VIEW_SIZE;
  const end = viewOffset + BINARY_VIEW_SIZE;
  if (viewOffset < 0 || end > values.length) {
    throw new Error(`BinaryView data buffer is too short: expected ${BINARY_VIEW_SIZE} bytes, got ${Math.max(0, values.length - viewOffset)}`);
  }
  const viewStruct = values.subarray(viewOffset, end);
  if (viewStruct.length < BINARY_VIEW_SIZE) {
    throw new Error(`BinaryView data buffer is too short: expected ${BINARY_VIEW_SIZE} bytes, got ${viewStruct.length}`);
  }
  const view = new DataView(values.buffer, viewStruct.byteOffset, BINARY_VIEW_SIZE);
  const size = view.getInt32(0, true);
  if (size <= 0) {
    return new Uint8Array(0);
  }
  if (size <= BINARY_VIEW_INLINE_CAPACITY) {
    return viewStruct.subarray(4, 4 + size);
  }
  const bufferIndex = view.getInt32(8, true);
  const offset = view.getInt32(12, true);
  const variadicBuffer = data.variadicBuffers?.[bufferIndex];
  if (!variadicBuffer) {
    throw new Error(`BinaryView variadic buffer ${bufferIndex} is missing`);
  }
  return variadicBuffer.subarray(offset, offset + size);
};
var getBinaryViewValue = (data, index) => {
  return getBinaryViewBytes(data, index);
};
var getUtf8 = ({ values, valueOffsets }, index) => {
  const bytes = getVariableWidthBytes(values, valueOffsets, index);
  return bytes !== null ? decodeUtf8(bytes) : null;
};
var getUtf8ViewValue = (data, index) => {
  const bytes = getBinaryViewBytes(data, index);
  return decodeUtf8(bytes);
};
var getInt = ({ values }, index) => values[index];
var getFloat = ({ type, values }, index) => type.precision !== 0 /* HALF */ ? values[index] : uint16ToFloat64(values[index]);
var getDate = (data, index) => data.type.unit === 0 /* DAY */ ? getDateDay(data, index) : getDateMillisecond(data, index);
var getTimestampSecond = ({ values }, index) => 1e3 * bigIntToNumber(values[index]);
var getTimestampMillisecond = ({ values }, index) => bigIntToNumber(values[index]);
var getTimestampMicrosecond = ({ values }, index) => divideBigInts(values[index], BigInt(1e3));
var getTimestampNanosecond = ({ values }, index) => divideBigInts(values[index], BigInt(1e6));
var getTimestamp = (data, index) => {
  switch (data.type.unit) {
    case 0 /* SECOND */:
      return getTimestampSecond(data, index);
    case 1 /* MILLISECOND */:
      return getTimestampMillisecond(data, index);
    case 2 /* MICROSECOND */:
      return getTimestampMicrosecond(data, index);
    case 3 /* NANOSECOND */:
      return getTimestampNanosecond(data, index);
  }
};
var getTimeSecond = ({ values }, index) => values[index];
var getTimeMillisecond = ({ values }, index) => values[index];
var getTimeMicrosecond = ({ values }, index) => values[index];
var getTimeNanosecond = ({ values }, index) => values[index];
var getTime = (data, index) => {
  switch (data.type.unit) {
    case 0 /* SECOND */:
      return getTimeSecond(data, index);
    case 1 /* MILLISECOND */:
      return getTimeMillisecond(data, index);
    case 2 /* MICROSECOND */:
      return getTimeMicrosecond(data, index);
    case 3 /* NANOSECOND */:
      return getTimeNanosecond(data, index);
  }
};
var getDecimal = ({ values, stride }, index) => BN.decimal(values.subarray(stride * index, stride * (index + 1)));
var getList = (data, index) => {
  const { valueOffsets, stride, children } = data;
  const begin = bigIntToNumber(valueOffsets[index * stride]);
  const end = bigIntToNumber(valueOffsets[index * stride + 1]);
  const child = children[0];
  const slice = child.slice(begin, end - begin);
  return new Vector([slice]);
};
var getMap = (data, index) => {
  const { valueOffsets, children } = data;
  const { [index]: begin, [index + 1]: end } = valueOffsets;
  const child = children[0];
  return new MapRow(child.slice(begin, end - begin));
};
var getStruct = (data, index) => {
  return new StructRow(data, index);
};
var getUnion = (data, index) => {
  return data.type.mode === 1 /* Dense */ ? getDenseUnion(data, index) : getSparseUnion(data, index);
};
var getDenseUnion = (data, index) => {
  const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
  const child = data.children[childIndex];
  return instance2.visit(child, data.valueOffsets[index]);
};
var getSparseUnion = (data, index) => {
  const childIndex = data.type.typeIdToChildIndex[data.typeIds[index]];
  const child = data.children[childIndex];
  return instance2.visit(child, index);
};
var getDictionary = (data, index) => {
  return data.dictionary?.get(data.values[index]);
};
var getInterval = (data, index) => data.type.unit === 2 /* MONTH_DAY_NANO */ ? getIntervalMonthDayNano(data, index) : data.type.unit === 1 /* DAY_TIME */ ? getIntervalDayTime(data, index) : getIntervalYearMonth(data, index);
var getIntervalDayTime = ({ values }, index) => values.subarray(2 * index, 2 * (index + 1));
var getIntervalYearMonth = ({ values }, index) => {
  const interval = values[index];
  const int32s = new Int32Array(2);
  int32s[0] = Math.trunc(interval / 12);
  int32s[1] = Math.trunc(interval % 12);
  return int32s;
};
var getIntervalMonthDayNano = ({ values }, index) => values.subarray(4 * index, 4 * (index + 1));
var getDurationSecond = ({ values }, index) => values[index];
var getDurationMillisecond = ({ values }, index) => values[index];
var getDurationMicrosecond = ({ values }, index) => values[index];
var getDurationNanosecond = ({ values }, index) => values[index];
var getDuration = (data, index) => {
  switch (data.type.unit) {
    case 0 /* SECOND */:
      return getDurationSecond(data, index);
    case 1 /* MILLISECOND */:
      return getDurationMillisecond(data, index);
    case 2 /* MICROSECOND */:
      return getDurationMicrosecond(data, index);
    case 3 /* NANOSECOND */:
      return getDurationNanosecond(data, index);
  }
};
var getFixedSizeList = (data, index) => {
  const { stride, children } = data;
  const child = children[0];
  const slice = child.slice(index * stride, stride);
  return new Vector([slice]);
};
GetVisitor.prototype.visitNull = wrapGet(getNull);
GetVisitor.prototype.visitBool = wrapGet(getBool);
GetVisitor.prototype.visitInt = wrapGet(getInt);
GetVisitor.prototype.visitInt8 = wrapGet(getNumeric);
GetVisitor.prototype.visitInt16 = wrapGet(getNumeric);
GetVisitor.prototype.visitInt32 = wrapGet(getNumeric);
GetVisitor.prototype.visitInt64 = wrapGet(getBigInts);
GetVisitor.prototype.visitUint8 = wrapGet(getNumeric);
GetVisitor.prototype.visitUint16 = wrapGet(getNumeric);
GetVisitor.prototype.visitUint32 = wrapGet(getNumeric);
GetVisitor.prototype.visitUint64 = wrapGet(getBigInts);
GetVisitor.prototype.visitFloat = wrapGet(getFloat);
GetVisitor.prototype.visitFloat16 = wrapGet(getFloat16);
GetVisitor.prototype.visitFloat32 = wrapGet(getNumeric);
GetVisitor.prototype.visitFloat64 = wrapGet(getNumeric);
GetVisitor.prototype.visitUtf8 = wrapGet(getUtf8);
GetVisitor.prototype.visitLargeUtf8 = wrapGet(getUtf8);
GetVisitor.prototype.visitUtf8View = wrapGet(getUtf8ViewValue);
GetVisitor.prototype.visitBinary = wrapGet(getBinary);
GetVisitor.prototype.visitLargeBinary = wrapGet(getBinary);
GetVisitor.prototype.visitBinaryView = wrapGet(getBinaryViewValue);
GetVisitor.prototype.visitFixedSizeBinary = wrapGet(getFixedSizeBinary);
GetVisitor.prototype.visitDate = wrapGet(getDate);
GetVisitor.prototype.visitDateDay = wrapGet(getDateDay);
GetVisitor.prototype.visitDateMillisecond = wrapGet(getDateMillisecond);
GetVisitor.prototype.visitTimestamp = wrapGet(getTimestamp);
GetVisitor.prototype.visitTimestampSecond = wrapGet(getTimestampSecond);
GetVisitor.prototype.visitTimestampMillisecond = wrapGet(getTimestampMillisecond);
GetVisitor.prototype.visitTimestampMicrosecond = wrapGet(getTimestampMicrosecond);
GetVisitor.prototype.visitTimestampNanosecond = wrapGet(getTimestampNanosecond);
GetVisitor.prototype.visitTime = wrapGet(getTime);
GetVisitor.prototype.visitTimeSecond = wrapGet(getTimeSecond);
GetVisitor.prototype.visitTimeMillisecond = wrapGet(getTimeMillisecond);
GetVisitor.prototype.visitTimeMicrosecond = wrapGet(getTimeMicrosecond);
GetVisitor.prototype.visitTimeNanosecond = wrapGet(getTimeNanosecond);
GetVisitor.prototype.visitDecimal = wrapGet(getDecimal);
GetVisitor.prototype.visitList = wrapGet(getList);
GetVisitor.prototype.visitLargeList = wrapGet(getList);
GetVisitor.prototype.visitStruct = wrapGet(getStruct);
GetVisitor.prototype.visitUnion = wrapGet(getUnion);
GetVisitor.prototype.visitDenseUnion = wrapGet(getDenseUnion);
GetVisitor.prototype.visitSparseUnion = wrapGet(getSparseUnion);
GetVisitor.prototype.visitDictionary = wrapGet(getDictionary);
GetVisitor.prototype.visitInterval = wrapGet(getInterval);
GetVisitor.prototype.visitIntervalDayTime = wrapGet(getIntervalDayTime);
GetVisitor.prototype.visitIntervalYearMonth = wrapGet(getIntervalYearMonth);
GetVisitor.prototype.visitIntervalMonthDayNano = wrapGet(getIntervalMonthDayNano);
GetVisitor.prototype.visitDuration = wrapGet(getDuration);
GetVisitor.prototype.visitDurationSecond = wrapGet(getDurationSecond);
GetVisitor.prototype.visitDurationMillisecond = wrapGet(getDurationMillisecond);
GetVisitor.prototype.visitDurationMicrosecond = wrapGet(getDurationMicrosecond);
GetVisitor.prototype.visitDurationNanosecond = wrapGet(getDurationNanosecond);
GetVisitor.prototype.visitFixedSizeList = wrapGet(getFixedSizeList);
GetVisitor.prototype.visitMap = wrapGet(getMap);
var instance2 = new GetVisitor();

// src/row/map.ts
var kKeys = /* @__PURE__ */ Symbol.for("keys");
var kVals = /* @__PURE__ */ Symbol.for("vals");
var kKeysAsStrings = /* @__PURE__ */ Symbol.for("kKeysAsStrings");
var _kKeysAsStrings = /* @__PURE__ */ Symbol.for("_kKeysAsStrings");
var MapRow = class {
  constructor(slice) {
    this[kKeys] = new Vector([slice.children[0]]).memoize();
    this[kVals] = slice.children[1];
    return new Proxy(this, new MapRowProxyHandler());
  }
  /** @ignore */
  get [kKeysAsStrings]() {
    return this[_kKeysAsStrings] || (this[_kKeysAsStrings] = Array.from(this[kKeys].toArray(), String));
  }
  [Symbol.iterator]() {
    return new MapRowIterator(this[kKeys], this[kVals]);
  }
  get size() {
    return this[kKeys].length;
  }
  toArray() {
    return Object.values(this.toJSON());
  }
  toJSON() {
    const keys = this[kKeys];
    const vals = this[kVals];
    const json = {};
    for (let i = -1, n = keys.length; ++i < n; ) {
      json[keys.get(i)] = instance2.visit(vals, i);
    }
    return json;
  }
  toString() {
    return `{${[...this].map(
      ([key, val]) => `${valueToString(key)}: ${valueToString(val)}`
    ).join(", ")}}`;
  }
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toString();
  }
};
var MapRowIterator = class {
  keys;
  vals;
  numKeys;
  keyIndex;
  constructor(keys, vals) {
    this.keys = keys;
    this.vals = vals;
    this.keyIndex = 0;
    this.numKeys = keys.length;
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    const i = this.keyIndex;
    if (i === this.numKeys) {
      return { done: true, value: null };
    }
    this.keyIndex++;
    return {
      done: false,
      value: [
        this.keys.get(i),
        instance2.visit(this.vals, i)
      ]
    };
  }
};
var MapRowProxyHandler = class {
  isExtensible() {
    return false;
  }
  deleteProperty() {
    return false;
  }
  preventExtensions() {
    return true;
  }
  ownKeys(row) {
    return row[kKeysAsStrings];
  }
  has(row, key) {
    return row[kKeysAsStrings].includes(key);
  }
  getOwnPropertyDescriptor(row, key) {
    const idx = row[kKeysAsStrings].indexOf(key);
    if (idx !== -1) {
      return { writable: true, enumerable: true, configurable: true };
    }
    return;
  }
  get(row, key) {
    if (Reflect.has(row, key)) {
      return row[key];
    }
    const idx = row[kKeysAsStrings].indexOf(key);
    if (idx !== -1) {
      const val = instance2.visit(Reflect.get(row, kVals), idx);
      Reflect.set(row, key, val);
      return val;
    }
  }
  set(row, key, val) {
    const idx = row[kKeysAsStrings].indexOf(key);
    if (idx !== -1) {
      instance.visit(Reflect.get(row, kVals), idx, val);
      return Reflect.set(row, key, val);
    } else if (Reflect.has(row, key)) {
      return Reflect.set(row, key, val);
    }
    return false;
  }
};
Object.defineProperties(MapRow.prototype, {
  [Symbol.toStringTag]: { enumerable: false, configurable: false, value: "Row" },
  [kKeys]: { writable: true, enumerable: false, configurable: false, value: null },
  [kVals]: { writable: true, enumerable: false, configurable: false, value: null },
  [_kKeysAsStrings]: { writable: true, enumerable: false, configurable: false, value: null }
});

// src/util/vector.ts
var tmp;
function clampRange(source, begin, end, then) {
  const { length: len = 0 } = source;
  let lhs = typeof begin !== "number" ? 0 : begin;
  let rhs = typeof end !== "number" ? len : end;
  lhs < 0 && (lhs = (lhs % len + len) % len);
  rhs < 0 && (rhs = (rhs % len + len) % len);
  rhs < lhs && (tmp = lhs, lhs = rhs, rhs = tmp);
  rhs > len && (rhs = len);
  return then ? then(source, lhs, rhs) : [lhs, rhs];
}
var wrapIndex = (index, len) => index < 0 ? len + index : index;
var isNaNFast = (value) => value !== value;
function createElementComparator(search) {
  const typeofSearch = typeof search;
  if (typeofSearch !== "object" || search === null) {
    if (isNaNFast(search)) {
      return isNaNFast;
    }
    return (value) => value === search;
  }
  if (search instanceof Date) {
    const valueOfSearch = search.valueOf();
    return (value) => value instanceof Date ? value.valueOf() === valueOfSearch : false;
  }
  if (ArrayBuffer.isView(search)) {
    return (value) => value ? compareArrayLike(search, value) : false;
  }
  if (search instanceof Map) {
    return createMapComparator(search);
  }
  if (Array.isArray(search)) {
    return createArrayLikeComparator(search);
  }
  if (search instanceof Vector) {
    return createVectorComparator(search);
  }
  return createObjectComparator(search, true);
}
function createArrayLikeComparator(lhs) {
  const comparators = [];
  for (let i = -1, n = lhs.length; ++i < n; ) {
    comparators[i] = createElementComparator(lhs[i]);
  }
  return createSubElementsComparator(comparators);
}
function createMapComparator(lhs) {
  let i = -1;
  const comparators = [];
  for (const v of lhs.values()) comparators[++i] = createElementComparator(v);
  return createSubElementsComparator(comparators);
}
function createVectorComparator(lhs) {
  const comparators = [];
  for (let i = -1, n = lhs.length; ++i < n; ) {
    comparators[i] = createElementComparator(lhs.get(i));
  }
  return createSubElementsComparator(comparators);
}
function createObjectComparator(lhs, allowEmpty = false) {
  const keys = Object.keys(lhs);
  if (!allowEmpty && keys.length === 0) {
    return () => false;
  }
  const comparators = [];
  for (let i = -1, n = keys.length; ++i < n; ) {
    comparators[i] = createElementComparator(lhs[keys[i]]);
  }
  return createSubElementsComparator(comparators, keys);
}
function createSubElementsComparator(comparators, keys) {
  return (rhs) => {
    if (!rhs || typeof rhs !== "object") {
      return false;
    }
    switch (rhs.constructor) {
      case Array:
        return compareArray(comparators, rhs);
      case Map:
        return compareObject(comparators, rhs, rhs.keys());
      case MapRow:
      case StructRow:
      case Object:
      case void 0:
        return compareObject(comparators, rhs, keys || Object.keys(rhs));
    }
    return rhs instanceof Vector ? compareVector(comparators, rhs) : false;
  };
}
function compareArray(comparators, arr) {
  const n = comparators.length;
  if (arr.length !== n) {
    return false;
  }
  for (let i = -1; ++i < n; ) {
    if (!comparators[i](arr[i])) {
      return false;
    }
  }
  return true;
}
function compareVector(comparators, vec) {
  const n = comparators.length;
  if (vec.length !== n) {
    return false;
  }
  for (let i = -1; ++i < n; ) {
    if (!comparators[i](vec.get(i))) {
      return false;
    }
  }
  return true;
}
function compareObject(comparators, obj, keys) {
  const lKeyItr = keys[Symbol.iterator]();
  const rKeyItr = obj instanceof Map ? obj.keys() : Object.keys(obj)[Symbol.iterator]();
  const rValItr = obj instanceof Map ? obj.values() : Object.values(obj)[Symbol.iterator]();
  let i = 0;
  const n = comparators.length;
  let rVal = rValItr.next();
  let lKey = lKeyItr.next();
  let rKey = rKeyItr.next();
  for (; i < n && !lKey.done && !rKey.done && !rVal.done; ++i, lKey = lKeyItr.next(), rKey = rKeyItr.next(), rVal = rValItr.next()) {
    if (lKey.value !== rKey.value || !comparators[i](rVal.value)) {
      break;
    }
  }
  if (i === n && lKey.done && rKey.done && rVal.done) {
    return true;
  }
  lKeyItr.return && lKeyItr.return();
  rKeyItr.return && rKeyItr.return();
  rValItr.return && rValItr.return();
  return false;
}

// src/util/bit.ts
var bit_exports = {};
__export(bit_exports, {
  BitIterator: () => BitIterator,
  getBit: () => getBit,
  getBool: () => getBool2,
  packBools: () => packBools,
  popcnt_array: () => popcnt_array,
  popcnt_bit_range: () => popcnt_bit_range,
  popcnt_uint32: () => popcnt_uint32,
  setBool: () => setBool2,
  truncateBitmap: () => truncateBitmap
});
function getBool2(_data, _index, byte, bit) {
  return (byte & 1 << bit) !== 0;
}
function getBit(_data, _index, byte, bit) {
  return (byte & 1 << bit) >> bit;
}
function setBool2(bytes, index, value) {
  return value ? !!(bytes[index >> 3] |= 1 << index % 8) || true : !(bytes[index >> 3] &= ~(1 << index % 8)) && false;
}
function truncateBitmap(offset, length, bitmap) {
  const alignedSize = bitmap.byteLength + 7 & ~7;
  if (offset > 0 || bitmap.byteLength < alignedSize) {
    const bytes = new Uint8Array(alignedSize);
    bytes.set(offset % 8 === 0 ? bitmap.subarray(offset >> 3) : (
      // Otherwise iterate each bit from the offset and return a new one
      packBools(new BitIterator(bitmap, offset, length, null, getBool2)).subarray(0, alignedSize)
    ));
    return bytes;
  }
  return bitmap;
}
function packBools(values) {
  const xs = [];
  let i = 0, bit = 0, byte = 0;
  for (const value of values) {
    value && (byte |= 1 << bit);
    if (++bit === 8) {
      xs[i++] = byte;
      byte = bit = 0;
    }
  }
  if (i === 0 || bit > 0) {
    xs[i++] = byte;
  }
  const b = new Uint8Array(xs.length + 7 & ~7);
  b.set(xs);
  return b;
}
var BitIterator = class {
  constructor(bytes, begin, length, context, get) {
    this.bytes = bytes;
    this.length = length;
    this.context = context;
    this.get = get;
    this.bit = begin % 8;
    this.byteIndex = begin >> 3;
    this.byte = bytes[this.byteIndex++];
    this.index = 0;
  }
  bit;
  byte;
  byteIndex;
  index;
  next() {
    if (this.index < this.length) {
      if (this.bit === 8) {
        this.bit = 0;
        this.byte = this.bytes[this.byteIndex++];
      }
      return {
        value: this.get(this.context, this.index++, this.byte, this.bit++)
      };
    }
    return { done: true, value: null };
  }
  [Symbol.iterator]() {
    return this;
  }
};
function popcnt_bit_range(data, lhs, rhs) {
  if (rhs - lhs <= 0) {
    return 0;
  }
  if (rhs - lhs < 8) {
    let sum = 0;
    for (const bit of new BitIterator(data, lhs, rhs - lhs, data, getBit)) {
      sum += bit;
    }
    return sum;
  }
  const rhsInside = rhs >> 3 << 3;
  const lhsInside = lhs + (lhs % 8 === 0 ? 0 : 8 - lhs % 8);
  return (
    // Get the popcnt of bits between the left hand side, and the next highest multiple of 8
    popcnt_bit_range(data, lhs, lhsInside) + // Get the popcnt of bits between the right hand side, and the next lowest multiple of 8
    popcnt_bit_range(data, rhsInside, rhs) + // Get the popcnt of all bits between the left and right hand sides' multiples of 8
    popcnt_array(data, lhsInside >> 3, rhsInside - lhsInside >> 3)
  );
}
function popcnt_array(arr, byteOffset, byteLength) {
  let cnt = 0, pos = Math.trunc(byteOffset);
  const view = new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  const len = byteLength === void 0 ? arr.byteLength : pos + byteLength;
  while (len - pos >= 4) {
    cnt += popcnt_uint32(view.getUint32(pos));
    pos += 4;
  }
  while (len - pos >= 2) {
    cnt += popcnt_uint32(view.getUint16(pos));
    pos += 2;
  }
  while (len - pos >= 1) {
    cnt += popcnt_uint32(view.getUint8(pos));
    pos += 1;
  }
  return cnt;
}
function popcnt_uint32(uint32) {
  let i = Math.trunc(uint32);
  i = i - (i >>> 1 & 1431655765);
  i = (i & 858993459) + (i >>> 2 & 858993459);
  return (i + (i >>> 4) & 252645135) * 16843009 >>> 24;
}

// src/data.ts
var kUnknownNullCount = -1;
var kDataSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/Data");
var Data = class _Data {
  /**
   * Check if an object is an instance of Data.
   * This works across different instances of the Arrow library.
   */
  /** @nocollapse */
  static isData(x) {
    return x?.[kDataSymbol] === true;
  }
  get typeId() {
    return this.type.typeId;
  }
  get ArrayType() {
    return this.type.ArrayType;
  }
  get buffers() {
    return [this.valueOffsets, this.values, this.nullBitmap, this.typeIds];
  }
  get nullable() {
    if (this._nullCount !== 0) {
      const { type } = this;
      if (DataType.isSparseUnion(type)) {
        return this.children.some((child) => child.nullable);
      } else if (DataType.isDenseUnion(type)) {
        return this.children.some((child) => child.nullable);
      }
      return this.nullBitmap && this.nullBitmap.byteLength > 0;
    }
    return true;
  }
  get byteLength() {
    let byteLength = 0;
    const { valueOffsets, values, nullBitmap, typeIds } = this;
    valueOffsets && (byteLength += valueOffsets.byteLength);
    values && (byteLength += values.byteLength);
    nullBitmap && (byteLength += nullBitmap.byteLength);
    typeIds && (byteLength += typeIds.byteLength);
    byteLength += this.variadicBuffers.reduce((size, data) => size + (data?.byteLength ?? 0), 0);
    return this.children.reduce((byteLength2, child) => byteLength2 + child.byteLength, byteLength);
  }
  _nullCount;
  get nullCount() {
    if (DataType.isUnion(this.type)) {
      return this.children.reduce((nullCount2, child) => nullCount2 + child.nullCount, 0);
    }
    let nullCount = this._nullCount;
    let nullBitmap;
    if (nullCount <= kUnknownNullCount && (nullBitmap = this.nullBitmap)) {
      this._nullCount = nullCount = nullBitmap.length === 0 ? (
        // no null bitmap, so all values are valid
        0
      ) : this.length - popcnt_bit_range(nullBitmap, this.offset, this.offset + this.length);
    }
    return nullCount;
  }
  constructor(type, offset, length, nullCount, buffers, children = [], dictionary, variadicBuffers = []) {
    this.type = type;
    this.children = children;
    this.dictionary = dictionary;
    this.offset = Math.floor(Math.max(offset || 0, 0));
    this.length = Math.floor(Math.max(length || 0, 0));
    this._nullCount = Math.floor(Math.max(nullCount || 0, -1));
    let buffer;
    if (buffers instanceof _Data) {
      this.stride = buffers.stride;
      this.values = buffers.values;
      this.typeIds = buffers.typeIds;
      this.nullBitmap = buffers.nullBitmap;
      this.valueOffsets = buffers.valueOffsets;
      this.variadicBuffers = buffers.variadicBuffers;
    } else {
      this.stride = strideForType(type);
      if (buffers) {
        (buffer = buffers[0]) && (this.valueOffsets = buffer);
        (buffer = buffers[1]) && (this.values = buffer);
        (buffer = buffers[2]) && (this.nullBitmap = buffer);
        (buffer = buffers[3]) && (this.typeIds = buffer);
      }
      this.variadicBuffers = variadicBuffers;
    }
    this.variadicBuffers ??= [];
  }
  getValid(index) {
    const { type } = this;
    if (DataType.isUnion(type)) {
      const union = type;
      const typeId = this.typeIds[index];
      const childIndex = union.typeIdToChildIndex[typeId];
      const child = this.children[childIndex];
      const valueOffsets = this.valueOffsets;
      const indexInChild = union.mode === 1 /* Dense */ && valueOffsets ? Number(valueOffsets[index]) : index;
      return child.getValid(indexInChild);
    }
    if (this.nullable && this.nullCount > 0) {
      const pos = this.offset + index;
      const val = this.nullBitmap[pos >> 3];
      return (val & 1 << pos % 8) !== 0;
    }
    return true;
  }
  setValid(index, value) {
    let prev;
    const { type } = this;
    if (DataType.isUnion(type)) {
      const union = type;
      const typeId = this.typeIds[index];
      const childIndex = union.typeIdToChildIndex[typeId];
      const child = this.children[childIndex];
      const valueOffsets = this.valueOffsets;
      const indexInChild = union.mode === 1 /* Dense */ && valueOffsets ? Number(valueOffsets[index]) : index;
      prev = child.getValid(indexInChild);
      child.setValid(indexInChild, value);
    } else {
      let { nullBitmap } = this;
      const { offset, length } = this;
      const idx = offset + index;
      const mask = 1 << idx % 8;
      const byteOffset = idx >> 3;
      if (!nullBitmap || nullBitmap.byteLength <= byteOffset) {
        nullBitmap = new Uint8Array((offset + length + 63 & ~63) >> 3).fill(255);
        if (this.nullCount > 0) {
          nullBitmap.set(truncateBitmap(offset, length, this.nullBitmap), 0);
          Object.assign(this, { nullBitmap });
        } else {
          Object.assign(this, { nullBitmap, _nullCount: 0 });
        }
      }
      const byte = nullBitmap[byteOffset];
      prev = (byte & mask) !== 0;
      nullBitmap[byteOffset] = value ? byte | mask : byte & ~mask;
    }
    if (prev !== !!value) {
      this._nullCount = this.nullCount + (value ? -1 : 1);
    }
    return value;
  }
  clone(type = this.type, offset = this.offset, length = this.length, nullCount = this._nullCount, buffers = this, children = this.children, variadicBuffers = this.variadicBuffers) {
    return new _Data(type, offset, length, nullCount, buffers, children, this.dictionary, variadicBuffers);
  }
  slice(offset, length) {
    const { stride, typeId, children } = this;
    const nullCount = +(this._nullCount === 0) - 1;
    const childStride = typeId === 16 ? stride : 1;
    const buffers = this._sliceBuffers(offset, length, stride, typeId);
    return this.clone(
      this.type,
      this.offset + offset,
      length,
      nullCount,
      buffers,
      // Don't slice children if we have value offsets (the variable-width types)
      children.length === 0 || this.valueOffsets ? children : this._sliceChildren(children, childStride * offset, childStride * length),
      this.variadicBuffers
    );
  }
  _changeLengthAndBackfillNullBitmap(newLength) {
    if (this.typeId === 1 /* Null */) {
      return this.clone(this.type, 0, newLength, 0, this.buffers, this.children, this.variadicBuffers);
    }
    const { length, nullCount } = this;
    const bitmap = new Uint8Array((newLength + 63 & ~63) >> 3).fill(255, 0, length >> 3);
    bitmap[length >> 3] = (1 << length - (length & ~7)) - 1;
    if (nullCount > 0) {
      bitmap.set(truncateBitmap(this.offset, length, this.nullBitmap), 0);
    }
    const buffers = this.buffers;
    buffers[2 /* VALIDITY */] = bitmap;
    return this.clone(this.type, 0, newLength, nullCount + (newLength - length), buffers, this.children, this.variadicBuffers);
  }
  _sliceBuffers(offset, length, stride, typeId) {
    let arr;
    const { buffers } = this;
    (arr = buffers[3 /* TYPE */]) && (buffers[3 /* TYPE */] = arr.subarray(offset, offset + length));
    if (DataType.isBinaryView(this.type) || DataType.isUtf8View(this.type)) {
      const width = BinaryView2.ELEMENT_WIDTH;
      (arr = buffers[1 /* DATA */]) && (buffers[1 /* DATA */] = arr.subarray(offset * width, (offset + length) * width));
    } else {
      (arr = buffers[0 /* OFFSET */]) && (buffers[0 /* OFFSET */] = arr.subarray(offset, offset + length + 1)) || // Otherwise if no offsets, slice the data buffer. Don't slice the data vector for Booleans, since the offset goes by bits not bytes
      (arr = buffers[1 /* DATA */]) && (buffers[1 /* DATA */] = typeId === 6 ? arr : arr.subarray(stride * offset, stride * (offset + length)));
    }
    return buffers;
  }
  _sliceChildren(children, offset, length) {
    return children.map((child) => child.slice(offset, length));
  }
};
Data.prototype.children = Object.freeze([]);
Data.prototype[kDataSymbol] = true;
Object.defineProperty(Data, Symbol.hasInstance, {
  value: function isDataInstance(instance8) {
    return Function.prototype[Symbol.hasInstance].call(this, instance8) || this === Data && Data.isData(instance8);
  }
});
var MakeDataVisitor = class _MakeDataVisitor extends Visitor {
  visit(props) {
    return this.getVisitFn(props["type"]).call(this, props);
  }
  visitNull(props) {
    const {
      ["type"]: type,
      ["offset"]: offset = 0,
      ["length"]: length = 0
    } = props;
    return new Data(type, offset, length, length);
  }
  visitBool(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length >> 3, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitInt(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitFloat(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitUtf8(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const data = toUint8Array(props["data"]);
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toInt32Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
  }
  visitUtf8View(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const views = toArrayBufferView(type.ArrayType, props["views"]);
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const variadicBuffers = (props["variadicBuffers"] || []).map((buffer) => toUint8Array(buffer));
    const length = props["length"] ?? Math.trunc(views.length / Utf8View2.ELEMENT_WIDTH);
    const nullCount = props["nullBitmap"] ? -1 : 0;
    return new Data(type, offset, length, nullCount, [void 0, views, nullBitmap], [], void 0, variadicBuffers);
  }
  visitLargeUtf8(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const data = toUint8Array(props["data"]);
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toBigInt64Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
  }
  visitBinary(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const data = toUint8Array(props["data"]);
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toInt32Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
  }
  visitBinaryView(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const views = toArrayBufferView(type.ArrayType, props["views"]);
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const variadicBuffers = (props["variadicBuffers"] || []).map((buffer) => toUint8Array(buffer));
    const length = props["length"] ?? Math.trunc(views.length / BinaryView2.ELEMENT_WIDTH);
    const nullCount = props["nullBitmap"] ? -1 : 0;
    return new Data(type, offset, length, nullCount, [void 0, views, nullBitmap], [], void 0, variadicBuffers);
  }
  visitLargeBinary(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const data = toUint8Array(props["data"]);
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toBigInt64Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, data, nullBitmap]);
  }
  visitFixedSizeBinary(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitDate(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitTimestamp(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitTime(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitDecimal(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitList(props) {
    const { ["type"]: type, ["offset"]: offset = 0, ["child"]: child } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toInt32Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, void 0, nullBitmap], [child]);
  }
  visitLargeList(props) {
    const { ["type"]: type, ["offset"]: offset = 0, ["child"]: child } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toBigInt64Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, void 0, nullBitmap], [child]);
  }
  visitStruct(props) {
    const { ["type"]: type, ["offset"]: offset = 0, ["children"]: children = [] } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const {
      length = children.reduce((len, { length: length2 }) => Math.max(len, length2), 0),
      nullCount = props["nullBitmap"] ? -1 : 0
    } = props;
    return new Data(type, offset, length, nullCount, [void 0, void 0, nullBitmap], children);
  }
  visitUnion(props) {
    const { ["type"]: type, ["offset"]: offset = 0, ["children"]: children = [] } = props;
    const typeIds = toArrayBufferView(type.ArrayType, props["typeIds"]);
    const { ["length"]: length = typeIds.length, ["nullCount"]: nullCount = -1 } = props;
    if (DataType.isSparseUnion(type)) {
      return new Data(type, offset, length, nullCount, [void 0, void 0, void 0, typeIds], children);
    }
    const valueOffsets = toInt32Array(props["valueOffsets"]);
    return new Data(type, offset, length, nullCount, [valueOffsets, void 0, void 0, typeIds], children);
  }
  visitDictionary(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.indices.ArrayType, props["data"]);
    const { ["dictionary"]: dictionary = new Vector([new _MakeDataVisitor().visit({ type: type.dictionary })]) } = props;
    const { ["length"]: length = data.length, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap], [], dictionary);
  }
  visitInterval(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitDuration(props) {
    const { ["type"]: type, ["offset"]: offset = 0 } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const data = toArrayBufferView(type.ArrayType, props["data"]);
    const { ["length"]: length = data.length, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, data, nullBitmap]);
  }
  visitFixedSizeList(props) {
    const { ["type"]: type, ["offset"]: offset = 0, ["child"]: child = new _MakeDataVisitor().visit({ type: type.valueType }) } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const { ["length"]: length = child.length / strideForType(type), ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [void 0, void 0, nullBitmap], [child]);
  }
  visitMap(props) {
    const { ["type"]: type, ["offset"]: offset = 0, ["child"]: child = new _MakeDataVisitor().visit({ type: type.childType }) } = props;
    const nullBitmap = toUint8Array(props["nullBitmap"]);
    const valueOffsets = toInt32Array(props["valueOffsets"]);
    const { ["length"]: length = valueOffsets.length - 1, ["nullCount"]: nullCount = props["nullBitmap"] ? -1 : 0 } = props;
    return new Data(type, offset, length, nullCount, [valueOffsets, void 0, nullBitmap], [child]);
  }
};
var makeDataVisitor = new MakeDataVisitor();
function makeData(props) {
  return makeDataVisitor.visit(props);
}

// src/util/chunk.ts
var ChunkedIterator = class {
  constructor(numChunks = 0, getChunkIterator) {
    this.numChunks = numChunks;
    this.getChunkIterator = getChunkIterator;
    this.chunkIterator = this.getChunkIterator(0);
  }
  chunkIndex = 0;
  chunkIterator;
  next() {
    while (this.chunkIndex < this.numChunks) {
      const next = this.chunkIterator.next();
      if (!next.done) {
        return next;
      }
      if (++this.chunkIndex < this.numChunks) {
        this.chunkIterator = this.getChunkIterator(this.chunkIndex);
      }
    }
    return { done: true, value: null };
  }
  [Symbol.iterator]() {
    return this;
  }
};
function computeChunkNullable(chunks) {
  return chunks.some((chunk) => chunk.nullable);
}
function computeChunkNullCounts(chunks) {
  return chunks.reduce((nullCount, chunk) => nullCount + chunk.nullCount, 0);
}
function computeChunkOffsets(chunks) {
  return chunks.reduce((offsets, chunk, index) => {
    offsets[index + 1] = offsets[index] + chunk.length;
    return offsets;
  }, new Uint32Array(chunks.length + 1));
}
function sliceChunks(chunks, offsets, begin, end) {
  const slices = [];
  for (let i = -1, n = chunks.length; ++i < n; ) {
    const chunk = chunks[i];
    const offset = offsets[i];
    const { length } = chunk;
    if (offset >= end) {
      break;
    }
    if (begin >= offset + length) {
      continue;
    }
    if (offset >= begin && offset + length <= end) {
      slices.push(chunk);
      continue;
    }
    const from = Math.max(0, begin - offset);
    const to = Math.min(end - offset, length);
    slices.push(chunk.slice(from, to - from));
  }
  if (slices.length === 0) {
    slices.push(chunks[0].slice(0, 0));
  }
  return slices;
}
function binarySearch(chunks, offsets, idx, fn) {
  let lhs = 0, mid = 0, rhs = offsets.length - 1;
  do {
    if (lhs >= rhs - 1) {
      return idx < offsets[rhs] ? fn(chunks, lhs, idx - offsets[lhs]) : null;
    }
    mid = lhs + Math.trunc((rhs - lhs) * 0.5);
    idx < offsets[mid] ? rhs = mid : lhs = mid;
  } while (lhs < rhs);
}
function isChunkedValid(data, index) {
  return data.getValid(index);
}
function wrapChunkedCall1(fn) {
  function chunkedFn(chunks, i, j) {
    return fn(chunks[i], j);
  }
  return function(index) {
    const data = this.data;
    return binarySearch(data, this._offsets, index, chunkedFn);
  };
}
function wrapChunkedCall2(fn) {
  let _2;
  function chunkedFn(chunks, i, j) {
    return fn(chunks[i], j, _2);
  }
  return function(index, value) {
    const data = this.data;
    _2 = value;
    const result = binarySearch(data, this._offsets, index, chunkedFn);
    _2 = void 0;
    return result;
  };
}
function wrapChunkedIndexOf(indexOf) {
  let _1;
  function chunkedIndexOf(data, chunkIndex, fromIndex) {
    let begin = fromIndex, index = 0, total = 0;
    for (let i = chunkIndex - 1, n = data.length; ++i < n; ) {
      const chunk = data[i];
      if (~(index = indexOf(chunk, _1, begin))) {
        return total + index;
      }
      begin = 0;
      total += chunk.length;
    }
    return -1;
  }
  return function(element, offset) {
    _1 = element;
    const data = this.data;
    const result = typeof offset !== "number" ? chunkedIndexOf(data, 0, 0) : binarySearch(data, this._offsets, offset, chunkedIndexOf);
    _1 = void 0;
    return result;
  };
}

// src/visitor/indexof.ts
var IndexOfVisitor = class extends Visitor {
};
function nullIndexOf(data, searchElement) {
  return searchElement === null && data.length > 0 ? 0 : -1;
}
function indexOfNull(data, fromIndex) {
  const { nullBitmap } = data;
  if (!nullBitmap || data.nullCount <= 0) {
    return -1;
  }
  let i = 0;
  for (const isValid of new BitIterator(nullBitmap, data.offset + (fromIndex || 0), data.length, nullBitmap, getBool2)) {
    if (!isValid) {
      return i;
    }
    ++i;
  }
  return -1;
}
function indexOfValue(data, searchElement, fromIndex) {
  if (searchElement === void 0) {
    return -1;
  }
  if (searchElement === null) {
    switch (data.typeId) {
      // Unions don't have a nullBitmap of its own, so compare the `searchElement` to `get()`.
      case 14 /* Union */:
        break;
      // Dictionaries do have a nullBitmap, but their dictionary could also have null elements.
      case -1 /* Dictionary */:
        break;
      // All other types can iterate the null bitmap
      default:
        return indexOfNull(data, fromIndex);
    }
  }
  const get = instance2.getVisitFn(data);
  const compare = createElementComparator(searchElement);
  for (let i = (fromIndex || 0) - 1, n = data.length; ++i < n; ) {
    if (compare(get(data, i))) {
      return i;
    }
  }
  return -1;
}
function indexOfUnion(data, searchElement, fromIndex) {
  const get = instance2.getVisitFn(data);
  const compare = createElementComparator(searchElement);
  for (let i = (fromIndex || 0) - 1, n = data.length; ++i < n; ) {
    if (compare(get(data, i))) {
      return i;
    }
  }
  return -1;
}
IndexOfVisitor.prototype.visitNull = nullIndexOf;
IndexOfVisitor.prototype.visitBool = indexOfValue;
IndexOfVisitor.prototype.visitInt = indexOfValue;
IndexOfVisitor.prototype.visitInt8 = indexOfValue;
IndexOfVisitor.prototype.visitInt16 = indexOfValue;
IndexOfVisitor.prototype.visitInt32 = indexOfValue;
IndexOfVisitor.prototype.visitInt64 = indexOfValue;
IndexOfVisitor.prototype.visitUint8 = indexOfValue;
IndexOfVisitor.prototype.visitUint16 = indexOfValue;
IndexOfVisitor.prototype.visitUint32 = indexOfValue;
IndexOfVisitor.prototype.visitUint64 = indexOfValue;
IndexOfVisitor.prototype.visitFloat = indexOfValue;
IndexOfVisitor.prototype.visitFloat16 = indexOfValue;
IndexOfVisitor.prototype.visitFloat32 = indexOfValue;
IndexOfVisitor.prototype.visitFloat64 = indexOfValue;
IndexOfVisitor.prototype.visitUtf8 = indexOfValue;
IndexOfVisitor.prototype.visitLargeUtf8 = indexOfValue;
IndexOfVisitor.prototype.visitUtf8View = indexOfValue;
IndexOfVisitor.prototype.visitBinary = indexOfValue;
IndexOfVisitor.prototype.visitLargeBinary = indexOfValue;
IndexOfVisitor.prototype.visitBinaryView = indexOfValue;
IndexOfVisitor.prototype.visitFixedSizeBinary = indexOfValue;
IndexOfVisitor.prototype.visitDate = indexOfValue;
IndexOfVisitor.prototype.visitDateDay = indexOfValue;
IndexOfVisitor.prototype.visitDateMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestamp = indexOfValue;
IndexOfVisitor.prototype.visitTimestampSecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestampMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestampMicrosecond = indexOfValue;
IndexOfVisitor.prototype.visitTimestampNanosecond = indexOfValue;
IndexOfVisitor.prototype.visitTime = indexOfValue;
IndexOfVisitor.prototype.visitTimeSecond = indexOfValue;
IndexOfVisitor.prototype.visitTimeMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitTimeMicrosecond = indexOfValue;
IndexOfVisitor.prototype.visitTimeNanosecond = indexOfValue;
IndexOfVisitor.prototype.visitDecimal = indexOfValue;
IndexOfVisitor.prototype.visitList = indexOfValue;
IndexOfVisitor.prototype.visitLargeList = indexOfValue;
IndexOfVisitor.prototype.visitStruct = indexOfValue;
IndexOfVisitor.prototype.visitUnion = indexOfValue;
IndexOfVisitor.prototype.visitDenseUnion = indexOfUnion;
IndexOfVisitor.prototype.visitSparseUnion = indexOfUnion;
IndexOfVisitor.prototype.visitDictionary = indexOfValue;
IndexOfVisitor.prototype.visitInterval = indexOfValue;
IndexOfVisitor.prototype.visitIntervalDayTime = indexOfValue;
IndexOfVisitor.prototype.visitIntervalYearMonth = indexOfValue;
IndexOfVisitor.prototype.visitIntervalMonthDayNano = indexOfValue;
IndexOfVisitor.prototype.visitDuration = indexOfValue;
IndexOfVisitor.prototype.visitDurationSecond = indexOfValue;
IndexOfVisitor.prototype.visitDurationMillisecond = indexOfValue;
IndexOfVisitor.prototype.visitDurationMicrosecond = indexOfValue;
IndexOfVisitor.prototype.visitDurationNanosecond = indexOfValue;
IndexOfVisitor.prototype.visitFixedSizeList = indexOfValue;
IndexOfVisitor.prototype.visitMap = indexOfValue;
var instance3 = new IndexOfVisitor();

// src/visitor/iterator.ts
var IteratorVisitor = class extends Visitor {
};
function vectorIterator(vector) {
  const { type } = vector;
  if (vector.nullCount === 0 && vector.stride === 1 && // Don't defer to native iterator for timestamps since Numbers are expected
  // (DataType.isTimestamp(type)) && type.unit === TimeUnit.MILLISECOND ||
  (DataType.isInt(type) && type.bitWidth !== 64 || DataType.isTime(type) && type.bitWidth !== 64 || DataType.isFloat(type) && type.precision !== 0 /* HALF */)) {
    return new ChunkedIterator(vector.data.length, (chunkIndex) => {
      const data = vector.data[chunkIndex];
      return data.values.subarray(0, data.length)[Symbol.iterator]();
    });
  }
  let offset = 0;
  return new ChunkedIterator(vector.data.length, (chunkIndex) => {
    const data = vector.data[chunkIndex];
    const length = data.length;
    const inner = vector.slice(offset, offset + length);
    offset += length;
    return new VectorIterator(inner);
  });
}
var VectorIterator = class {
  constructor(vector) {
    this.vector = vector;
  }
  index = 0;
  next() {
    if (this.index < this.vector.length) {
      return {
        value: this.vector.get(this.index++)
      };
    }
    return { done: true, value: null };
  }
  [Symbol.iterator]() {
    return this;
  }
};
IteratorVisitor.prototype.visitNull = vectorIterator;
IteratorVisitor.prototype.visitBool = vectorIterator;
IteratorVisitor.prototype.visitInt = vectorIterator;
IteratorVisitor.prototype.visitInt8 = vectorIterator;
IteratorVisitor.prototype.visitInt16 = vectorIterator;
IteratorVisitor.prototype.visitInt32 = vectorIterator;
IteratorVisitor.prototype.visitInt64 = vectorIterator;
IteratorVisitor.prototype.visitUint8 = vectorIterator;
IteratorVisitor.prototype.visitUint16 = vectorIterator;
IteratorVisitor.prototype.visitUint32 = vectorIterator;
IteratorVisitor.prototype.visitUint64 = vectorIterator;
IteratorVisitor.prototype.visitFloat = vectorIterator;
IteratorVisitor.prototype.visitFloat16 = vectorIterator;
IteratorVisitor.prototype.visitFloat32 = vectorIterator;
IteratorVisitor.prototype.visitFloat64 = vectorIterator;
IteratorVisitor.prototype.visitUtf8 = vectorIterator;
IteratorVisitor.prototype.visitLargeUtf8 = vectorIterator;
IteratorVisitor.prototype.visitUtf8View = vectorIterator;
IteratorVisitor.prototype.visitBinary = vectorIterator;
IteratorVisitor.prototype.visitLargeBinary = vectorIterator;
IteratorVisitor.prototype.visitBinaryView = vectorIterator;
IteratorVisitor.prototype.visitFixedSizeBinary = vectorIterator;
IteratorVisitor.prototype.visitDate = vectorIterator;
IteratorVisitor.prototype.visitDateDay = vectorIterator;
IteratorVisitor.prototype.visitDateMillisecond = vectorIterator;
IteratorVisitor.prototype.visitTimestamp = vectorIterator;
IteratorVisitor.prototype.visitTimestampSecond = vectorIterator;
IteratorVisitor.prototype.visitTimestampMillisecond = vectorIterator;
IteratorVisitor.prototype.visitTimestampMicrosecond = vectorIterator;
IteratorVisitor.prototype.visitTimestampNanosecond = vectorIterator;
IteratorVisitor.prototype.visitTime = vectorIterator;
IteratorVisitor.prototype.visitTimeSecond = vectorIterator;
IteratorVisitor.prototype.visitTimeMillisecond = vectorIterator;
IteratorVisitor.prototype.visitTimeMicrosecond = vectorIterator;
IteratorVisitor.prototype.visitTimeNanosecond = vectorIterator;
IteratorVisitor.prototype.visitDecimal = vectorIterator;
IteratorVisitor.prototype.visitList = vectorIterator;
IteratorVisitor.prototype.visitLargeList = vectorIterator;
IteratorVisitor.prototype.visitStruct = vectorIterator;
IteratorVisitor.prototype.visitUnion = vectorIterator;
IteratorVisitor.prototype.visitDenseUnion = vectorIterator;
IteratorVisitor.prototype.visitSparseUnion = vectorIterator;
IteratorVisitor.prototype.visitDictionary = vectorIterator;
IteratorVisitor.prototype.visitInterval = vectorIterator;
IteratorVisitor.prototype.visitIntervalDayTime = vectorIterator;
IteratorVisitor.prototype.visitIntervalYearMonth = vectorIterator;
IteratorVisitor.prototype.visitIntervalMonthDayNano = vectorIterator;
IteratorVisitor.prototype.visitDuration = vectorIterator;
IteratorVisitor.prototype.visitDurationSecond = vectorIterator;
IteratorVisitor.prototype.visitDurationMillisecond = vectorIterator;
IteratorVisitor.prototype.visitDurationMicrosecond = vectorIterator;
IteratorVisitor.prototype.visitDurationNanosecond = vectorIterator;
IteratorVisitor.prototype.visitFixedSizeList = vectorIterator;
IteratorVisitor.prototype.visitMap = vectorIterator;
var instance4 = new IteratorVisitor();

// src/vector.ts
var kVectorSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/Vector");
var visitorsByTypeId = {};
var vectorPrototypesByTypeId = {};
var Vector = class _Vector {
  /**
   * Check if an object is an instance of Vector.
   * This works across different instances of the Arrow library.
   */
  /** @nocollapse */
  static isVector(x) {
    return x?.[kVectorSymbol] === true;
  }
  constructor(input) {
    const data = input[0] instanceof _Vector ? input.flatMap((x) => x.data) : input;
    if (data.length === 0 || data.some((x) => !(x instanceof Data))) {
      throw new TypeError("Vector constructor expects an Array of Data instances.");
    }
    const type = data[0]?.type;
    switch (data.length) {
      case 0:
        this._offsets = [0];
        break;
      case 1: {
        const { get, set, indexOf } = visitorsByTypeId[type.typeId];
        const unchunkedData = data[0];
        this.isValid = (index) => isChunkedValid(unchunkedData, index);
        this.get = (index) => get(unchunkedData, index);
        this.set = (index, value) => set(unchunkedData, index, value);
        this.indexOf = (index) => indexOf(unchunkedData, index);
        this._offsets = [0, unchunkedData.length];
        break;
      }
      default:
        Object.setPrototypeOf(this, vectorPrototypesByTypeId[type.typeId]);
        this._offsets = computeChunkOffsets(data);
        break;
    }
    this.data = data;
    this.type = type;
    this.stride = strideForType(type);
    this.numChildren = type.children?.length ?? 0;
    this.length = this._offsets.at(-1);
  }
  /**
   * The aggregate size (in bytes) of this Vector's buffers and/or child Vectors.
   */
  get byteLength() {
    return this.data.reduce((byteLength, data) => byteLength + data.byteLength, 0);
  }
  /**
   * Whether this Vector's elements can contain null values.
   */
  get nullable() {
    return computeChunkNullable(this.data);
  }
  /**
   * The number of null elements in this Vector.
   */
  get nullCount() {
    return computeChunkNullCounts(this.data);
  }
  /**
   * The Array or TypedArray constructor used for the JS representation
   *  of the element's values in {@link Vector.prototype.toArray `toArray()`}.
   */
  get ArrayType() {
    return this.type.ArrayType;
  }
  /**
   * The name that should be printed when the Vector is logged in a message.
   */
  get [Symbol.toStringTag]() {
    return `${this.VectorName}<${this.type[Symbol.toStringTag]}>`;
  }
  /**
   * The name of this Vector.
   */
  get VectorName() {
    return `${Type2[this.type.typeId]}Vector`;
  }
  /**
   * Check whether an element is null.
   * @param index The index at which to read the validity bitmap.
   */
  // @ts-ignore
  isValid(index) {
    return false;
  }
  /**
   * Get an element value by position.
   * @param index The index of the element to read.
   */
  // @ts-ignore
  get(index) {
    return null;
  }
  /**
   * Get an element value by position.
   * @param index The index of the element to read. A negative index will count back from the last element.
   */
  at(index) {
    return this.get(wrapIndex(index, this.length));
  }
  /**
   * Set an element value by position.
   * @param index The index of the element to write.
   * @param value The value to set.
   */
  // @ts-ignore
  set(index, value) {
    return;
  }
  /**
   * Retrieve the index of the first occurrence of a value in an Vector.
   * @param element The value to locate in the Vector.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  // @ts-ignore
  indexOf(element, offset) {
    return -1;
  }
  includes(element, offset) {
    return this.indexOf(element, offset) > -1;
  }
  /**
   * Iterator for the Vector's elements.
   */
  [Symbol.iterator]() {
    return instance4.visit(this);
  }
  /**
   * Combines two or more Vectors of the same type.
   * @param others Additional Vectors to add to the end of this Vector.
   */
  concat(...others) {
    return new _Vector(this.data.concat(others.flatMap((x) => x.data).flat(Number.POSITIVE_INFINITY)));
  }
  /**
   * Return a zero-copy sub-section of this Vector.
   * @param start The beginning of the specified portion of the Vector.
   * @param end The end of the specified portion of the Vector. This is exclusive of the element at the index 'end'.
   */
  slice(begin, end) {
    return new _Vector(clampRange(
      this,
      begin,
      end,
      ({ data, _offsets }, begin2, end2) => sliceChunks(data, _offsets, begin2, end2)
    ));
  }
  toJSON() {
    return [...this];
  }
  /**
   * Return a JavaScript Array or TypedArray of the Vector's elements.
   *
   * @note If this Vector contains a single Data chunk and the Vector's type is a
   *  primitive numeric type corresponding to one of the JavaScript TypedArrays, this
   *  method returns a zero-copy slice of the underlying TypedArray values. If there's
   *  more than one chunk, the resulting TypedArray will be a copy of the data from each
   *  chunk's underlying TypedArray values.
   *
   * @returns An Array or TypedArray of the Vector's elements, based on the Vector's DataType.
   */
  toArray() {
    const { type, data, length, stride, ArrayType } = this;
    switch (type.typeId) {
      case 2 /* Int */:
      case 3 /* Float */:
      case 7 /* Decimal */:
      case 9 /* Time */:
      case 10 /* Timestamp */:
        switch (data.length) {
          case 0:
            return new ArrayType();
          case 1:
            return data[0].values.subarray(0, length * stride);
          default:
            return data.reduce((memo, { values, length: chunk_length }) => {
              memo.array.set(values.subarray(0, chunk_length * stride), memo.offset);
              memo.offset += chunk_length * stride;
              return memo;
            }, { array: new ArrayType(length * stride), offset: 0 }).array;
        }
    }
    return [...this];
  }
  /**
   * Returns a string representation of the Vector.
   *
   * @returns A string representation of the Vector.
   */
  toString() {
    return `[${[...this].join(",")}]`;
  }
  /**
   * Returns a child Vector by name, or null if this Vector has no child with the given name.
   * @param name The name of the child to retrieve.
   */
  getChild(name) {
    return this.getChildAt(this.type.children?.findIndex((f) => f.name === name));
  }
  /**
   * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
   * @param index The index of the child to retrieve.
   */
  getChildAt(index) {
    if (index > -1 && index < this.numChildren) {
      return new _Vector(this.data.map(({ children }) => children[index]));
    }
    return null;
  }
  get isMemoized() {
    if (DataType.isDictionary(this.type)) {
      return this.data[0].dictionary.isMemoized;
    }
    return false;
  }
  /**
   * Adds memoization to the Vector's {@link get} method. For dictionary
   * vectors, this method return a vector that memoizes only the dictionary
   * values.
   *
   * Memoization is very useful when decoding a value is expensive such as
   * Utf8. The memoization creates a cache of the size of the Vector and
   * therefore increases memory usage.
   *
   * @returns A new vector that memoizes calls to {@link get}.
   */
  memoize() {
    if (DataType.isDictionary(this.type)) {
      const dictionary = new MemoizedVector(this.data[0].dictionary);
      const newData = this.data.map((data) => {
        const cloned = data.clone();
        cloned.dictionary = dictionary;
        return cloned;
      });
      return new _Vector(newData);
    }
    return new MemoizedVector(this);
  }
  /**
   * Returns a vector without memoization of the {@link get} method. If this
   * vector is not memoized, this method returns this vector.
   *
   * @returns A new vector without memoization.
   */
  unmemoize() {
    if (DataType.isDictionary(this.type) && this.isMemoized) {
      const dictionary = this.data[0].dictionary.unmemoize();
      const newData = this.data.map((data) => {
        const newData2 = data.clone();
        newData2.dictionary = dictionary;
        return newData2;
      });
      return new _Vector(newData);
    }
    return this;
  }
  // Initialize this static property via an IIFE so bundlers don't tree-shake
  // out this logic, but also so we're still compliant with `"sideEffects": false`
  static [Symbol.toStringTag] = ((proto) => {
    proto.type = DataType.prototype;
    proto.data = [];
    proto.length = 0;
    proto.stride = 1;
    proto.numChildren = 0;
    proto._offsets = new Uint32Array([0]);
    proto[Symbol.isConcatSpreadable] = true;
    proto[kVectorSymbol] = true;
    const typeIds = Object.keys(Type2).map((T) => Type2[T]).filter((T) => typeof T === "number" && T !== 0 /* NONE */);
    for (const typeId of typeIds) {
      const get = instance2.getVisitFnByTypeId(typeId);
      const set = instance.getVisitFnByTypeId(typeId);
      const indexOf = instance3.getVisitFnByTypeId(typeId);
      visitorsByTypeId[typeId] = { get, set, indexOf };
      vectorPrototypesByTypeId[typeId] = Object.create(proto, {
        ["isValid"]: { value: wrapChunkedCall1(isChunkedValid) },
        ["get"]: { value: wrapChunkedCall1(instance2.getVisitFnByTypeId(typeId)) },
        ["set"]: { value: wrapChunkedCall2(instance.getVisitFnByTypeId(typeId)) },
        ["indexOf"]: { value: wrapChunkedIndexOf(instance3.getVisitFnByTypeId(typeId)) }
      });
    }
    return "Vector";
  })(_Vector.prototype);
};
Object.defineProperty(Vector, Symbol.hasInstance, {
  value: function isVectorInstance(instance8) {
    return Function.prototype[Symbol.hasInstance].call(this, instance8) || this === Vector && Vector.isVector(instance8);
  }
});
var MemoizedVector = class _MemoizedVector extends Vector {
  constructor(vector) {
    super(vector.data);
    const get = this.get;
    const set = this.set;
    const slice = this.slice;
    const cache = new Array(this.length);
    Object.defineProperty(this, "get", {
      value(index) {
        const cachedValue = cache[index];
        if (cachedValue !== void 0) {
          return cachedValue;
        }
        const value = get.call(this, index);
        cache[index] = value;
        return value;
      }
    });
    Object.defineProperty(this, "set", {
      value(index, value) {
        set.call(this, index, value);
        cache[index] = value;
      }
    });
    Object.defineProperty(this, "slice", {
      value: (begin, end) => new _MemoizedVector(slice.call(this, begin, end))
    });
    Object.defineProperty(this, "isMemoized", { value: true });
    Object.defineProperty(this, "unmemoize", {
      value: () => new Vector(this.data)
    });
    Object.defineProperty(this, "memoize", {
      value: () => this
    });
  }
};
function makeVector(init) {
  if (init) {
    if (init instanceof Data) {
      return new Vector([init]);
    }
    if (init instanceof Vector) {
      return new Vector(init.data);
    }
    if (init.type instanceof DataType) {
      return new Vector([makeData(init)]);
    }
    if (Array.isArray(init)) {
      return new Vector(init.flatMap((v) => unwrapInputs(v)));
    }
    if (ArrayBuffer.isView(init)) {
      if (init instanceof DataView) {
        init = new Uint8Array(init.buffer);
      }
      const props = { offset: 0, length: init.length, nullCount: -1, data: init };
      if (init instanceof Int8Array) {
        return new Vector([makeData({ ...props, type: new Int8() })]);
      }
      if (init instanceof Int16Array) {
        return new Vector([makeData({ ...props, type: new Int16() })]);
      }
      if (init instanceof Int32Array) {
        return new Vector([makeData({ ...props, type: new Int32() })]);
      }
      if (init instanceof BigInt64Array) {
        return new Vector([makeData({ ...props, type: new Int64() })]);
      }
      if (init instanceof Uint8Array || init instanceof Uint8ClampedArray) {
        return new Vector([makeData({ ...props, type: new Uint8() })]);
      }
      if (init instanceof Uint16Array) {
        return new Vector([makeData({ ...props, type: new Uint16() })]);
      }
      if (init instanceof Uint32Array) {
        return new Vector([makeData({ ...props, type: new Uint32() })]);
      }
      if (init instanceof BigUint64Array) {
        return new Vector([makeData({ ...props, type: new Uint64() })]);
      }
      if (init instanceof Float32Array) {
        return new Vector([makeData({ ...props, type: new Float32() })]);
      }
      if (init instanceof Float64Array) {
        return new Vector([makeData({ ...props, type: new Float64() })]);
      }
      throw new Error("Unrecognized input");
    }
  }
  throw new Error("Unrecognized input");
}
function unwrapInputs(x) {
  return x instanceof Data ? [x] : x instanceof Vector ? x.data : makeVector(x).data;
}

// src/builder/valid.ts
function createIsValidFunction(nullValues) {
  if (!nullValues || nullValues.length <= 0) {
    return function isValid(value) {
      return true;
    };
  }
  let fnBody = "";
  const noNaNs = nullValues.filter((x) => x === x);
  if (noNaNs.length > 0) {
    fnBody = `
    switch (x) {${noNaNs.map((x) => `
        case ${valueToCase(x)}:`).join("")}
            return false;
    }`;
  }
  if (nullValues.length !== noNaNs.length) {
    fnBody = `if (x !== x) return false;
${fnBody}`;
  }
  return new Function(`x`, `${fnBody}
return true;`);
}
function valueToCase(x) {
  if (typeof x !== "bigint") {
    return valueToString(x);
  }
  return `${valueToString(x)}n`;
}

// src/builder/buffer.ts
function roundLengthUpToNearest64Bytes(len, BPE) {
  const bytesMinus1 = Math.ceil(len) * BPE - 1;
  return (bytesMinus1 - bytesMinus1 % 64 + 64 || 64) / BPE;
}
function resizeArray(arr, len = 0) {
  return arr.length >= len ? arr.subarray(0, len) : memcpy(new arr.constructor(len), arr, 0);
}
var BufferBuilder = class {
  constructor(bufferType, initialSize = 0, stride = 1) {
    this.length = Math.ceil(initialSize / stride);
    this.buffer = new bufferType(this.length);
    this.stride = stride;
    this.BYTES_PER_ELEMENT = bufferType.BYTES_PER_ELEMENT;
    this.ArrayType = bufferType;
  }
  buffer;
  length;
  stride;
  ArrayType;
  BYTES_PER_ELEMENT;
  get byteLength() {
    return Math.ceil(this.length * this.stride) * this.BYTES_PER_ELEMENT;
  }
  get reservedLength() {
    return this.buffer.length / this.stride;
  }
  get reservedByteLength() {
    return this.buffer.byteLength;
  }
  // @ts-ignore
  set(index, value) {
    return this;
  }
  append(value) {
    return this.set(this.length, value);
  }
  reserve(extra) {
    if (extra > 0) {
      this.length += extra;
      const stride = this.stride;
      const length = this.length * stride;
      const reserved = this.buffer.length;
      if (length >= reserved) {
        this._resize(
          reserved === 0 ? roundLengthUpToNearest64Bytes(length * 1, this.BYTES_PER_ELEMENT) : roundLengthUpToNearest64Bytes(length * 2, this.BYTES_PER_ELEMENT)
        );
      }
    }
    return this;
  }
  flush(length = this.length) {
    length = roundLengthUpToNearest64Bytes(length * this.stride, this.BYTES_PER_ELEMENT);
    const array = resizeArray(this.buffer, length);
    this.clear();
    return array;
  }
  clear() {
    this.length = 0;
    this.buffer = new this.ArrayType();
    return this;
  }
  _resize(newLength) {
    return this.buffer = resizeArray(this.buffer, newLength);
  }
};
var DataBufferBuilder = class extends BufferBuilder {
  last() {
    return this.get(this.length - 1);
  }
  get(index) {
    return this.buffer[index];
  }
  set(index, value) {
    this.reserve(index - this.length + 1);
    this.buffer[index * this.stride] = value;
    return this;
  }
};
var BitmapBufferBuilder = class extends DataBufferBuilder {
  constructor() {
    super(Uint8Array, 0, 1 / 8);
  }
  numValid = 0;
  get numInvalid() {
    return this.length - this.numValid;
  }
  get(idx) {
    return this.buffer[idx >> 3] >> idx % 8 & 1;
  }
  set(idx, val) {
    const { buffer } = this.reserve(idx - this.length + 1);
    const byte = idx >> 3, bit = idx % 8, cur = buffer[byte] >> bit & 1;
    val ? cur === 0 && (buffer[byte] |= 1 << bit, ++this.numValid) : cur === 1 && (buffer[byte] &= ~(1 << bit), --this.numValid);
    return this;
  }
  clear() {
    this.numValid = 0;
    return super.clear();
  }
};
var OffsetsBufferBuilder = class extends DataBufferBuilder {
  constructor(type) {
    super(type.OffsetArrayType, 1, 1);
  }
  append(value) {
    return this.set(this.length - 1, value);
  }
  set(index, value) {
    const offset = this.length - 1;
    const buffer = this.reserve(index - offset + 1).buffer;
    if (offset < index++ && offset >= 0) {
      buffer.fill(buffer[offset], offset, index);
    }
    buffer[index] = buffer[index - 1] + value;
    return this;
  }
  flush(length = this.length - 1) {
    if (length > this.length) {
      this.set(length - 1, this.BYTES_PER_ELEMENT > 4 ? BigInt(0) : 0);
    }
    return super.flush(length + 1);
  }
};

// src/builder.ts
var Builder = class {
  /** @nocollapse */
  // @ts-ignore
  static throughNode(options) {
    throw new Error(`"throughNode" not available in this environment`);
  }
  /** @nocollapse */
  // @ts-ignore
  static throughDOM(options) {
    throw new Error(`"throughDOM" not available in this environment`);
  }
  /**
   * Construct a builder with the given Arrow DataType with optional null values,
   * which will be interpreted as "null" when set or appended to the `Builder`.
   * @param {{ type: T, nullValues?: any[] }} options A `BuilderOptions` object used to create this `Builder`.
   */
  constructor({ "type": type, "nullValues": nulls }) {
    this.type = type;
    this.children = [];
    this.nullValues = nulls;
    this.stride = strideForType(type);
    this._nulls = new BitmapBufferBuilder();
    if (nulls && nulls.length > 0) {
      this._isValid = createIsValidFunction(nulls);
    }
  }
  /**
   * The Builder's `DataType` instance.
   * @readonly
   */
  type;
  /**
   * The number of values written to the `Builder` that haven't been flushed yet.
   * @readonly
   */
  length = 0;
  /**
   * A boolean indicating whether `Builder.prototype.finish()` has been called on this `Builder`.
   * @readonly
   */
  finished = false;
  /**
   * The number of elements in the underlying values TypedArray that
   * represent a single logical element, determined by this Builder's
   * `DataType`. This is 1 for most types, but is larger when the `DataType`
   * is `Int64`, `Uint64`, `Decimal`, `DateMillisecond`, certain variants of
   * `Interval`, `Time`, or `Timestamp`, `FixedSizeBinary`, and `FixedSizeList`.
   * @readonly
   */
  stride;
  children;
  /**
   * The list of null-value sentinels for this `Builder`. When one of these values
   * is written to the `Builder` (either via `Builder.prototype.set()` or `Builder.prototype.append()`),
   * a 1-bit is written to this Builder's underlying null BitmapBufferBuilder.
   * @readonly
   */
  nullValues;
  /**
   * Flush the `Builder` and return a `Vector<T>`.
   * @returns {Vector<T>} A `Vector<T>` of the flushed values.
   */
  toVector() {
    return new Vector([this.flush()]);
  }
  get ArrayType() {
    return this.type.ArrayType;
  }
  get nullCount() {
    return this._nulls.numInvalid;
  }
  get numChildren() {
    return this.children.length;
  }
  /**
   * @returns The aggregate length (in bytes) of the values that have been written.
   */
  get byteLength() {
    let size = 0;
    const { _offsets, _values, _nulls, _typeIds, children } = this;
    _offsets && (size += _offsets.byteLength);
    _values && (size += _values.byteLength);
    _nulls && (size += _nulls.byteLength);
    _typeIds && (size += _typeIds.byteLength);
    return children.reduce((size2, child) => size2 + child.byteLength, size);
  }
  /**
   * @returns The aggregate number of rows that have been reserved to write new values.
   */
  get reservedLength() {
    return this._nulls.reservedLength;
  }
  /**
   * @returns The aggregate length (in bytes) that has been reserved to write new values.
   */
  get reservedByteLength() {
    let size = 0;
    this._offsets && (size += this._offsets.reservedByteLength);
    this._values && (size += this._values.reservedByteLength);
    this._nulls && (size += this._nulls.reservedByteLength);
    this._typeIds && (size += this._typeIds.reservedByteLength);
    return this.children.reduce((size2, child) => size2 + child.reservedByteLength, size);
  }
  get valueOffsets() {
    return this._offsets ? this._offsets.buffer : null;
  }
  get values() {
    return this._values ? this._values.buffer : null;
  }
  get nullBitmap() {
    return this._nulls ? this._nulls.buffer : null;
  }
  get typeIds() {
    return this._typeIds ? this._typeIds.buffer : null;
  }
  /**
   * Appends a value (or null) to this `Builder`.
   * This is equivalent to `builder.set(builder.length, value)`.
   * @param {T['TValue'] | TNull } value The value to append.
   */
  append(value) {
    return this.set(this.length, value);
  }
  /**
   * Validates whether a value is valid (true), or null (false)
   * @param {T['TValue'] | TNull } value The value to compare against null the value representations
   */
  isValid(value) {
    return this._isValid(value);
  }
  /**
   * Write a value (or null-value sentinel) at the supplied index.
   * If the value matches one of the null-value representations, a 1-bit is
   * written to the null `BitmapBufferBuilder`. Otherwise, a 0 is written to
   * the null `BitmapBufferBuilder`, and the value is passed to
   * `Builder.prototype.setValue()`.
   * @param {number} index The index of the value to write.
   * @param {T['TValue'] | TNull } value The value to write at the supplied index.
   * @returns {this} The updated `Builder` instance.
   */
  set(index, value) {
    if (this.setValid(index, this.isValid(value))) {
      this.setValue(index, value);
    }
    return this;
  }
  /**
   * Write a value to the underlying buffers at the supplied index, bypassing
   * the null-value check. This is a low-level method that
   * @param {number} index
   * @param {T['TValue'] | TNull } value
   */
  setValue(index, value) {
    this._setValue(this, index, value);
  }
  setValid(index, valid) {
    this.length = this._nulls.set(index, +valid).length;
    return valid;
  }
  // @ts-ignore
  addChild(child, name = `${this.numChildren}`) {
    throw new Error(`Cannot append children to non-nested type "${this.type}"`);
  }
  /**
   * Retrieve the child `Builder` at the supplied `index`, or null if no child
   * exists at that index.
   * @param {number} index The index of the child `Builder` to retrieve.
   * @returns {Builder | null} The child Builder at the supplied index or null.
   */
  getChildAt(index) {
    return this.children[index] || null;
  }
  /**
   * Commit all the values that have been written to their underlying
   * ArrayBuffers, including any child Builders if applicable, and reset
   * the internal `Builder` state.
   * @returns A `Data<T>` of the buffers and children representing the values written.
   */
  flush() {
    let data;
    let typeIds;
    let nullBitmap;
    let valueOffsets;
    const { type, length, nullCount, _typeIds, _offsets, _values, _nulls } = this;
    if (typeIds = _typeIds?.flush(length)) {
      valueOffsets = _offsets?.flush(length);
    } else if (valueOffsets = _offsets?.flush(length)) {
      data = _values?.flush(_offsets.last());
    } else {
      data = _values?.flush(length);
    }
    if (nullCount > 0) {
      nullBitmap = _nulls?.flush(length);
    }
    const children = this.children.map((child) => child.flush());
    this.clear();
    return makeData({
      type,
      length,
      nullCount,
      children,
      "child": children[0],
      data,
      typeIds,
      nullBitmap,
      valueOffsets
    });
  }
  /**
   * Finalize this `Builder`, and child builders if applicable.
   * @returns {this} The finalized `Builder` instance.
   */
  finish() {
    this.finished = true;
    for (const child of this.children) child.finish();
    return this;
  }
  /**
   * Clear this Builder's internal state, including child Builders if applicable, and reset the length to 0.
   * @returns {this} The cleared `Builder` instance.
   */
  clear() {
    this.length = 0;
    this._nulls?.clear();
    this._values?.clear();
    this._offsets?.clear();
    this._typeIds?.clear();
    for (const child of this.children) child.clear();
    return this;
  }
};
Builder.prototype.length = 1;
Builder.prototype.stride = 1;
Builder.prototype.children = null;
Builder.prototype.finished = false;
Builder.prototype.nullValues = null;
Builder.prototype._isValid = () => true;
var FixedWidthBuilder = class extends Builder {
  constructor(opts) {
    super(opts);
    this._values = new DataBufferBuilder(this.ArrayType, 0, this.stride);
  }
  setValue(index, value) {
    const values = this._values;
    values.reserve(index - values.length + 1);
    return super.setValue(index, value);
  }
};
var VariableWidthBuilder = class extends Builder {
  _pendingLength = 0;
  _offsets;
  _pending;
  constructor(opts) {
    super(opts);
    this._offsets = new OffsetsBufferBuilder(opts.type);
  }
  setValue(index, value) {
    const pending = this._pending || (this._pending = /* @__PURE__ */ new Map());
    const current = pending.get(index);
    current && (this._pendingLength -= current.length);
    this._pendingLength += value instanceof MapRow ? value[kKeys].length : value.length;
    pending.set(index, value);
  }
  setValid(index, isValid) {
    if (!super.setValid(index, isValid)) {
      (this._pending || (this._pending = /* @__PURE__ */ new Map())).set(index, void 0);
      return false;
    }
    return true;
  }
  clear() {
    this._pendingLength = 0;
    this._pending = void 0;
    return super.clear();
  }
  flush() {
    this._flush();
    return super.flush();
  }
  finish() {
    this._flush();
    return super.finish();
  }
  _flush() {
    const pending = this._pending;
    const pendingLength = this._pendingLength;
    this._pendingLength = 0;
    this._pending = void 0;
    if (pending && pending.size > 0) {
      this._flushPending(pending, pendingLength);
    }
    return this;
  }
};

// src/fb/block.ts
var Block = class {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  /**
   * Index to the start of the RecordBlock (note this is past the Message header)
   */
  offset() {
    return this.bb.readInt64(this.bb_pos);
  }
  /**
   * Length of the metadata
   */
  metaDataLength() {
    return this.bb.readInt32(this.bb_pos + 8);
  }
  /**
   * Length of the data (this is aligned so there can be a gap between this and
   * the metadata).
   */
  bodyLength() {
    return this.bb.readInt64(this.bb_pos + 16);
  }
  static sizeOf() {
    return 24;
  }
  static createBlock(builder, offset, metaDataLength, bodyLength) {
    builder.prep(8, 24);
    builder.writeInt64(BigInt(bodyLength ?? 0));
    builder.pad(4);
    builder.writeInt32(metaDataLength);
    builder.writeInt64(BigInt(offset ?? 0));
    return builder.offset();
  }
};

// src/fb/footer.ts
import * as flatbuffers40 from "flatbuffers";
var Footer = class _Footer {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsFooter(bb, obj) {
    return (obj || new _Footer()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsFooter(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers40.SIZE_PREFIX_LENGTH);
    return (obj || new _Footer()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  version() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* V1 */;
  }
  schema(obj) {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? (obj || new Schema()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
  }
  dictionaries(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? (obj || new Block()).__init(this.bb.__vector(this.bb_pos + offset) + index * 24, this.bb) : null;
  }
  dictionariesLength() {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  recordBatches(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? (obj || new Block()).__init(this.bb.__vector(this.bb_pos + offset) + index * 24, this.bb) : null;
  }
  recordBatchesLength() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  /**
   * User-defined metadata
   */
  customMetadata(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  customMetadataLength() {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startFooter(builder) {
    builder.startObject(5);
  }
  static addVersion(builder, version) {
    builder.addFieldInt16(0, version, 0 /* V1 */);
  }
  static addSchema(builder, schemaOffset) {
    builder.addFieldOffset(1, schemaOffset, 0);
  }
  static addDictionaries(builder, dictionariesOffset) {
    builder.addFieldOffset(2, dictionariesOffset, 0);
  }
  static startDictionariesVector(builder, numElems) {
    builder.startVector(24, numElems, 8);
  }
  static addRecordBatches(builder, recordBatchesOffset) {
    builder.addFieldOffset(3, recordBatchesOffset, 0);
  }
  static startRecordBatchesVector(builder, numElems) {
    builder.startVector(24, numElems, 8);
  }
  static addCustomMetadata(builder, customMetadataOffset) {
    builder.addFieldOffset(4, customMetadataOffset, 0);
  }
  static createCustomMetadataVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startCustomMetadataVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endFooter(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static finishFooterBuffer(builder, offset) {
    builder.finish(offset);
  }
  static finishSizePrefixedFooterBuffer(builder, offset) {
    builder.finish(offset, void 0, true);
  }
};

// src/ipc/metadata/file.ts
import * as flatbuffers41 from "flatbuffers";

// src/schema.ts
var kSchemaSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/Schema");
var kFieldSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/Field");
var Schema2 = class _Schema {
  /**
   * Check if an object is an instance of Schema.
   * This works across different instances of the Arrow library.
   */
  /** @nocollapse */
  static isSchema(x) {
    return x?.[kSchemaSymbol] === true;
  }
  fields;
  metadata;
  dictionaries;
  metadataVersion;
  constructor(fields = [], metadata, dictionaries, metadataVersion = 4 /* V5 */) {
    this.fields = fields || [];
    this.metadata = metadata || /* @__PURE__ */ new Map();
    if (!dictionaries) {
      dictionaries = generateDictionaryMap(this.fields);
    }
    this.dictionaries = dictionaries;
    this.metadataVersion = metadataVersion;
  }
  get [Symbol.toStringTag]() {
    return "Schema";
  }
  get names() {
    return this.fields.map((f) => f.name);
  }
  toString() {
    return `Schema<{ ${this.fields.map((f, i) => `${i}: ${f}`).join(", ")} }>`;
  }
  /**
   * Construct a new Schema containing only specified fields.
   *
   * @param fieldNames Names of fields to keep.
   * @returns A new Schema of fields matching the specified names.
   */
  select(fieldNames) {
    const names = new Set(fieldNames);
    const fields = this.fields.filter((f) => names.has(f.name));
    return new _Schema(fields, this.metadata);
  }
  /**
   * Construct a new Schema containing only fields at the specified indices.
   *
   * @param fieldIndices Indices of fields to keep.
   * @returns A new Schema of fields at the specified indices.
   */
  selectAt(fieldIndices) {
    const fields = fieldIndices.map((i) => this.fields[i]).filter(Boolean);
    return new _Schema(fields, this.metadata);
  }
  assign(...args) {
    const other = args[0] instanceof _Schema ? args[0] : Array.isArray(args[0]) ? new _Schema(args[0]) : new _Schema(args);
    const curFields = [...this.fields];
    const metadata = mergeMaps(mergeMaps(/* @__PURE__ */ new Map(), this.metadata), other.metadata);
    const newFields = other.fields.filter((f2) => {
      const i = curFields.findIndex((f) => f.name === f2.name);
      return ~i ? (curFields[i] = f2.clone({
        metadata: mergeMaps(mergeMaps(/* @__PURE__ */ new Map(), curFields[i].metadata), f2.metadata)
      })) && false : true;
    });
    const newDictionaries = generateDictionaryMap(newFields, /* @__PURE__ */ new Map());
    return new _Schema(
      [...curFields, ...newFields],
      metadata,
      new Map([...this.dictionaries, ...newDictionaries])
    );
  }
};
Schema2.prototype.fields = null;
Schema2.prototype.metadata = null;
Schema2.prototype.dictionaries = null;
Schema2.prototype[kSchemaSymbol] = true;
Object.defineProperty(Schema2, Symbol.hasInstance, {
  value: function isSchemaInstance(instance8) {
    return Function.prototype[Symbol.hasInstance].call(this, instance8) || this === Schema2 && Schema2.isSchema(instance8);
  }
});
var Field2 = class _Field {
  /**
   * Check if an object is an instance of Field.
   * This works across different instances of the Arrow library.
   */
  /** @nocollapse */
  static isField(x) {
    return x?.[kFieldSymbol] === true;
  }
  /** @nocollapse */
  static new(...args) {
    let [name, type, nullable, metadata] = args;
    if (args[0] && typeof args[0] === "object") {
      ({ name } = args[0]);
      type === void 0 && (type = args[0].type);
      nullable === void 0 && (nullable = args[0].nullable);
      metadata === void 0 && (metadata = args[0].metadata);
    }
    return new _Field(`${name}`, type, nullable, metadata);
  }
  type;
  name;
  nullable;
  metadata;
  constructor(name, type, nullable = false, metadata) {
    this.name = name;
    this.type = type;
    this.nullable = nullable;
    this.metadata = metadata || /* @__PURE__ */ new Map();
  }
  get typeId() {
    return this.type.typeId;
  }
  get [Symbol.toStringTag]() {
    return "Field";
  }
  toString() {
    return `${this.name}: ${this.type}`;
  }
  clone(...args) {
    let [name, type, nullable, metadata] = args;
    !args[0] || typeof args[0] !== "object" ? [name = this.name, type = this.type, nullable = this.nullable, metadata = this.metadata] = args : { name = this.name, type = this.type, nullable = this.nullable, metadata = this.metadata } = args[0];
    return _Field.new(name, type, nullable, metadata);
  }
};
Field2.prototype.type = null;
Field2.prototype.name = null;
Field2.prototype.nullable = null;
Field2.prototype.metadata = null;
Field2.prototype[kFieldSymbol] = true;
Object.defineProperty(Field2, Symbol.hasInstance, {
  value: function isFieldInstance(instance8) {
    return Function.prototype[Symbol.hasInstance].call(this, instance8) || this === Field2 && Field2.isField(instance8);
  }
});
function mergeMaps(m1, m2) {
  return new Map([...m1 || /* @__PURE__ */ new Map(), ...m2 || /* @__PURE__ */ new Map()]);
}
function generateDictionaryMap(fields, dictionaries = /* @__PURE__ */ new Map()) {
  for (let i = -1, n = fields.length; ++i < n; ) {
    const field = fields[i];
    const type = field.type;
    if (DataType.isDictionary(type)) {
      if (!dictionaries.has(type.id)) {
        dictionaries.set(type.id, type.dictionary);
      } else if (dictionaries.get(type.id) !== type.dictionary) {
        throw new Error(`Cannot create Schema containing two different dictionaries with the same Id`);
      }
    }
    if (type.children && type.children.length > 0) {
      generateDictionaryMap(type.children, dictionaries);
    }
  }
  return dictionaries;
}

// src/ipc/metadata/file.ts
var Builder3 = flatbuffers41.Builder;
var ByteBuffer2 = flatbuffers41.ByteBuffer;
var Footer_ = class {
  constructor(schema, version = 4 /* V5 */, recordBatches, dictionaryBatches) {
    this.schema = schema;
    this.version = version;
    recordBatches && (this._recordBatches = recordBatches);
    dictionaryBatches && (this._dictionaryBatches = dictionaryBatches);
  }
  /** @nocollapse */
  static decode(buf) {
    buf = new ByteBuffer2(toUint8Array(buf));
    const footer = Footer.getRootAsFooter(buf);
    const schema = Schema2.decode(footer.schema(), /* @__PURE__ */ new Map(), footer.version());
    return new OffHeapFooter(schema, footer);
  }
  /** @nocollapse */
  static encode(footer) {
    const b = new Builder3();
    const schemaOffset = Schema2.encode(b, footer.schema);
    Footer.startRecordBatchesVector(b, footer.numRecordBatches);
    for (const rb of [...footer.recordBatches()].slice().reverse()) {
      FileBlock.encode(b, rb);
    }
    const recordBatchesOffset = b.endVector();
    Footer.startDictionariesVector(b, footer.numDictionaries);
    for (const db of [...footer.dictionaryBatches()].slice().reverse()) {
      FileBlock.encode(b, db);
    }
    const dictionaryBatchesOffset = b.endVector();
    Footer.startFooter(b);
    Footer.addSchema(b, schemaOffset);
    Footer.addVersion(b, 4 /* V5 */);
    Footer.addRecordBatches(b, recordBatchesOffset);
    Footer.addDictionaries(b, dictionaryBatchesOffset);
    Footer.finishFooterBuffer(b, Footer.endFooter(b));
    return b.asUint8Array();
  }
  get numRecordBatches() {
    return this._recordBatches.length;
  }
  get numDictionaries() {
    return this._dictionaryBatches.length;
  }
  *recordBatches() {
    for (let block, i = -1, n = this.numRecordBatches; ++i < n; ) {
      if (block = this.getRecordBatch(i)) {
        yield block;
      }
    }
  }
  *dictionaryBatches() {
    for (let block, i = -1, n = this.numDictionaries; ++i < n; ) {
      if (block = this.getDictionaryBatch(i)) {
        yield block;
      }
    }
  }
  getRecordBatch(index) {
    return index >= 0 && index < this.numRecordBatches && this._recordBatches[index] || null;
  }
  getDictionaryBatch(index) {
    return index >= 0 && index < this.numDictionaries && this._dictionaryBatches[index] || null;
  }
};
var OffHeapFooter = class extends Footer_ {
  constructor(schema, _footer) {
    super(schema, _footer.version());
    this._footer = _footer;
  }
  get numRecordBatches() {
    return this._footer.recordBatchesLength();
  }
  get numDictionaries() {
    return this._footer.dictionariesLength();
  }
  getRecordBatch(index) {
    if (index >= 0 && index < this.numRecordBatches) {
      const fileBlock = this._footer.recordBatches(index);
      if (fileBlock) {
        return FileBlock.decode(fileBlock);
      }
    }
    return null;
  }
  getDictionaryBatch(index) {
    if (index >= 0 && index < this.numDictionaries) {
      const fileBlock = this._footer.dictionaries(index);
      if (fileBlock) {
        return FileBlock.decode(fileBlock);
      }
    }
    return null;
  }
};
var FileBlock = class _FileBlock {
  /** @nocollapse */
  static decode(block) {
    return new _FileBlock(block.metaDataLength(), block.bodyLength(), block.offset());
  }
  /** @nocollapse */
  static encode(b, fileBlock) {
    const { metaDataLength } = fileBlock;
    const offset = BigInt(fileBlock.offset);
    const bodyLength = BigInt(fileBlock.bodyLength);
    return Block.createBlock(b, offset, metaDataLength, bodyLength);
  }
  offset;
  bodyLength;
  metaDataLength;
  constructor(metaDataLength, bodyLength, offset) {
    this.metaDataLength = metaDataLength;
    this.offset = bigIntToNumber(offset);
    this.bodyLength = bigIntToNumber(bodyLength);
  }
};

// src/ipc/metadata/message.ts
import * as flatbuffers44 from "flatbuffers";

// src/fb/message.ts
import * as flatbuffers42 from "flatbuffers";
var Message = class _Message {
  bb = null;
  bb_pos = 0;
  __init(i, bb) {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }
  static getRootAsMessage(bb, obj) {
    return (obj || new _Message()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  static getSizePrefixedRootAsMessage(bb, obj) {
    bb.setPosition(bb.position() + flatbuffers42.SIZE_PREFIX_LENGTH);
    return (obj || new _Message()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }
  version() {
    const offset = this.bb.__offset(this.bb_pos, 4);
    return offset ? this.bb.readInt16(this.bb_pos + offset) : 0 /* V1 */;
  }
  headerType() {
    const offset = this.bb.__offset(this.bb_pos, 6);
    return offset ? this.bb.readUint8(this.bb_pos + offset) : 0 /* NONE */;
  }
  header(obj) {
    const offset = this.bb.__offset(this.bb_pos, 8);
    return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
  }
  bodyLength() {
    const offset = this.bb.__offset(this.bb_pos, 10);
    return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt("0");
  }
  customMetadata(index, obj) {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
  }
  customMetadataLength() {
    const offset = this.bb.__offset(this.bb_pos, 12);
    return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
  }
  static startMessage(builder) {
    builder.startObject(5);
  }
  static addVersion(builder, version) {
    builder.addFieldInt16(0, version, 0 /* V1 */);
  }
  static addHeaderType(builder, headerType) {
    builder.addFieldInt8(1, headerType, 0 /* NONE */);
  }
  static addHeader(builder, headerOffset) {
    builder.addFieldOffset(2, headerOffset, 0);
  }
  static addBodyLength(builder, bodyLength) {
    builder.addFieldInt64(3, bodyLength, BigInt("0"));
  }
  static addCustomMetadata(builder, customMetadataOffset) {
    builder.addFieldOffset(4, customMetadataOffset, 0);
  }
  static createCustomMetadataVector(builder, data) {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]);
    }
    return builder.endVector();
  }
  static startCustomMetadataVector(builder, numElems) {
    builder.startVector(4, numElems, 4);
  }
  static endMessage(builder) {
    const offset = builder.endObject();
    return offset;
  }
  static finishMessageBuffer(builder, offset) {
    builder.finish(offset);
  }
  static finishSizePrefixedMessageBuffer(builder, offset) {
    builder.finish(offset, void 0, true);
  }
  static createMessage(builder, version, headerType, headerOffset, bodyLength, customMetadataOffset) {
    _Message.startMessage(builder);
    _Message.addVersion(builder, version);
    _Message.addHeaderType(builder, headerType);
    _Message.addHeader(builder, headerOffset);
    _Message.addBodyLength(builder, bodyLength);
    _Message.addCustomMetadata(builder, customMetadataOffset);
    return _Message.endMessage(builder);
  }
};

// src/visitor/typeassembler.ts
import * as flatbuffers43 from "flatbuffers";
var TypeAssembler = class extends Visitor {
  visit(node, builder) {
    return node == null || builder == null ? void 0 : super.visit(node, builder);
  }
  visitNull(_node, b) {
    Null.startNull(b);
    return Null.endNull(b);
  }
  visitInt(node, b) {
    Int.startInt(b);
    Int.addBitWidth(b, node.bitWidth);
    Int.addIsSigned(b, node.isSigned);
    return Int.endInt(b);
  }
  visitFloat(node, b) {
    FloatingPoint.startFloatingPoint(b);
    FloatingPoint.addPrecision(b, node.precision);
    return FloatingPoint.endFloatingPoint(b);
  }
  visitBinary(_node, b) {
    Binary.startBinary(b);
    return Binary.endBinary(b);
  }
  visitBinaryView(_node, b) {
    BinaryView.startBinaryView(b);
    return BinaryView.endBinaryView(b);
  }
  visitLargeBinary(_node, b) {
    LargeBinary.startLargeBinary(b);
    return LargeBinary.endLargeBinary(b);
  }
  visitBool(_node, b) {
    Bool.startBool(b);
    return Bool.endBool(b);
  }
  visitUtf8(_node, b) {
    Utf8.startUtf8(b);
    return Utf8.endUtf8(b);
  }
  visitUtf8View(_node, b) {
    Utf8View.startUtf8View(b);
    return Utf8View.endUtf8View(b);
  }
  visitLargeUtf8(_node, b) {
    LargeUtf8.startLargeUtf8(b);
    return LargeUtf8.endLargeUtf8(b);
  }
  visitDecimal(node, b) {
    Decimal.startDecimal(b);
    Decimal.addScale(b, node.scale);
    Decimal.addPrecision(b, node.precision);
    Decimal.addBitWidth(b, node.bitWidth);
    return Decimal.endDecimal(b);
  }
  visitDate(node, b) {
    Date2.startDate(b);
    Date2.addUnit(b, node.unit);
    return Date2.endDate(b);
  }
  visitTime(node, b) {
    Time.startTime(b);
    Time.addUnit(b, node.unit);
    Time.addBitWidth(b, node.bitWidth);
    return Time.endTime(b);
  }
  visitTimestamp(node, b) {
    const timezone = node.timezone && b.createString(node.timezone) || void 0;
    Timestamp.startTimestamp(b);
    Timestamp.addUnit(b, node.unit);
    if (timezone !== void 0) {
      Timestamp.addTimezone(b, timezone);
    }
    return Timestamp.endTimestamp(b);
  }
  visitInterval(node, b) {
    Interval.startInterval(b);
    Interval.addUnit(b, node.unit);
    return Interval.endInterval(b);
  }
  visitDuration(node, b) {
    Duration.startDuration(b);
    Duration.addUnit(b, node.unit);
    return Duration.endDuration(b);
  }
  visitList(_node, b) {
    List.startList(b);
    return List.endList(b);
  }
  visitLargeList(_node, b) {
    LargeList.startLargeList(b);
    return LargeList.endLargeList(b);
  }
  visitStruct(_node, b) {
    Struct_.startStruct_(b);
    return Struct_.endStruct_(b);
  }
  visitUnion(node, b) {
    Union.startTypeIdsVector(b, node.typeIds.length);
    const typeIds = Union.createTypeIdsVector(b, node.typeIds);
    Union.startUnion(b);
    Union.addMode(b, node.mode);
    Union.addTypeIds(b, typeIds);
    return Union.endUnion(b);
  }
  visitDictionary(node, b) {
    const indexType = this.visit(node.indices, b);
    DictionaryEncoding.startDictionaryEncoding(b);
    DictionaryEncoding.addId(b, BigInt(node.id));
    DictionaryEncoding.addIsOrdered(b, node.isOrdered);
    if (indexType !== void 0) {
      DictionaryEncoding.addIndexType(b, indexType);
    }
    return DictionaryEncoding.endDictionaryEncoding(b);
  }
  visitFixedSizeBinary(node, b) {
    FixedSizeBinary.startFixedSizeBinary(b);
    FixedSizeBinary.addByteWidth(b, node.byteWidth);
    return FixedSizeBinary.endFixedSizeBinary(b);
  }
  visitFixedSizeList(node, b) {
    FixedSizeList.startFixedSizeList(b);
    FixedSizeList.addListSize(b, node.listSize);
    return FixedSizeList.endFixedSizeList(b);
  }
  visitMap(node, b) {
    Map2.startMap(b);
    Map2.addKeysSorted(b, node.keysSorted);
    return Map2.endMap(b);
  }
};
var instance5 = new TypeAssembler();

// src/ipc/metadata/json.ts
function schemaFromJSON(_schema, dictionaries = /* @__PURE__ */ new Map()) {
  return new Schema2(
    schemaFieldsFromJSON(_schema, dictionaries),
    customMetadataFromJSON(_schema["metadata"]),
    dictionaries
  );
}
function recordBatchFromJSON(b) {
  return new RecordBatch2(
    b["count"],
    fieldNodesFromJSON(b["columns"]),
    buffersFromJSON(b["columns"]),
    null,
    variadicBufferCountsFromJSON(b["columns"])
  );
}
function dictionaryBatchFromJSON(b) {
  return new DictionaryBatch2(
    recordBatchFromJSON(b["data"]),
    b["id"],
    b["isDelta"]
  );
}
function schemaFieldsFromJSON(_schema, dictionaries) {
  return (_schema["fields"] || []).filter(Boolean).map((f) => Field2.fromJSON(f, dictionaries));
}
function fieldChildrenFromJSON(_field, dictionaries) {
  return (_field["children"] || []).filter(Boolean).map((f) => Field2.fromJSON(f, dictionaries));
}
function fieldNodesFromJSON(xs) {
  return (xs || []).reduce((fieldNodes, column) => [
    ...fieldNodes,
    new FieldNode2(
      column["count"],
      nullCountFromJSON(column["VALIDITY"])
    ),
    ...fieldNodesFromJSON(column["children"])
  ], []);
}
function buffersFromJSON(xs, buffers = []) {
  for (let i = -1, n = (xs || []).length; ++i < n; ) {
    const column = xs[i];
    column["VALIDITY"] && buffers.push(new BufferRegion(buffers.length, column["VALIDITY"].length));
    column["TYPE_ID"] && buffers.push(new BufferRegion(buffers.length, column["TYPE_ID"].length));
    column["OFFSET"] && buffers.push(new BufferRegion(buffers.length, column["OFFSET"].length));
    column["DATA"] && buffers.push(new BufferRegion(buffers.length, column["DATA"].length));
    column["VIEWS"] && buffers.push(new BufferRegion(buffers.length, column["VIEWS"].length));
    if (column["VARIADIC_DATA_BUFFERS"]) {
      for (const buf of column["VARIADIC_DATA_BUFFERS"]) {
        buffers.push(new BufferRegion(buffers.length, buf.length));
      }
    }
    buffers = buffersFromJSON(column["children"], buffers);
  }
  return buffers;
}
function nullCountFromJSON(validity) {
  return (validity || []).reduce((sum, val) => sum + +(val === 0), 0);
}
function variadicBufferCountsFromJSON(xs) {
  return (xs || []).reduce((counts, column) => [
    ...counts,
    ...column["VARIADIC_DATA_BUFFERS"] ? [column["VARIADIC_DATA_BUFFERS"].length] : [],
    ...variadicBufferCountsFromJSON(column["children"])
  ], []);
}
function fieldFromJSON(_field, dictionaries) {
  let id;
  let keys;
  let field;
  let dictMeta;
  let type;
  let dictType;
  if (!dictionaries || !(dictMeta = _field["dictionary"])) {
    type = typeFromJSON(_field, fieldChildrenFromJSON(_field, dictionaries));
    field = new Field2(_field["name"], type, _field["nullable"], customMetadataFromJSON(_field["metadata"]));
  } else if (!dictionaries.has(id = dictMeta["id"])) {
    keys = (keys = dictMeta["indexType"]) ? indexTypeFromJSON(keys) : new Int32();
    dictionaries.set(id, type = typeFromJSON(_field, fieldChildrenFromJSON(_field, dictionaries)));
    dictType = new Dictionary(type, keys, id, dictMeta["isOrdered"]);
    field = new Field2(_field["name"], dictType, _field["nullable"], customMetadataFromJSON(_field["metadata"]));
  } else {
    keys = (keys = dictMeta["indexType"]) ? indexTypeFromJSON(keys) : new Int32();
    dictType = new Dictionary(dictionaries.get(id), keys, id, dictMeta["isOrdered"]);
    field = new Field2(_field["name"], dictType, _field["nullable"], customMetadataFromJSON(_field["metadata"]));
  }
  return field || null;
}
function customMetadataFromJSON(metadata = []) {
  return new Map(metadata.map(({ key, value }) => [key, value]));
}
function indexTypeFromJSON(_type) {
  return new Int_(_type["isSigned"], _type["bitWidth"]);
}
function typeFromJSON(f, children) {
  const typeId = f["type"]["name"];
  switch (typeId) {
    case "NONE":
      return new Null2();
    case "null":
      return new Null2();
    case "binary":
      return new Binary2();
    case "largebinary":
      return new LargeBinary2();
    case "binaryview":
      return new BinaryView2();
    case "utf8":
      return new Utf82();
    case "largeutf8":
      return new LargeUtf82();
    case "utf8view":
      return new Utf8View2();
    case "bool":
      return new Bool2();
    case "list":
      return new List2((children || [])[0]);
    case "largelist":
      return new LargeList2((children || [])[0]);
    case "struct":
      return new Struct(children || []);
    case "struct_":
      return new Struct(children || []);
  }
  switch (typeId) {
    case "int": {
      const t = f["type"];
      return new Int_(t["isSigned"], t["bitWidth"]);
    }
    case "floatingpoint": {
      const t = f["type"];
      return new Float(Precision[t["precision"]]);
    }
    case "decimal": {
      const t = f["type"];
      return new Decimal2(t["scale"], t["precision"], t["bitWidth"]);
    }
    case "date": {
      const t = f["type"];
      return new Date_(DateUnit[t["unit"]]);
    }
    case "time": {
      const t = f["type"];
      return new Time_(TimeUnit[t["unit"]], t["bitWidth"]);
    }
    case "timestamp": {
      const t = f["type"];
      return new Timestamp_(TimeUnit[t["unit"]], t["timezone"]);
    }
    case "interval": {
      const t = f["type"];
      return new Interval_(IntervalUnit[t["unit"]]);
    }
    case "duration": {
      const t = f["type"];
      return new Duration2(TimeUnit[t["unit"]]);
    }
    case "union": {
      const t = f["type"];
      const [m, ...ms] = (t["mode"] + "").toLowerCase();
      const mode = m.toUpperCase() + ms.join("");
      return new Union_(UnionMode[mode], t["typeIds"] || [], children || []);
    }
    case "fixedsizebinary": {
      const t = f["type"];
      return new FixedSizeBinary2(t["byteWidth"]);
    }
    case "fixedsizelist": {
      const t = f["type"];
      return new FixedSizeList2(t["listSize"], (children || [])[0]);
    }
    case "map": {
      const t = f["type"];
      return new Map_((children || [])[0], t["keysSorted"]);
    }
  }
  throw new Error(`Unrecognized type: "${typeId}"`);
}

// src/ipc/metadata/message.ts
var Builder6 = flatbuffers44.Builder;
var ByteBuffer4 = flatbuffers44.ByteBuffer;
var Message2 = class _Message {
  /** @nocollapse */
  static fromJSON(msg, headerType) {
    const message = new _Message(0, 4 /* V5 */, headerType);
    message._createHeader = messageHeaderFromJSON(msg, headerType);
    return message;
  }
  /** @nocollapse */
  static decode(buf) {
    buf = new ByteBuffer4(toUint8Array(buf));
    const _message = Message.getRootAsMessage(buf);
    const bodyLength = _message.bodyLength();
    const version = _message.version();
    const headerType = _message.headerType();
    const metadata = decodeMessageCustomMetadata(_message);
    const message = new _Message(bodyLength, version, headerType, void 0, metadata);
    message._createHeader = decodeMessageHeader(_message, headerType);
    return message;
  }
  /** @nocollapse */
  static encode(message) {
    const b = new Builder6();
    let headerOffset = -1;
    if (message.isSchema()) {
      headerOffset = Schema2.encode(b, message.header());
    } else if (message.isRecordBatch()) {
      headerOffset = RecordBatch2.encode(b, message.header());
    } else if (message.isDictionaryBatch()) {
      headerOffset = DictionaryBatch2.encode(b, message.header());
    }
    const customMetadataOffset = !(message.metadata && message.metadata.size > 0) ? -1 : Message.createCustomMetadataVector(b, [...message.metadata].map(([k, v]) => {
      const key = b.createString(`${k}`);
      const val = b.createString(`${v}`);
      KeyValue.startKeyValue(b);
      KeyValue.addKey(b, key);
      KeyValue.addValue(b, val);
      return KeyValue.endKeyValue(b);
    }));
    Message.startMessage(b);
    Message.addVersion(b, 4 /* V5 */);
    Message.addHeader(b, headerOffset);
    Message.addHeaderType(b, message.headerType);
    Message.addBodyLength(b, BigInt(message.bodyLength));
    if (customMetadataOffset !== -1) {
      Message.addCustomMetadata(b, customMetadataOffset);
    }
    Message.finishMessageBuffer(b, Message.endMessage(b));
    return b.asUint8Array();
  }
  /** @nocollapse */
  static from(header, bodyLength = 0) {
    if (header instanceof Schema2) {
      return new _Message(0, 4 /* V5 */, 1 /* Schema */, header);
    }
    if (header instanceof RecordBatch2) {
      return new _Message(bodyLength, 4 /* V5 */, 3 /* RecordBatch */, header, header.metadata);
    }
    if (header instanceof DictionaryBatch2) {
      return new _Message(bodyLength, 4 /* V5 */, 2 /* DictionaryBatch */, header);
    }
    throw new Error(`Unrecognized Message header: ${header}`);
  }
  body;
  _headerType;
  _bodyLength;
  _version;
  _compression;
  _metadata;
  get type() {
    return this.headerType;
  }
  get version() {
    return this._version;
  }
  get headerType() {
    return this._headerType;
  }
  get compression() {
    return this._compression;
  }
  get bodyLength() {
    return this._bodyLength;
  }
  get metadata() {
    return this._metadata;
  }
  header() {
    return this._createHeader();
  }
  isSchema() {
    return this.headerType === 1 /* Schema */;
  }
  isRecordBatch() {
    return this.headerType === 3 /* RecordBatch */;
  }
  isDictionaryBatch() {
    return this.headerType === 2 /* DictionaryBatch */;
  }
  constructor(bodyLength, version, headerType, header, metadata) {
    this._version = version;
    this._headerType = headerType;
    this.body = new Uint8Array(0);
    this._compression = header?.compression;
    header && (this._createHeader = () => header);
    this._bodyLength = bigIntToNumber(bodyLength);
    this._metadata = metadata || /* @__PURE__ */ new Map();
  }
};
var RecordBatch2 = class {
  _length;
  _nodes;
  _buffers;
  _compression;
  _variadicBufferCounts;
  _metadata;
  get nodes() {
    return this._nodes;
  }
  get length() {
    return this._length;
  }
  get buffers() {
    return this._buffers;
  }
  get compression() {
    return this._compression;
  }
  get variadicBufferCounts() {
    return this._variadicBufferCounts;
  }
  get metadata() {
    return this._metadata;
  }
  constructor(length, nodes, buffers, compression, variadicBufferCounts = [], metadata) {
    this._nodes = nodes;
    this._buffers = buffers;
    this._length = bigIntToNumber(length);
    this._compression = compression;
    this._variadicBufferCounts = variadicBufferCounts;
    this._metadata = metadata || /* @__PURE__ */ new Map();
  }
};
var DictionaryBatch2 = class {
  _id;
  _isDelta;
  _data;
  get id() {
    return this._id;
  }
  get data() {
    return this._data;
  }
  get isDelta() {
    return this._isDelta;
  }
  get length() {
    return this.data.length;
  }
  get nodes() {
    return this.data.nodes;
  }
  get buffers() {
    return this.data.buffers;
  }
  constructor(data, id, isDelta = false) {
    this._data = data;
    this._isDelta = isDelta;
    this._id = bigIntToNumber(id);
  }
};
var BufferRegion = class {
  offset;
  length;
  constructor(offset, length) {
    this.offset = bigIntToNumber(offset);
    this.length = bigIntToNumber(length);
  }
};
var FieldNode2 = class {
  length;
  nullCount;
  constructor(length, nullCount) {
    this.length = bigIntToNumber(length);
    this.nullCount = bigIntToNumber(nullCount);
  }
};
var BodyCompression2 = class {
  type;
  method;
  constructor(type, method = 0 /* BUFFER */) {
    this.type = type;
    this.method = method;
  }
};
function messageHeaderFromJSON(message, type) {
  return (() => {
    switch (type) {
      case 1 /* Schema */:
        return Schema2.fromJSON(message);
      case 3 /* RecordBatch */:
        return RecordBatch2.fromJSON(message);
      case 2 /* DictionaryBatch */:
        return DictionaryBatch2.fromJSON(message);
    }
    throw new Error(`Unrecognized Message type: { name: ${MessageHeader[type]}, type: ${type} }`);
  });
}
function decodeMessageHeader(message, type) {
  return (() => {
    switch (type) {
      case 1 /* Schema */:
        return Schema2.decode(message.header(new Schema()), /* @__PURE__ */ new Map(), message.version());
      case 3 /* RecordBatch */:
        return RecordBatch2.decode(message.header(new RecordBatch()), message.version());
      case 2 /* DictionaryBatch */:
        return DictionaryBatch2.decode(message.header(new DictionaryBatch()), message.version());
    }
    throw new Error(`Unrecognized Message type: { name: ${MessageHeader[type]}, type: ${type} }`);
  });
}
Field2["encode"] = encodeField;
Field2["decode"] = decodeField;
Field2["fromJSON"] = fieldFromJSON;
Schema2["encode"] = encodeSchema;
Schema2["decode"] = decodeSchema;
Schema2["fromJSON"] = schemaFromJSON;
RecordBatch2["encode"] = encodeRecordBatch;
RecordBatch2["decode"] = decodeRecordBatch;
RecordBatch2["fromJSON"] = recordBatchFromJSON;
DictionaryBatch2["encode"] = encodeDictionaryBatch;
DictionaryBatch2["decode"] = decodeDictionaryBatch;
DictionaryBatch2["fromJSON"] = dictionaryBatchFromJSON;
FieldNode2["encode"] = encodeFieldNode;
FieldNode2["decode"] = decodeFieldNode;
BufferRegion["encode"] = encodeBufferRegion;
BufferRegion["decode"] = decodeBufferRegion;
BodyCompression2["encode"] = encodeBodyCompression;
BodyCompression2["decode"] = decodeBodyCompression;
function decodeSchema(_schema, dictionaries = /* @__PURE__ */ new Map(), version = 4 /* V5 */) {
  const fields = decodeSchemaFields(_schema, dictionaries);
  return new Schema2(fields, decodeCustomMetadata(_schema), dictionaries, version);
}
function decodeRecordBatch(batch, version = 4 /* V5 */) {
  const recordBatch = new RecordBatch2(
    batch.length(),
    decodeFieldNodes(batch),
    decodeBuffers(batch, version),
    decodeBodyCompression(batch.compression()),
    decodeVariadicBufferCounts(batch)
  );
  return recordBatch;
}
function decodeDictionaryBatch(batch, version = 4 /* V5 */) {
  return new DictionaryBatch2(RecordBatch2.decode(batch.data(), version), batch.id(), batch.isDelta());
}
function decodeBufferRegion(b) {
  return new BufferRegion(b.offset(), b.length());
}
function decodeFieldNode(f) {
  return new FieldNode2(f.length(), f.nullCount());
}
function decodeFieldNodes(batch) {
  const nodes = [];
  for (let f, i = -1, j = -1, n = batch.nodesLength(); ++i < n; ) {
    if (f = batch.nodes(i)) {
      nodes[++j] = FieldNode2.decode(f);
    }
  }
  return nodes;
}
function decodeBuffers(batch, version) {
  const bufferRegions = [];
  for (let b, i = -1, j = -1, n = batch.buffersLength(); ++i < n; ) {
    if (b = batch.buffers(i)) {
      if (version < 3 /* V4 */) {
        b.bb_pos += 8 * (i + 1);
      }
      bufferRegions[++j] = BufferRegion.decode(b);
    }
  }
  return bufferRegions;
}
function decodeVariadicBufferCounts(batch) {
  const counts = [];
  const length = Math.trunc(batch.variadicBufferCountsLength());
  for (let i = 0; i < length; ++i) {
    counts.push(bigIntToNumber(batch.variadicBufferCounts(i)));
  }
  return counts;
}
function decodeSchemaFields(schema, dictionaries) {
  const fields = [];
  for (let f, i = -1, j = -1, n = schema.fieldsLength(); ++i < n; ) {
    if (f = schema.fields(i)) {
      fields[++j] = Field2.decode(f, dictionaries);
    }
  }
  return fields;
}
function decodeFieldChildren(field, dictionaries) {
  const children = [];
  for (let f, i = -1, j = -1, n = field.childrenLength(); ++i < n; ) {
    if (f = field.children(i)) {
      children[++j] = Field2.decode(f, dictionaries);
    }
  }
  return children;
}
function decodeField(f, dictionaries) {
  let id;
  let field;
  let type;
  let keys;
  let dictType;
  let dictMeta;
  if (!dictionaries || !(dictMeta = f.dictionary())) {
    type = decodeFieldType(f, decodeFieldChildren(f, dictionaries));
    field = new Field2(f.name(), type, f.nullable(), decodeCustomMetadata(f));
  } else if (!dictionaries.has(id = bigIntToNumber(dictMeta.id()))) {
    keys = (keys = dictMeta.indexType()) ? decodeIndexType(keys) : new Int32();
    dictionaries.set(id, type = decodeFieldType(f, decodeFieldChildren(f, dictionaries)));
    dictType = new Dictionary(type, keys, id, dictMeta.isOrdered());
    field = new Field2(f.name(), dictType, f.nullable(), decodeCustomMetadata(f));
  } else {
    keys = (keys = dictMeta.indexType()) ? decodeIndexType(keys) : new Int32();
    dictType = new Dictionary(dictionaries.get(id), keys, id, dictMeta.isOrdered());
    field = new Field2(f.name(), dictType, f.nullable(), decodeCustomMetadata(f));
  }
  return field || null;
}
function decodeCustomMetadata(parent) {
  const data = /* @__PURE__ */ new Map();
  if (parent) {
    for (let entry, key, i = -1, n = Math.trunc(parent.customMetadataLength()); ++i < n; ) {
      if ((entry = parent.customMetadata(i)) && (key = entry.key()) != null) {
        data.set(key, entry.value());
      }
    }
  }
  return data;
}
function decodeMessageCustomMetadata(message) {
  const data = /* @__PURE__ */ new Map();
  for (let entry, key, i = -1, n = Math.trunc(message.customMetadataLength()); ++i < n; ) {
    if ((entry = message.customMetadata(i)) && (key = entry.key()) != null) {
      data.set(key, entry.value());
    }
  }
  return data;
}
function decodeIndexType(_type) {
  return new Int_(_type.isSigned(), _type.bitWidth());
}
function decodeFieldType(f, children) {
  const typeId = f.typeType();
  switch (typeId) {
    case 0 /* NONE */:
      return new Null2();
    case 1 /* Null */:
      return new Null2();
    case 4 /* Binary */:
      return new Binary2();
    case 19 /* LargeBinary */:
      return new LargeBinary2();
    case 23 /* BinaryView */:
      return new BinaryView2();
    case 5 /* Utf8 */:
      return new Utf82();
    case 20 /* LargeUtf8 */:
      return new LargeUtf82();
    case 24 /* Utf8View */:
      return new Utf8View2();
    case 6 /* Bool */:
      return new Bool2();
    case 12 /* List */:
      return new List2((children || [])[0]);
    case 21 /* LargeList */:
      return new LargeList2((children || [])[0]);
    case 13 /* Struct_ */:
      return new Struct(children || []);
  }
  switch (typeId) {
    case 2 /* Int */: {
      const t = f.type(new Int());
      return new Int_(t.isSigned(), t.bitWidth());
    }
    case 3 /* FloatingPoint */: {
      const t = f.type(new FloatingPoint());
      return new Float(t.precision());
    }
    case 7 /* Decimal */: {
      const t = f.type(new Decimal());
      return new Decimal2(t.scale(), t.precision(), t.bitWidth());
    }
    case 8 /* Date */: {
      const t = f.type(new Date2());
      return new Date_(t.unit());
    }
    case 9 /* Time */: {
      const t = f.type(new Time());
      return new Time_(t.unit(), t.bitWidth());
    }
    case 10 /* Timestamp */: {
      const t = f.type(new Timestamp());
      return new Timestamp_(t.unit(), t.timezone());
    }
    case 11 /* Interval */: {
      const t = f.type(new Interval());
      return new Interval_(t.unit());
    }
    case 18 /* Duration */: {
      const t = f.type(new Duration());
      return new Duration2(t.unit());
    }
    case 14 /* Union */: {
      const t = f.type(new Union());
      return new Union_(t.mode(), t.typeIdsArray() || [], children || []);
    }
    case 15 /* FixedSizeBinary */: {
      const t = f.type(new FixedSizeBinary());
      return new FixedSizeBinary2(t.byteWidth());
    }
    case 16 /* FixedSizeList */: {
      const t = f.type(new FixedSizeList());
      return new FixedSizeList2(t.listSize(), (children || [])[0]);
    }
    case 17 /* Map */: {
      const t = f.type(new Map2());
      return new Map_((children || [])[0], t.keysSorted());
    }
  }
  throw new Error(`Unrecognized type: "${Type[typeId]}" (${typeId})`);
}
function decodeBodyCompression(b) {
  return b ? new BodyCompression2(b.codec(), b.method()) : null;
}
function encodeSchema(b, schema) {
  const fieldOffsets = schema.fields.map((f) => Field2.encode(b, f));
  Schema.startFieldsVector(b, fieldOffsets.length);
  const fieldsVectorOffset = Schema.createFieldsVector(b, fieldOffsets);
  const metadataOffset = !(schema.metadata && schema.metadata.size > 0) ? -1 : Schema.createCustomMetadataVector(b, [...schema.metadata].map(([k, v]) => {
    const key = b.createString(`${k}`);
    const val = b.createString(`${v}`);
    KeyValue.startKeyValue(b);
    KeyValue.addKey(b, key);
    KeyValue.addValue(b, val);
    return KeyValue.endKeyValue(b);
  }));
  Schema.startSchema(b);
  Schema.addFields(b, fieldsVectorOffset);
  Schema.addEndianness(b, platformIsLittleEndian ? 0 /* Little */ : 1 /* Big */);
  if (metadataOffset !== -1) {
    Schema.addCustomMetadata(b, metadataOffset);
  }
  return Schema.endSchema(b);
}
function encodeField(b, field) {
  let nameOffset = -1;
  let typeOffset = -1;
  let dictionaryOffset = -1;
  const type = field.type;
  let typeId = field.typeId;
  if (!DataType.isDictionary(type)) {
    typeOffset = instance5.visit(type, b);
  } else {
    typeId = type.dictionary.typeId;
    dictionaryOffset = instance5.visit(type, b);
    typeOffset = instance5.visit(type.dictionary, b);
  }
  const childOffsets = (type.children || []).map((f) => Field2.encode(b, f));
  const childrenVectorOffset = Field.createChildrenVector(b, childOffsets);
  const metadataOffset = !(field.metadata && field.metadata.size > 0) ? -1 : Field.createCustomMetadataVector(b, [...field.metadata].map(([k, v]) => {
    const key = b.createString(`${k}`);
    const val = b.createString(`${v}`);
    KeyValue.startKeyValue(b);
    KeyValue.addKey(b, key);
    KeyValue.addValue(b, val);
    return KeyValue.endKeyValue(b);
  }));
  if (field.name) {
    nameOffset = b.createString(field.name);
  }
  Field.startField(b);
  Field.addType(b, typeOffset);
  Field.addTypeType(b, typeId);
  Field.addChildren(b, childrenVectorOffset);
  Field.addNullable(b, !!field.nullable);
  if (nameOffset !== -1) {
    Field.addName(b, nameOffset);
  }
  if (dictionaryOffset !== -1) {
    Field.addDictionary(b, dictionaryOffset);
  }
  if (metadataOffset !== -1) {
    Field.addCustomMetadata(b, metadataOffset);
  }
  return Field.endField(b);
}
function encodeRecordBatch(b, recordBatch) {
  const nodes = recordBatch.nodes || [];
  const buffers = recordBatch.buffers || [];
  const variadicBufferCounts = recordBatch.variadicBufferCounts || [];
  RecordBatch.startNodesVector(b, nodes.length);
  for (const n of nodes.slice().reverse()) FieldNode2.encode(b, n);
  const nodesVectorOffset = b.endVector();
  RecordBatch.startBuffersVector(b, buffers.length);
  for (const b_ of buffers.slice().reverse()) BufferRegion.encode(b, b_);
  const buffersVectorOffset = b.endVector();
  let bodyCompressionOffset = null;
  if (recordBatch.compression !== null) {
    bodyCompressionOffset = encodeBodyCompression(b, recordBatch.compression);
  }
  let variadicBufferCountsOffset = -1;
  if (variadicBufferCounts.length > 0) {
    variadicBufferCountsOffset = RecordBatch.createVariadicBufferCountsVector(b, variadicBufferCounts.map(BigInt));
  }
  RecordBatch.startRecordBatch(b);
  RecordBatch.addLength(b, BigInt(recordBatch.length));
  RecordBatch.addNodes(b, nodesVectorOffset);
  RecordBatch.addBuffers(b, buffersVectorOffset);
  if (recordBatch.compression !== null && bodyCompressionOffset) {
    RecordBatch.addCompression(b, bodyCompressionOffset);
  }
  if (variadicBufferCountsOffset !== -1) {
    RecordBatch.addVariadicBufferCounts(b, variadicBufferCountsOffset);
  }
  return RecordBatch.endRecordBatch(b);
}
function encodeBodyCompression(b, node) {
  BodyCompression.startBodyCompression(b);
  BodyCompression.addCodec(b, node.type);
  BodyCompression.addMethod(b, node.method);
  return BodyCompression.endBodyCompression(b);
}
function encodeDictionaryBatch(b, dictionaryBatch) {
  const dataOffset = RecordBatch2.encode(b, dictionaryBatch.data);
  DictionaryBatch.startDictionaryBatch(b);
  DictionaryBatch.addId(b, BigInt(dictionaryBatch.id));
  DictionaryBatch.addIsDelta(b, dictionaryBatch.isDelta);
  DictionaryBatch.addData(b, dataOffset);
  return DictionaryBatch.endDictionaryBatch(b);
}
function encodeFieldNode(b, node) {
  return FieldNode.createFieldNode(b, BigInt(node.length), BigInt(node.nullCount));
}
function encodeBufferRegion(b, node) {
  return Buffer2.createBuffer(b, BigInt(node.offset), BigInt(node.length));
}
var platformIsLittleEndian = (() => {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(
    0,
    256,
    true
    /* littleEndian */
  );
  return new Int16Array(buffer)[0] === 256;
})();

// src/io/interfaces.ts
var ITERATOR_DONE = Object.freeze({ done: true, value: void 0 });
var ArrowJSON = class {
  constructor(_json) {
    this._json = _json;
  }
  get schema() {
    return this._json["schema"];
  }
  get batches() {
    return this._json["batches"] || [];
  }
  get dictionaries() {
    return this._json["dictionaries"] || [];
  }
};
var ReadableInterop = class {
  tee() {
    return this._getDOMStream().tee();
  }
  pipe(writable, options) {
    return this._getNodeStream().pipe(writable, options);
  }
  pipeTo(writable, options) {
    return this._getDOMStream().pipeTo(writable, options);
  }
  pipeThrough(duplex, options) {
    return this._getDOMStream().pipeThrough(duplex, options);
  }
  _DOMStream;
  _getDOMStream() {
    return this._DOMStream || (this._DOMStream = this.toDOMStream());
  }
  _nodeStream;
  _getNodeStream() {
    return this._nodeStream || (this._nodeStream = this.toNodeStream());
  }
};
var AsyncQueue = class extends ReadableInterop {
  _values = [];
  _error;
  _closedPromise;
  _closedPromiseResolve;
  resolvers = [];
  constructor() {
    super();
    this._closedPromise = new Promise((r) => this._closedPromiseResolve = r);
  }
  get closed() {
    return this._closedPromise;
  }
  async cancel(reason) {
    await this.return(reason);
  }
  write(value) {
    if (this._ensureOpen()) {
      this.resolvers.length <= 0 ? this._values.push(value) : this.resolvers.shift().resolve({ done: false, value });
    }
  }
  abort(value) {
    if (this._closedPromiseResolve) {
      this.resolvers.length <= 0 ? this._error = { error: value } : this.resolvers.shift().reject({ done: true, value });
    }
  }
  close() {
    if (this._closedPromiseResolve) {
      const { resolvers } = this;
      while (resolvers.length > 0) {
        resolvers.shift().resolve(ITERATOR_DONE);
      }
      this._closedPromiseResolve();
      this._closedPromiseResolve = void 0;
    }
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  toDOMStream(options) {
    return adapters_default.toDOMStream(
      this._closedPromiseResolve || this._error ? this : this._values,
      options
    );
  }
  toNodeStream(options) {
    return adapters_default.toNodeStream(
      this._closedPromiseResolve || this._error ? this : this._values,
      options
    );
  }
  async throw(_) {
    await this.abort(_);
    return ITERATOR_DONE;
  }
  async return(_) {
    await this.close();
    return ITERATOR_DONE;
  }
  async read(size) {
    return (await this.next(size, "read")).value;
  }
  async peek(size) {
    return (await this.next(size, "peek")).value;
  }
  next(..._args) {
    if (this._values.length > 0) {
      return Promise.resolve({ done: false, value: this._values.shift() });
    } else if (this._error) {
      return Promise.reject({ done: true, value: this._error.error });
    } else if (!this._closedPromiseResolve) {
      return Promise.resolve(ITERATOR_DONE);
    } else {
      return new Promise((resolve, reject) => {
        this.resolvers.push({ resolve, reject });
      });
    }
  }
  _ensureOpen() {
    if (this._closedPromiseResolve) {
      return true;
    }
    throw new Error(`AsyncQueue is closed`);
  }
};

// src/io/stream.ts
var AsyncByteQueue = class extends AsyncQueue {
  write(value) {
    if ((value = toUint8Array(value)).byteLength > 0) {
      return super.write(value);
    }
  }
  toString(sync = false) {
    return sync ? decodeUtf8(this.toUint8Array(true)) : this.toUint8Array(false).then(decodeUtf8);
  }
  toUint8Array(sync = false) {
    return sync ? joinUint8Arrays(this._values)[0] : (async () => {
      const buffers = [];
      let byteLength = 0;
      for await (const chunk of this) {
        buffers.push(chunk);
        byteLength += chunk.byteLength;
      }
      return joinUint8Arrays(buffers, byteLength)[0];
    })();
  }
};
var ByteStream = class {
  constructor(source) {
    if (source) {
      this.source = new ByteStreamSource(adapters_default.fromIterable(source));
    }
  }
  [Symbol.iterator]() {
    return this;
  }
  next(value) {
    return this.source.next(value);
  }
  throw(value) {
    return this.source.throw(value);
  }
  return(value) {
    return this.source.return(value);
  }
  peek(size) {
    return this.source.peek(size);
  }
  read(size) {
    return this.source.read(size);
  }
};
var AsyncByteStream = class _AsyncByteStream {
  constructor(source) {
    if (source instanceof _AsyncByteStream) {
      this.source = source.source;
    } else if (source instanceof AsyncByteQueue) {
      this.source = new AsyncByteStreamSource(adapters_default.fromAsyncIterable(source));
    } else if (isReadableNodeStream(source)) {
      this.source = new AsyncByteStreamSource(adapters_default.fromNodeStream(source));
    } else if (isReadableDOMStream(source)) {
      this.source = new AsyncByteStreamSource(adapters_default.fromDOMStream(source));
    } else if (isFetchResponse(source)) {
      this.source = new AsyncByteStreamSource(adapters_default.fromDOMStream(source.body));
    } else if (isIterable(source)) {
      this.source = new AsyncByteStreamSource(adapters_default.fromIterable(source));
    } else if (isPromise(source)) {
      this.source = new AsyncByteStreamSource(adapters_default.fromAsyncIterable(source));
    } else if (isAsyncIterable(source)) {
      this.source = new AsyncByteStreamSource(adapters_default.fromAsyncIterable(source));
    }
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  next(value) {
    return this.source.next(value);
  }
  throw(value) {
    return this.source.throw(value);
  }
  return(value) {
    return this.source.return(value);
  }
  get closed() {
    return this.source.closed;
  }
  cancel(reason) {
    return this.source.cancel(reason);
  }
  peek(size) {
    return this.source.peek(size);
  }
  read(size) {
    return this.source.read(size);
  }
};
var ByteStreamSource = class {
  constructor(source) {
    this.source = source;
  }
  cancel(reason) {
    this.return(reason);
  }
  peek(size) {
    return this.next(size, "peek").value;
  }
  read(size) {
    return this.next(size, "read").value;
  }
  next(size, cmd = "read") {
    return this.source.next({ cmd, size });
  }
  throw(value) {
    return Object.create(this.source.throw && this.source.throw(value) || ITERATOR_DONE);
  }
  return(value) {
    return Object.create(this.source.return && this.source.return(value) || ITERATOR_DONE);
  }
};
var AsyncByteStreamSource = class {
  constructor(source) {
    this.source = source;
    this._closedPromise = new Promise((r) => this._closedPromiseResolve = r);
  }
  _closedPromise;
  _closedPromiseResolve;
  async cancel(reason) {
    await this.return(reason);
  }
  get closed() {
    return this._closedPromise;
  }
  async read(size) {
    return (await this.next(size, "read")).value;
  }
  async peek(size) {
    return (await this.next(size, "peek")).value;
  }
  async next(size, cmd = "read") {
    return await this.source.next({ cmd, size });
  }
  async throw(value) {
    const result = this.source.throw && await this.source.throw(value) || ITERATOR_DONE;
    this._closedPromiseResolve && this._closedPromiseResolve();
    this._closedPromiseResolve = void 0;
    return Object.create(result);
  }
  async return(value) {
    const result = this.source.return && await this.source.return(value) || ITERATOR_DONE;
    this._closedPromiseResolve && this._closedPromiseResolve();
    this._closedPromiseResolve = void 0;
    return Object.create(result);
  }
};

// src/io/file.ts
var RandomAccessFile = class extends ByteStream {
  size;
  position = 0;
  buffer;
  constructor(buffer, byteLength) {
    super();
    this.buffer = toUint8Array(buffer);
    this.size = byteLength === void 0 ? this.buffer.byteLength : byteLength;
  }
  readInt32(position) {
    const { buffer, byteOffset } = this.readAt(position, 4);
    return new DataView(buffer, byteOffset).getInt32(0, true);
  }
  seek(position) {
    this.position = Math.min(position, this.size);
    return position < this.size;
  }
  read(nBytes) {
    const { buffer, size, position } = this;
    if (buffer && position < size) {
      if (typeof nBytes !== "number") {
        nBytes = Number.POSITIVE_INFINITY;
      }
      this.position = Math.min(
        size,
        position + Math.min(size - position, nBytes)
      );
      return buffer.subarray(position, this.position);
    }
    return null;
  }
  readAt(position, nBytes) {
    const buf = this.buffer;
    const end = Math.min(this.size, position + nBytes);
    return buf ? buf.subarray(position, end) : new Uint8Array(nBytes);
  }
  close() {
    this.buffer && (this.buffer = null);
  }
  throw(value) {
    this.close();
    return { done: true, value };
  }
  return(value) {
    this.close();
    return { done: true, value };
  }
};
var AsyncRandomAccessFile = class extends AsyncByteStream {
  position = 0;
  _pending;
  _handle;
  constructor(file, byteLength) {
    super();
    this._handle = file;
    if (typeof byteLength === "number") {
      this.size = byteLength;
    } else {
      this._pending = (async () => {
        this.size = (await file.stat()).size;
        delete this._pending;
      })();
    }
  }
  async readInt32(position) {
    const { buffer, byteOffset } = await this.readAt(position, 4);
    return new DataView(buffer, byteOffset).getInt32(0, true);
  }
  async seek(position) {
    this._pending && await this._pending;
    this.position = Math.min(position, this.size);
    return position < this.size;
  }
  async read(nBytes) {
    this._pending && await this._pending;
    const { _handle: file, size, position } = this;
    if (file && position < size) {
      if (typeof nBytes !== "number") {
        nBytes = Number.POSITIVE_INFINITY;
      }
      let pos = position, offset = 0, bytesRead = 0;
      const end = Math.min(size, pos + Math.min(size - pos, nBytes));
      const buffer = new Uint8Array(Math.max(0, (this.position = end) - pos));
      while ((pos += bytesRead) < end && (offset += bytesRead) < buffer.byteLength) {
        ({ bytesRead } = await file.read(buffer, offset, buffer.byteLength - offset, pos));
      }
      return buffer;
    }
    return null;
  }
  async readAt(position, nBytes) {
    this._pending && await this._pending;
    const { _handle: file, size } = this;
    if (file && position + nBytes < size) {
      const end = Math.min(size, position + nBytes);
      const buffer = new Uint8Array(end - position);
      return (await file.read(buffer, 0, nBytes, position)).buffer;
    }
    return new Uint8Array(nBytes);
  }
  async close() {
    const f = this._handle;
    this._handle = null;
    f && await f.close();
  }
  async throw(value) {
    await this.close();
    return { done: true, value };
  }
  async return(value) {
    await this.close();
    return { done: true, value };
  }
};

// src/util/int.ts
var int_exports = {};
__export(int_exports, {
  BaseInt64: () => BaseInt64,
  Int128: () => Int128,
  Int64: () => Int644,
  Uint64: () => Uint644
});
var carryBit16 = 1 << 16;
function intAsHex(value) {
  if (value < 0) {
    value = 4294967295 + value + 1;
  }
  return `0x${value.toString(16)}`;
}
var kInt32DecimalDigits = 8;
var kPowersOfTen = [
  1,
  10,
  100,
  1e3,
  1e4,
  1e5,
  1e6,
  1e7,
  1e8
];
var BaseInt64 = class {
  constructor(buffer) {
    this.buffer = buffer;
  }
  high() {
    return this.buffer[1];
  }
  low() {
    return this.buffer[0];
  }
  _times(other) {
    const L = new Uint32Array([
      this.buffer[1] >>> 16,
      this.buffer[1] & 65535,
      this.buffer[0] >>> 16,
      this.buffer[0] & 65535
    ]);
    const R = new Uint32Array([
      other.buffer[1] >>> 16,
      other.buffer[1] & 65535,
      other.buffer[0] >>> 16,
      other.buffer[0] & 65535
    ]);
    let product = L[3] * R[3];
    this.buffer[0] = product & 65535;
    let sum = product >>> 16;
    product = L[2] * R[3];
    sum += product;
    product = L[3] * R[2] >>> 0;
    sum += product;
    this.buffer[0] += sum << 16;
    this.buffer[1] = sum >>> 0 < product ? carryBit16 : 0;
    this.buffer[1] += sum >>> 16;
    this.buffer[1] += L[1] * R[3] + L[2] * R[2] + L[3] * R[1];
    this.buffer[1] += L[0] * R[3] + L[1] * R[2] + L[2] * R[1] + L[3] * R[0] << 16;
    return this;
  }
  _plus(other) {
    const sum = this.buffer[0] + other.buffer[0] >>> 0;
    this.buffer[1] += other.buffer[1];
    if (sum < this.buffer[0] >>> 0) {
      ++this.buffer[1];
    }
    this.buffer[0] = sum;
  }
  lessThan(other) {
    return this.buffer[1] < other.buffer[1] || this.buffer[1] === other.buffer[1] && this.buffer[0] < other.buffer[0];
  }
  equals(other) {
    return this.buffer[1] === other.buffer[1] && this.buffer[0] == other.buffer[0];
  }
  greaterThan(other) {
    return other.lessThan(this);
  }
  hex() {
    return `${intAsHex(this.buffer[1])} ${intAsHex(this.buffer[0])}`;
  }
};
var Uint644 = class _Uint64 extends BaseInt64 {
  times(other) {
    this._times(other);
    return this;
  }
  plus(other) {
    this._plus(other);
    return this;
  }
  /** @nocollapse */
  static from(val, out_buffer = new Uint32Array(2)) {
    return _Uint64.fromString(
      typeof val === "string" ? val : val.toString(),
      out_buffer
    );
  }
  /** @nocollapse */
  static fromNumber(num, out_buffer = new Uint32Array(2)) {
    return _Uint64.fromString(num.toString(), out_buffer);
  }
  /** @nocollapse */
  static fromString(str, out_buffer = new Uint32Array(2)) {
    const length = str.length;
    const out = new _Uint64(out_buffer);
    for (let posn = 0; posn < length; ) {
      const group = kInt32DecimalDigits < length - posn ? kInt32DecimalDigits : length - posn;
      const chunk = new _Uint64(new Uint32Array([Number.parseInt(str.slice(posn, posn + group), 10), 0]));
      const multiple = new _Uint64(new Uint32Array([kPowersOfTen[group], 0]));
      out.times(multiple);
      out.plus(chunk);
      posn += group;
    }
    return out;
  }
  /** @nocollapse */
  static convertArray(values) {
    const data = new Uint32Array(values.length * 2);
    for (let i = -1, n = values.length; ++i < n; ) {
      _Uint64.from(values[i], new Uint32Array(data.buffer, data.byteOffset + 2 * i * 4, 2));
    }
    return data;
  }
  /** @nocollapse */
  static multiply(left, right) {
    const rtrn = new _Uint64(new Uint32Array(left.buffer));
    return rtrn.times(right);
  }
  /** @nocollapse */
  static add(left, right) {
    const rtrn = new _Uint64(new Uint32Array(left.buffer));
    return rtrn.plus(right);
  }
};
var Int644 = class _Int64 extends BaseInt64 {
  negate() {
    this.buffer[0] = ~this.buffer[0] + 1;
    this.buffer[1] = ~this.buffer[1];
    if (this.buffer[0] == 0) {
      ++this.buffer[1];
    }
    return this;
  }
  times(other) {
    this._times(other);
    return this;
  }
  plus(other) {
    this._plus(other);
    return this;
  }
  lessThan(other) {
    const this_high = this.buffer[1] << 0;
    const other_high = other.buffer[1] << 0;
    return this_high < other_high || this_high === other_high && this.buffer[0] < other.buffer[0];
  }
  /** @nocollapse */
  static from(val, out_buffer = new Uint32Array(2)) {
    return _Int64.fromString(
      typeof val === "string" ? val : val.toString(),
      out_buffer
    );
  }
  /** @nocollapse */
  static fromNumber(num, out_buffer = new Uint32Array(2)) {
    return _Int64.fromString(num.toString(), out_buffer);
  }
  /** @nocollapse */
  static fromString(str, out_buffer = new Uint32Array(2)) {
    const negate = str.startsWith("-");
    const length = str.length;
    const out = new _Int64(out_buffer);
    for (let posn = negate ? 1 : 0; posn < length; ) {
      const group = kInt32DecimalDigits < length - posn ? kInt32DecimalDigits : length - posn;
      const chunk = new _Int64(new Uint32Array([Number.parseInt(str.slice(posn, posn + group), 10), 0]));
      const multiple = new _Int64(new Uint32Array([kPowersOfTen[group], 0]));
      out.times(multiple);
      out.plus(chunk);
      posn += group;
    }
    return negate ? out.negate() : out;
  }
  /** @nocollapse */
  static convertArray(values) {
    const data = new Uint32Array(values.length * 2);
    for (let i = -1, n = values.length; ++i < n; ) {
      _Int64.from(values[i], new Uint32Array(data.buffer, data.byteOffset + 2 * i * 4, 2));
    }
    return data;
  }
  /** @nocollapse */
  static multiply(left, right) {
    const rtrn = new _Int64(new Uint32Array(left.buffer));
    return rtrn.times(right);
  }
  /** @nocollapse */
  static add(left, right) {
    const rtrn = new _Int64(new Uint32Array(left.buffer));
    return rtrn.plus(right);
  }
};
var Int128 = class _Int128 {
  constructor(buffer) {
    this.buffer = buffer;
  }
  high() {
    return new Int644(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2));
  }
  low() {
    return new Int644(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset, 2));
  }
  negate() {
    this.buffer[0] = ~this.buffer[0] + 1;
    this.buffer[1] = ~this.buffer[1];
    this.buffer[2] = ~this.buffer[2];
    this.buffer[3] = ~this.buffer[3];
    if (this.buffer[0] == 0) {
      ++this.buffer[1];
    }
    if (this.buffer[1] == 0) {
      ++this.buffer[2];
    }
    if (this.buffer[2] == 0) {
      ++this.buffer[3];
    }
    return this;
  }
  times(other) {
    const L0 = new Uint644(new Uint32Array([this.buffer[3], 0]));
    const L1 = new Uint644(new Uint32Array([this.buffer[2], 0]));
    const L2 = new Uint644(new Uint32Array([this.buffer[1], 0]));
    const L3 = new Uint644(new Uint32Array([this.buffer[0], 0]));
    const R0 = new Uint644(new Uint32Array([other.buffer[3], 0]));
    const R1 = new Uint644(new Uint32Array([other.buffer[2], 0]));
    const R2 = new Uint644(new Uint32Array([other.buffer[1], 0]));
    const R3 = new Uint644(new Uint32Array([other.buffer[0], 0]));
    let product = Uint644.multiply(L3, R3);
    this.buffer[0] = product.low();
    const sum = new Uint644(new Uint32Array([product.high(), 0]));
    product = Uint644.multiply(L2, R3);
    sum.plus(product);
    product = Uint644.multiply(L3, R2);
    sum.plus(product);
    this.buffer[1] = sum.low();
    this.buffer[3] = sum.lessThan(product) ? 1 : 0;
    this.buffer[2] = sum.high();
    const high = new Uint644(new Uint32Array(this.buffer.buffer, this.buffer.byteOffset + 8, 2));
    high.plus(Uint644.multiply(L1, R3)).plus(Uint644.multiply(L2, R2)).plus(Uint644.multiply(L3, R1));
    this.buffer[3] += Uint644.multiply(L0, R3).plus(Uint644.multiply(L1, R2)).plus(Uint644.multiply(L2, R1)).plus(Uint644.multiply(L3, R0)).low();
    return this;
  }
  plus(other) {
    const sums = new Uint32Array(4);
    sums[3] = this.buffer[3] + other.buffer[3] >>> 0;
    sums[2] = this.buffer[2] + other.buffer[2] >>> 0;
    sums[1] = this.buffer[1] + other.buffer[1] >>> 0;
    sums[0] = this.buffer[0] + other.buffer[0] >>> 0;
    if (sums[0] < this.buffer[0] >>> 0) {
      ++sums[1];
    }
    if (sums[1] < this.buffer[1] >>> 0) {
      ++sums[2];
    }
    if (sums[2] < this.buffer[2] >>> 0) {
      ++sums[3];
    }
    this.buffer[3] = sums[3];
    this.buffer[2] = sums[2];
    this.buffer[1] = sums[1];
    this.buffer[0] = sums[0];
    return this;
  }
  hex() {
    return `${intAsHex(this.buffer[3])} ${intAsHex(this.buffer[2])} ${intAsHex(this.buffer[1])} ${intAsHex(this.buffer[0])}`;
  }
  /** @nocollapse */
  static multiply(left, right) {
    const rtrn = new _Int128(new Uint32Array(left.buffer));
    return rtrn.times(right);
  }
  /** @nocollapse */
  static add(left, right) {
    const rtrn = new _Int128(new Uint32Array(left.buffer));
    return rtrn.plus(right);
  }
  /** @nocollapse */
  static from(val, out_buffer = new Uint32Array(4)) {
    return _Int128.fromString(
      typeof val === "string" ? val : val.toString(),
      out_buffer
    );
  }
  /** @nocollapse */
  static fromNumber(num, out_buffer = new Uint32Array(4)) {
    return _Int128.fromString(num.toString(), out_buffer);
  }
  /** @nocollapse */
  static fromString(str, out_buffer = new Uint32Array(4)) {
    const negate = str.startsWith("-");
    const length = str.length;
    const out = new _Int128(out_buffer);
    for (let posn = negate ? 1 : 0; posn < length; ) {
      const group = kInt32DecimalDigits < length - posn ? kInt32DecimalDigits : length - posn;
      const chunk = new _Int128(new Uint32Array([Number.parseInt(str.slice(posn, posn + group), 10), 0, 0, 0]));
      const multiple = new _Int128(new Uint32Array([kPowersOfTen[group], 0, 0, 0]));
      out.times(multiple);
      out.plus(chunk);
      posn += group;
    }
    return negate ? out.negate() : out;
  }
  /** @nocollapse */
  static convertArray(values) {
    const data = new Uint32Array(values.length * 4);
    for (let i = -1, n = values.length; ++i < n; ) {
      _Int128.from(values[i], new Uint32Array(data.buffer, data.byteOffset + 4 * 4 * i, 4));
    }
    return data;
  }
};

// src/util/interval.ts
var interval_exports = {};
__export(interval_exports, {
  toIntervalDayTimeInt32Array: () => toIntervalDayTimeInt32Array,
  toIntervalDayTimeObjects: () => toIntervalDayTimeObjects,
  toIntervalMonthDayNanoInt32Array: () => toIntervalMonthDayNanoInt32Array,
  toIntervalMonthDayNanoObjects: () => toIntervalMonthDayNanoObjects
});
function toIntervalDayTimeInt32Array(objects) {
  const length = objects.length;
  const array = new Int32Array(length * 2);
  for (let oi = 0, ai = 0; oi < length; oi++) {
    const interval = objects[oi];
    array[ai++] = interval["days"] ?? 0;
    array[ai++] = interval["milliseconds"] ?? 0;
  }
  return array;
}
function toIntervalMonthDayNanoInt32Array(objects) {
  const length = objects.length;
  const data = new Int32Array(length * 4);
  for (let oi = 0, ai = 0; oi < length; oi++) {
    const interval = objects[oi];
    data[ai++] = interval["months"] ?? 0;
    data[ai++] = interval["days"] ?? 0;
    const nanoseconds = interval["nanoseconds"];
    if (nanoseconds) {
      const ns = BigInt(nanoseconds);
      data[ai++] = Number(ns & BigInt(4294967295)) >>> 0;
      data[ai++] = Number(ns >> BigInt(32)) >>> 0;
    } else {
      ai += 2;
    }
  }
  return data;
}
function toIntervalDayTimeObjects(array) {
  const length = array.length;
  const objects = new Array(length / 2);
  for (let ai = 0, oi = 0; ai < length; ai += 2) {
    objects[oi++] = {
      "days": array[ai],
      "milliseconds": array[ai + 1]
    };
  }
  return objects;
}
function toIntervalMonthDayNanoObjects(array, stringifyNano) {
  const length = array.length;
  const objects = new Array(length / 4);
  for (let ai = 0, oi = 0; ai < length; ai += 4) {
    const nanoseconds = BigInt(array[ai + 3]) << BigInt(32) | BigInt(array[ai + 2] >>> 0);
    objects[oi++] = {
      "months": array[ai],
      "days": array[ai + 1],
      "nanoseconds": stringifyNano ? `${nanoseconds}` : nanoseconds
    };
  }
  return objects;
}

// src/visitor/vectorloader.ts
var VectorLoader = class extends Visitor {
  bytes;
  nodes;
  nodesIndex = -1;
  buffers;
  buffersIndex = -1;
  dictionaries;
  metadataVersion;
  variadicBufferCounts;
  variadicBufferIndex = -1;
  constructor(bytes, nodes, buffers, dictionaries, metadataVersion = 4 /* V5 */, variadicBufferCounts = []) {
    super();
    this.bytes = bytes;
    this.nodes = nodes;
    this.buffers = buffers;
    this.dictionaries = dictionaries;
    this.metadataVersion = metadataVersion;
    this.variadicBufferCounts = variadicBufferCounts;
  }
  visit(node) {
    return super.visit(node instanceof Field2 ? node.type : node);
  }
  visitNull(type, { length } = this.nextFieldNode()) {
    return makeData({ type, length });
  }
  visitBool(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitInt(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitFloat(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitUtf8(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
  }
  visitLargeUtf8(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
  }
  visitUtf8View(type, { length, nullCount } = this.nextFieldNode()) {
    const nullBitmap = this.readNullBitmap(type, nullCount);
    const views = this.readData(type);
    const variadicBuffers = this.readVariadicBuffers(this.nextVariadicBufferCount());
    return makeData({
      type,
      length,
      nullCount,
      nullBitmap,
      ["views"]: views,
      ["variadicBuffers"]: variadicBuffers
    });
  }
  visitBinary(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
  }
  visitLargeBinary(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), data: this.readData(type) });
  }
  visitBinaryView(type, { length, nullCount } = this.nextFieldNode()) {
    const nullBitmap = this.readNullBitmap(type, nullCount);
    const views = this.readData(type);
    const variadicBuffers = this.readVariadicBuffers(this.nextVariadicBufferCount());
    return makeData({
      type,
      length,
      nullCount,
      nullBitmap,
      ["views"]: views,
      ["variadicBuffers"]: variadicBuffers
    });
  }
  visitFixedSizeBinary(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitDate(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitTimestamp(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitTime(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitDecimal(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitList(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), "child": this.visit(type.children[0]) });
  }
  visitLargeList(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), "child": this.visit(type.children[0]) });
  }
  visitStruct(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), children: this.visitMany(type.children) });
  }
  visitUnion(type, { length, nullCount } = this.nextFieldNode()) {
    if (this.metadataVersion < 4 /* V5 */) {
      this.readNullBitmap(type, nullCount);
    }
    return type.mode === 0 /* Sparse */ ? this.visitSparseUnion(type, { length, nullCount }) : this.visitDenseUnion(type, { length, nullCount });
  }
  visitDenseUnion(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), valueOffsets: this.readOffsets(type), children: this.visitMany(type.children) });
  }
  visitSparseUnion(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, typeIds: this.readTypeIds(type), children: this.visitMany(type.children) });
  }
  visitDictionary(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type.indices), dictionary: this.readDictionary(type) });
  }
  visitInterval(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitDuration(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), data: this.readData(type) });
  }
  visitFixedSizeList(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), "child": this.visit(type.children[0]) });
  }
  visitMap(type, { length, nullCount } = this.nextFieldNode()) {
    return makeData({ type, length, nullCount, nullBitmap: this.readNullBitmap(type, nullCount), valueOffsets: this.readOffsets(type), "child": this.visit(type.children[0]) });
  }
  nextFieldNode() {
    return this.nodes[++this.nodesIndex];
  }
  nextBufferRange() {
    return this.buffers[++this.buffersIndex];
  }
  readNullBitmap(type, nullCount, buffer = this.nextBufferRange()) {
    return nullCount > 0 && this.readData(type, buffer) || new Uint8Array(0);
  }
  readOffsets(type, buffer) {
    return this.readData(type, buffer);
  }
  readTypeIds(type, buffer) {
    return this.readData(type, buffer);
  }
  readData(_type, { length, offset } = this.nextBufferRange()) {
    return this.bytes.subarray(offset, offset + length);
  }
  readVariadicBuffers(length) {
    return Array.from({ length }, () => this.readData(null));
  }
  nextVariadicBufferCount() {
    return this.variadicBufferCounts[++this.variadicBufferIndex] ?? 0;
  }
  readDictionary(type) {
    return this.dictionaries.get(type.id);
  }
};
var JSONVectorLoader = class extends VectorLoader {
  sources;
  constructor(sources, nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts = []) {
    super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
    this.sources = sources;
  }
  readNullBitmap(_type, nullCount, { offset } = this.nextBufferRange()) {
    return nullCount <= 0 ? new Uint8Array(0) : packBools(this.sources[offset]);
  }
  readOffsets(_type, { offset } = this.nextBufferRange()) {
    return toArrayBufferView(Uint8Array, toArrayBufferView(_type.OffsetArrayType, this.sources[offset]));
  }
  readTypeIds(type, { offset } = this.nextBufferRange()) {
    return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, this.sources[offset]));
  }
  readData(type, { offset } = this.nextBufferRange()) {
    const { sources } = this;
    if (DataType.isTimestamp(type)) {
      return toArrayBufferView(Uint8Array, Int644.convertArray(sources[offset]));
    } else if ((DataType.isInt(type) || DataType.isTime(type)) && type.bitWidth === 64 || DataType.isDuration(type)) {
      return toArrayBufferView(Uint8Array, Int644.convertArray(sources[offset]));
    } else if (DataType.isDate(type) && type.unit === 1 /* MILLISECOND */) {
      return toArrayBufferView(Uint8Array, Int644.convertArray(sources[offset]));
    } else if (DataType.isDecimal(type)) {
      return toArrayBufferView(Uint8Array, Int128.convertArray(sources[offset]));
    } else if (DataType.isBinary(type) || DataType.isLargeBinary(type) || DataType.isFixedSizeBinary(type)) {
      return binaryDataFromJSON(sources[offset]);
    } else if (DataType.isBinaryView(type)) {
      return binaryViewDataFromJSON(sources[offset]);
    } else if (DataType.isUtf8View(type)) {
      return utf8ViewDataFromJSON(sources[offset]);
    } else if (DataType.isBool(type)) {
      return packBools(sources[offset]);
    } else if (DataType.isUtf8(type) || DataType.isLargeUtf8(type)) {
      return encodeUtf8(sources[offset].join(""));
    } else if (DataType.isInterval(type)) {
      switch (type.unit) {
        case 1 /* DAY_TIME */:
          return toIntervalDayTimeInt32Array(sources[offset]);
        case 2 /* MONTH_DAY_NANO */:
          return toIntervalMonthDayNanoInt32Array(sources[offset]);
        default:
          break;
      }
    }
    return toArrayBufferView(Uint8Array, toArrayBufferView(type.ArrayType, sources[offset].map((x) => +x)));
  }
  readVariadicBuffers(length) {
    const buffers = [];
    for (let i = 0; i < length; i++) {
      const { offset } = this.nextBufferRange();
      const hexString = this.sources[offset];
      buffers.push(hexStringToBytes(hexString));
    }
    return buffers;
  }
};
function hexStringToBytes(hexString) {
  const data = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    data[i >> 1] = Number.parseInt(hexString.slice(i, i + 2), 16);
  }
  return data;
}
function binaryDataFromJSON(values) {
  return hexStringToBytes(values.join(""));
}
function parseViewDataFromJSON(views, parseInlined) {
  const data = new Uint8Array(views.length * 16);
  const dataView = new DataView(data.buffer);
  for (const [i, view] of views.entries()) {
    const offset = i * 16;
    const size = view["SIZE"];
    dataView.setInt32(offset, size, true);
    if (view["INLINED"] !== void 0) {
      const bytes = parseInlined(view["INLINED"]);
      for (let j = 0; j < bytes.length && j < 12; j++) {
        data[offset + 4 + j] = bytes[j];
      }
    } else {
      const prefix = view["PREFIX_HEX"];
      for (let j = 0; j < 8 && j < prefix.length; j += 2) {
        data[offset + 4 + (j >> 1)] = Number.parseInt(prefix.slice(j, j + 2), 16);
      }
      dataView.setInt32(offset + 8, view["BUFFER_INDEX"], true);
      dataView.setInt32(offset + 12, view["OFFSET"], true);
    }
  }
  return data;
}
function binaryViewDataFromJSON(views) {
  return parseViewDataFromJSON(views, (inlined) => {
    const bytes = new Uint8Array(inlined.length / 2);
    for (let i = 0; i < inlined.length; i += 2) {
      bytes[i >> 1] = Number.parseInt(inlined.slice(i, i + 2), 16);
    }
    return bytes;
  });
}
function utf8ViewDataFromJSON(views) {
  return parseViewDataFromJSON(views, (inlined) => {
    const encoder2 = new TextEncoder();
    return encoder2.encode(inlined);
  });
}
var CompressedVectorLoader = class extends VectorLoader {
  bodyChunks;
  constructor(bodyChunks, nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts = []) {
    super(new Uint8Array(0), nodes, buffers, dictionaries, metadataVersion, variadicBufferCounts);
    this.bodyChunks = bodyChunks;
  }
  readData(_type, _buffer = this.nextBufferRange()) {
    return this.bodyChunks[this.buffersIndex];
  }
};

// src/builder/binary.ts
var BinaryBuilder = class extends VariableWidthBuilder {
  constructor(opts) {
    super(opts);
    this._values = new BufferBuilder(Uint8Array);
  }
  get byteLength() {
    let size = this._pendingLength + this.length * 4;
    this._offsets && (size += this._offsets.byteLength);
    this._values && (size += this._values.byteLength);
    this._nulls && (size += this._nulls.byteLength);
    return size;
  }
  setValue(index, value) {
    return super.setValue(index, toUint8Array(value));
  }
  _flushPending(pending, pendingLength) {
    const offsets = this._offsets;
    const data = this._values.reserve(pendingLength).buffer;
    let offset = 0;
    for (const [index, value] of pending) {
      if (value === void 0) {
        offsets.set(index, 0);
      } else {
        const length = value.length;
        data.set(value, offset);
        offsets.set(index, length);
        offset += length;
      }
    }
  }
};

// src/builder/largebinary.ts
var LargeBinaryBuilder = class extends VariableWidthBuilder {
  constructor(opts) {
    super(opts);
    this._values = new BufferBuilder(Uint8Array);
  }
  get byteLength() {
    let size = this._pendingLength + this.length * 4;
    this._offsets && (size += this._offsets.byteLength);
    this._values && (size += this._values.byteLength);
    this._nulls && (size += this._nulls.byteLength);
    return size;
  }
  setValue(index, value) {
    return super.setValue(index, toUint8Array(value));
  }
  _flushPending(pending, pendingLength) {
    const offsets = this._offsets;
    const data = this._values.reserve(pendingLength).buffer;
    let offset = 0;
    for (const [index, value] of pending) {
      if (value === void 0) {
        offsets.set(index, BigInt(0));
      } else {
        const length = value.length;
        data.set(value, offset);
        offsets.set(index, BigInt(length));
        offset += length;
      }
    }
  }
};

// src/builder/bool.ts
var BoolBuilder = class extends Builder {
  constructor(options) {
    super(options);
    this._values = new BitmapBufferBuilder();
  }
  setValue(index, value) {
    this._values.set(index, +value);
  }
};

// src/builder/date.ts
var DateBuilder = class extends FixedWidthBuilder {
};
DateBuilder.prototype._setValue = setDate;
var DateDayBuilder = class extends DateBuilder {
};
DateDayBuilder.prototype._setValue = setDateDay;
var DateMillisecondBuilder = class extends DateBuilder {
};
DateMillisecondBuilder.prototype._setValue = setDateMillisecond;

// src/builder/decimal.ts
var DecimalBuilder = class extends FixedWidthBuilder {
};
DecimalBuilder.prototype._setValue = setDecimal;

// src/builder/dictionary.ts
var DictionaryBuilder = class extends Builder {
  _dictionaryOffset;
  _dictionary;
  _keysToIndices;
  indices;
  dictionary;
  constructor({ "type": type, "nullValues": nulls, "dictionaryHashFunction": hashFn }) {
    super({ type: new Dictionary(type.dictionary, type.indices, type.id, type.isOrdered) });
    this._nulls = null;
    this._dictionaryOffset = 0;
    this._keysToIndices = /* @__PURE__ */ Object.create(null);
    this.indices = makeBuilder({ "type": this.type.indices, "nullValues": nulls });
    this.dictionary = makeBuilder({ "type": this.type.dictionary, "nullValues": null });
    if (typeof hashFn === "function") {
      this.valueToKey = hashFn;
    }
  }
  get values() {
    return this.indices.values;
  }
  get nullCount() {
    return this.indices.nullCount;
  }
  get nullBitmap() {
    return this.indices.nullBitmap;
  }
  get byteLength() {
    return this.indices.byteLength + this.dictionary.byteLength;
  }
  get reservedLength() {
    return this.indices.reservedLength + this.dictionary.reservedLength;
  }
  get reservedByteLength() {
    return this.indices.reservedByteLength + this.dictionary.reservedByteLength;
  }
  isValid(value) {
    return this.indices.isValid(value);
  }
  setValid(index, valid) {
    const indices = this.indices;
    valid = indices.setValid(index, valid);
    this.length = indices.length;
    return valid;
  }
  setValue(index, value) {
    const keysToIndices = this._keysToIndices;
    const key = this.valueToKey(value);
    let idx = keysToIndices[key];
    if (idx === void 0) {
      keysToIndices[key] = idx = this._dictionaryOffset + this.dictionary.append(value).length - 1;
    }
    return this.indices.setValue(index, idx);
  }
  flush() {
    const type = this.type;
    const prev = this._dictionary;
    const curr = this.dictionary.toVector();
    const data = this.indices.flush().clone(type);
    data.dictionary = prev ? prev.concat(curr) : curr;
    this.finished || (this._dictionaryOffset += curr.length);
    this._dictionary = data.dictionary;
    this.clear();
    return data;
  }
  finish() {
    this.indices.finish();
    this.dictionary.finish();
    this._dictionaryOffset = 0;
    this._keysToIndices = /* @__PURE__ */ Object.create(null);
    return super.finish();
  }
  clear() {
    this.indices.clear();
    this.dictionary.clear();
    return super.clear();
  }
  valueToKey(val) {
    return typeof val === "string" ? val : `${val}`;
  }
};

// src/builder/fixedsizebinary.ts
var FixedSizeBinaryBuilder = class extends FixedWidthBuilder {
};
FixedSizeBinaryBuilder.prototype._setValue = setFixedSizeBinary;

// src/builder/fixedsizelist.ts
var FixedSizeListBuilder = class extends Builder {
  setValue(index, value) {
    const [child] = this.children;
    const start = index * this.stride;
    for (let i = -1, n = this.stride; ++i < n; ) {
      child.set(start + i, value[i]);
    }
  }
  setValid(index, valid) {
    if (!super.setValid(index, valid)) {
      this.children[0].setValid((index + 1) * this.stride - 1, false);
    }
    return valid;
  }
  addChild(child, name = "0") {
    if (this.numChildren > 0) {
      throw new Error("FixedSizeListBuilder can only have one child.");
    }
    const childIndex = this.children.push(child);
    this.type = new FixedSizeList2(this.type.listSize, new Field2(name, child.type, true));
    return childIndex;
  }
};

// src/builder/float.ts
var FloatBuilder = class extends FixedWidthBuilder {
  setValue(index, value) {
    this._values.set(index, value);
  }
};
var Float16Builder = class extends FloatBuilder {
  setValue(index, value) {
    super.setValue(index, float64ToUint16(value));
  }
};
var Float32Builder = class extends FloatBuilder {
};
var Float64Builder = class extends FloatBuilder {
};

// src/builder/interval.ts
var IntervalBuilder = class extends FixedWidthBuilder {
};
IntervalBuilder.prototype._setValue = setIntervalValue;
var IntervalDayTimeBuilder = class extends IntervalBuilder {
};
IntervalDayTimeBuilder.prototype._setValue = setIntervalDayTime;
var IntervalYearMonthBuilder = class extends IntervalBuilder {
};
IntervalYearMonthBuilder.prototype._setValue = setIntervalYearMonth;
var IntervalMonthDayNanoBuilder = class extends IntervalBuilder {
};
IntervalMonthDayNanoBuilder.prototype._setValue = setIntervalMonthDayNano;

// src/builder/duration.ts
var DurationBuilder = class extends FixedWidthBuilder {
};
DurationBuilder.prototype._setValue = setDuration;
var DurationSecondBuilder = class extends DurationBuilder {
};
DurationSecondBuilder.prototype._setValue = setDurationSecond;
var DurationMillisecondBuilder = class extends DurationBuilder {
};
DurationMillisecondBuilder.prototype._setValue = setDurationMillisecond;
var DurationMicrosecondBuilder = class extends DurationBuilder {
};
DurationMicrosecondBuilder.prototype._setValue = setDurationMicrosecond;
var DurationNanosecondBuilder = class extends DurationBuilder {
};
DurationNanosecondBuilder.prototype._setValue = setDurationNanosecond;

// src/builder/int.ts
var IntBuilder = class extends FixedWidthBuilder {
  setValue(index, value) {
    this._values.set(index, value);
  }
};
var Int8Builder = class extends IntBuilder {
};
var Int16Builder = class extends IntBuilder {
};
var Int32Builder = class extends IntBuilder {
};
var Int64Builder = class extends IntBuilder {
};
var Uint8Builder = class extends IntBuilder {
};
var Uint16Builder = class extends IntBuilder {
};
var Uint32Builder = class extends IntBuilder {
};
var Uint64Builder = class extends IntBuilder {
};

// src/builder/list.ts
var ListBuilder = class extends VariableWidthBuilder {
  _offsets;
  constructor(opts) {
    super(opts);
    this._offsets = new OffsetsBufferBuilder(opts.type);
  }
  addChild(child, name = "0") {
    if (this.numChildren > 0) {
      throw new Error("ListBuilder can only have one child.");
    }
    this.children[this.numChildren] = child;
    this.type = new List2(new Field2(name, child.type, true));
    return this.numChildren - 1;
  }
  _flushPending(pending) {
    const offsets = this._offsets;
    const [child] = this.children;
    for (const [index, value] of pending) {
      if (typeof value === "undefined") {
        offsets.set(index, 0);
      } else {
        const v = value;
        const n = v.length;
        const start = offsets.set(index, n).buffer[index];
        for (let i = -1; ++i < n; ) {
          child.set(start + i, v[i]);
        }
      }
    }
  }
};

// src/builder/largelist.ts
var LargeListBuilder = class extends VariableWidthBuilder {
  _offsets;
  constructor(opts) {
    super(opts);
    this._offsets = new OffsetsBufferBuilder(opts.type);
  }
  addChild(child, name = "0") {
    if (this.numChildren > 0) {
      throw new Error("LargeListBuilder can only have one child.");
    }
    this.children[this.numChildren] = child;
    this.type = new LargeList2(new Field2(name, child.type, true));
    return this.numChildren - 1;
  }
  _flushPending(pending) {
    const offsets = this._offsets;
    const [child] = this.children;
    for (const [index, value] of pending) {
      if (typeof value === "undefined") {
        offsets.set(index, BigInt(0));
      } else {
        const v = value;
        const n = v.length;
        const start = bigIntToNumber(offsets.set(index, BigInt(n)).buffer[index]);
        for (let i = -1; ++i < n; ) {
          child.set(start + i, v[i]);
        }
      }
    }
  }
};

// src/builder/map.ts
var MapBuilder = class extends VariableWidthBuilder {
  set(index, value) {
    return super.set(index, value);
  }
  setValue(index, value) {
    const row = value instanceof Map ? value : new Map(Object.entries(value));
    const pending = this._pending || (this._pending = /* @__PURE__ */ new Map());
    const current = pending.get(index);
    current && (this._pendingLength -= current.size);
    this._pendingLength += row.size;
    pending.set(index, row);
  }
  addChild(child, name = `${this.numChildren}`) {
    if (this.numChildren > 0) {
      throw new Error("ListBuilder can only have one child.");
    }
    this.children[this.numChildren] = child;
    this.type = new Map_(new Field2(name, child.type, true), this.type.keysSorted);
    return this.numChildren - 1;
  }
  _flushPending(pending) {
    const offsets = this._offsets;
    const [child] = this.children;
    for (const [index, value] of pending) {
      if (value === void 0) {
        offsets.set(index, 0);
      } else {
        let {
          [index]: idx,
          [index + 1]: end
        } = offsets.set(index, value.size).buffer;
        for (const val of value.entries()) {
          child.set(idx, val);
          if (++idx >= end) break;
        }
      }
    }
  }
};

// src/builder/null.ts
var NullBuilder = class extends Builder {
  // @ts-ignore
  setValue(index, value) {
  }
  setValid(index, valid) {
    this.length = Math.max(index + 1, this.length);
    return valid;
  }
};

// src/builder/struct.ts
var StructBuilder = class extends Builder {
  setValue(index, value) {
    const { children, type } = this;
    switch (Array.isArray(value) || value.constructor) {
      case true:
        return type.children.forEach((_, i) => children[i].set(index, value[i]));
      case Map:
        return type.children.forEach((f, i) => children[i].set(index, value.get(f.name)));
      default:
        return type.children.forEach((f, i) => children[i].set(index, value[f.name]));
    }
  }
  /** @inheritdoc */
  setValid(index, valid) {
    if (!super.setValid(index, valid)) {
      this.children.forEach((child) => child.setValid(index, valid));
    }
    return valid;
  }
  addChild(child, name = `${this.numChildren}`) {
    const childIndex = this.children.push(child);
    this.type = new Struct([...this.type.children, new Field2(name, child.type, true)]);
    return childIndex;
  }
};

// src/builder/timestamp.ts
var TimestampBuilder = class extends FixedWidthBuilder {
};
TimestampBuilder.prototype._setValue = setTimestamp;
var TimestampSecondBuilder = class extends TimestampBuilder {
};
TimestampSecondBuilder.prototype._setValue = setTimestampSecond;
var TimestampMillisecondBuilder = class extends TimestampBuilder {
};
TimestampMillisecondBuilder.prototype._setValue = setTimestampMillisecond;
var TimestampMicrosecondBuilder = class extends TimestampBuilder {
};
TimestampMicrosecondBuilder.prototype._setValue = setTimestampMicrosecond;
var TimestampNanosecondBuilder = class extends TimestampBuilder {
};
TimestampNanosecondBuilder.prototype._setValue = setTimestampNanosecond;

// src/builder/time.ts
var TimeBuilder = class extends FixedWidthBuilder {
};
TimeBuilder.prototype._setValue = setTime;
var TimeSecondBuilder = class extends TimeBuilder {
};
TimeSecondBuilder.prototype._setValue = setTimeSecond;
var TimeMillisecondBuilder = class extends TimeBuilder {
};
TimeMillisecondBuilder.prototype._setValue = setTimeMillisecond;
var TimeMicrosecondBuilder = class extends TimeBuilder {
};
TimeMicrosecondBuilder.prototype._setValue = setTimeMicrosecond;
var TimeNanosecondBuilder = class extends TimeBuilder {
};
TimeNanosecondBuilder.prototype._setValue = setTimeNanosecond;

// src/builder/union.ts
var UnionBuilder = class extends Builder {
  _typeIds;
  constructor(options) {
    super(options);
    this._typeIds = new DataBufferBuilder(Int8Array, 0, 1);
    if (typeof options["valueToChildTypeId"] === "function") {
      this._valueToChildTypeId = options["valueToChildTypeId"];
    }
  }
  get typeIdToChildIndex() {
    return this.type.typeIdToChildIndex;
  }
  append(value, childTypeId) {
    return this.set(this.length, value, childTypeId);
  }
  set(index, value, childTypeId) {
    if (childTypeId === void 0) {
      childTypeId = this._valueToChildTypeId(this, value, index);
    }
    this.setValue(index, value, childTypeId);
    return this;
  }
  setValue(index, value, childTypeId) {
    this._typeIds.set(index, childTypeId);
    const childIndex = this.type.typeIdToChildIndex[childTypeId];
    const child = this.children[childIndex];
    child?.set(index, value);
    this.length = Math.max(index + 1, this.length);
  }
  addChild(child, name = `${this.children.length}`) {
    const childTypeId = this.children.push(child);
    const { type: { children, mode, typeIds } } = this;
    const fields = [...children, new Field2(name, child.type)];
    this.type = new Union_(mode, [...typeIds, childTypeId], fields);
    return childTypeId;
  }
  /** @ignore */
  // @ts-ignore
  _valueToChildTypeId(builder, value, offset) {
    throw new Error(`Cannot map UnionBuilder value to child typeId. Pass the \`childTypeId\` as the second argument to unionBuilder.append(), or supply a \`valueToChildTypeId\` function as part of the UnionBuilder constructor options.`);
  }
};
var SparseUnionBuilder = class extends UnionBuilder {
};
var DenseUnionBuilder = class extends UnionBuilder {
  _offsets;
  constructor(options) {
    super(options);
    this._offsets = new DataBufferBuilder(Int32Array);
  }
  /** @ignore */
  setValue(index, value, childTypeId) {
    const id = this._typeIds.set(index, childTypeId).buffer[index];
    const child = this.getChildAt(this.type.typeIdToChildIndex[id]);
    const denseIndex = this._offsets.set(index, child.length).buffer[index];
    child?.set(denseIndex, value);
    this.length = Math.max(index + 1, this.length);
  }
};

// src/builder/utf8.ts
var Utf8Builder = class extends VariableWidthBuilder {
  constructor(opts) {
    super(opts);
    this._values = new BufferBuilder(Uint8Array);
  }
  get byteLength() {
    let size = this._pendingLength + this.length * 4;
    this._offsets && (size += this._offsets.byteLength);
    this._values && (size += this._values.byteLength);
    this._nulls && (size += this._nulls.byteLength);
    return size;
  }
  setValue(index, value) {
    return super.setValue(index, encodeUtf8(value));
  }
  // @ts-ignore
  _flushPending(pending, pendingLength) {
  }
};
Utf8Builder.prototype._flushPending = BinaryBuilder.prototype._flushPending;

// src/builder/largeutf8.ts
var LargeUtf8Builder = class extends VariableWidthBuilder {
  constructor(opts) {
    super(opts);
    this._values = new BufferBuilder(Uint8Array);
  }
  get byteLength() {
    let size = this._pendingLength + this.length * 4;
    this._offsets && (size += this._offsets.byteLength);
    this._values && (size += this._values.byteLength);
    this._nulls && (size += this._nulls.byteLength);
    return size;
  }
  setValue(index, value) {
    return super.setValue(index, encodeUtf8(value));
  }
  // @ts-ignore
  _flushPending(pending, pendingLength) {
  }
};
LargeUtf8Builder.prototype._flushPending = LargeBinaryBuilder.prototype._flushPending;

// src/builder/binaryview.ts
var BinaryViewBuilder = class extends Builder {
  _views;
  _variadicBuffers = [];
  _currentBuffer = null;
  _currentBufferIndex = 0;
  _currentBufferOffset = 0;
  _bufferSize = 32 * 1024 * 1024;
  // 32MB per buffer as per spec recommendation
  constructor(opts) {
    super(opts);
    this._views = new BufferBuilder(Uint8Array);
  }
  get byteLength() {
    let size = 0;
    this._views && (size += this._views.byteLength);
    this._nulls && (size += this._nulls.byteLength);
    for (const buffer of this._variadicBuffers) {
      size += buffer.byteLength;
    }
    this._currentBuffer && (size += this._currentBuffer.byteLength);
    return size;
  }
  setValue(index, value) {
    return this.writeBinaryValue(index, this.encodeValue(value));
  }
  writeBinaryValue(index, data) {
    const length = data.length;
    const bytesNeeded = (index + 1) * BinaryView2.ELEMENT_WIDTH;
    const currentBytes = this._views.length;
    if (bytesNeeded > currentBytes) {
      this._views.reserve(bytesNeeded - currentBytes);
    }
    const viewBuffer = this._views.buffer;
    const viewOffset = index * BinaryView2.ELEMENT_WIDTH;
    const view = new DataView(viewBuffer.buffer, viewBuffer.byteOffset + viewOffset, BinaryView2.ELEMENT_WIDTH);
    view.setInt32(BinaryView2.LENGTH_OFFSET, length, true);
    if (length <= BinaryView2.INLINE_CAPACITY) {
      viewBuffer.set(data, viewOffset + BinaryView2.INLINE_OFFSET);
      for (let i = length; i < BinaryView2.INLINE_CAPACITY; i++) {
        viewBuffer[viewOffset + BinaryView2.INLINE_OFFSET + i] = 0;
      }
    } else {
      const prefix = new DataView(data.buffer, data.byteOffset, Math.min(4, length));
      view.setUint32(BinaryView2.INLINE_OFFSET, prefix.getUint32(0, true), true);
      if (!this._currentBuffer || this._currentBufferOffset + length > this._bufferSize) {
        if (this._currentBuffer) {
          this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
        }
        this._currentBuffer = new BufferBuilder(Uint8Array);
        this._currentBufferIndex = this._variadicBuffers.length;
        this._currentBufferOffset = 0;
      }
      const bufferData = this._currentBuffer.reserve(length).buffer;
      bufferData.set(data, this._currentBufferOffset);
      view.setInt32(BinaryView2.BUFFER_INDEX_OFFSET, this._currentBufferIndex, true);
      view.setInt32(BinaryView2.BUFFER_OFFSET_OFFSET, this._currentBufferOffset, true);
      this._currentBufferOffset += length;
    }
    return this;
  }
  encodeValue(value) {
    return toUint8Array(value);
  }
  setValid(index, isValid) {
    const bytesNeeded = (index + 1) * BinaryView2.ELEMENT_WIDTH;
    const currentBytes = this._views.length;
    if (bytesNeeded > currentBytes) {
      this._views.reserve(bytesNeeded - currentBytes);
    }
    const result = super.setValid(index, isValid);
    if (!result) {
      const viewBuffer = this._views.buffer;
      const viewOffset = index * BinaryView2.ELEMENT_WIDTH;
      for (let i = 0; i < BinaryView2.ELEMENT_WIDTH; i++) {
        viewBuffer[viewOffset + i] = 0;
      }
    }
    return result;
  }
  clear() {
    this._variadicBuffers = [];
    this._currentBuffer = null;
    this._currentBufferIndex = 0;
    this._currentBufferOffset = 0;
    this._views.clear();
    return super.clear();
  }
  flush() {
    const { type, length, nullCount, _views, _nulls } = this;
    if (this._currentBuffer && this._currentBufferOffset > 0) {
      this._variadicBuffers.push(this._currentBuffer.buffer.slice(0, this._currentBufferOffset));
      this._currentBuffer = null;
      this._currentBufferOffset = 0;
    }
    const views = _views.flush(length * BinaryView2.ELEMENT_WIDTH);
    const nullBitmap = nullCount > 0 ? _nulls.flush(length) : void 0;
    const variadicBuffers = this._variadicBuffers.slice();
    this._variadicBuffers = [];
    this._currentBufferIndex = 0;
    this.clear();
    const props = {
      type,
      length,
      nullCount,
      nullBitmap,
      ["views"]: views,
      ["variadicBuffers"]: variadicBuffers
    };
    return makeData(props);
  }
  finish() {
    this.finished = true;
    return this;
  }
};

// src/builder/utf8view.ts
var Utf8ViewBuilder = class extends BinaryViewBuilder {
  constructor(opts) {
    super(opts);
  }
  setValue(index, value) {
    return this.writeBinaryValue(index, encodeUtf8(value));
  }
};

// src/visitor/builderctor.ts
var GetBuilderCtor = class extends Visitor {
  visitNull() {
    return NullBuilder;
  }
  visitBool() {
    return BoolBuilder;
  }
  visitInt() {
    return IntBuilder;
  }
  visitInt8() {
    return Int8Builder;
  }
  visitInt16() {
    return Int16Builder;
  }
  visitInt32() {
    return Int32Builder;
  }
  visitInt64() {
    return Int64Builder;
  }
  visitUint8() {
    return Uint8Builder;
  }
  visitUint16() {
    return Uint16Builder;
  }
  visitUint32() {
    return Uint32Builder;
  }
  visitUint64() {
    return Uint64Builder;
  }
  visitFloat() {
    return FloatBuilder;
  }
  visitFloat16() {
    return Float16Builder;
  }
  visitFloat32() {
    return Float32Builder;
  }
  visitFloat64() {
    return Float64Builder;
  }
  visitUtf8() {
    return Utf8Builder;
  }
  visitLargeUtf8() {
    return LargeUtf8Builder;
  }
  visitBinary() {
    return BinaryBuilder;
  }
  visitLargeBinary() {
    return LargeBinaryBuilder;
  }
  visitFixedSizeBinary() {
    return FixedSizeBinaryBuilder;
  }
  visitDate() {
    return DateBuilder;
  }
  visitDateDay() {
    return DateDayBuilder;
  }
  visitDateMillisecond() {
    return DateMillisecondBuilder;
  }
  visitTimestamp() {
    return TimestampBuilder;
  }
  visitTimestampSecond() {
    return TimestampSecondBuilder;
  }
  visitTimestampMillisecond() {
    return TimestampMillisecondBuilder;
  }
  visitTimestampMicrosecond() {
    return TimestampMicrosecondBuilder;
  }
  visitTimestampNanosecond() {
    return TimestampNanosecondBuilder;
  }
  visitTime() {
    return TimeBuilder;
  }
  visitTimeSecond() {
    return TimeSecondBuilder;
  }
  visitTimeMillisecond() {
    return TimeMillisecondBuilder;
  }
  visitTimeMicrosecond() {
    return TimeMicrosecondBuilder;
  }
  visitTimeNanosecond() {
    return TimeNanosecondBuilder;
  }
  visitDecimal() {
    return DecimalBuilder;
  }
  visitList() {
    return ListBuilder;
  }
  visitLargeList() {
    return LargeListBuilder;
  }
  visitStruct() {
    return StructBuilder;
  }
  visitUnion() {
    return UnionBuilder;
  }
  visitDenseUnion() {
    return DenseUnionBuilder;
  }
  visitSparseUnion() {
    return SparseUnionBuilder;
  }
  visitDictionary() {
    return DictionaryBuilder;
  }
  visitInterval() {
    return IntervalBuilder;
  }
  visitIntervalDayTime() {
    return IntervalDayTimeBuilder;
  }
  visitIntervalYearMonth() {
    return IntervalYearMonthBuilder;
  }
  visitIntervalMonthDayNano() {
    return IntervalMonthDayNanoBuilder;
  }
  visitDuration() {
    return DurationBuilder;
  }
  visitDurationSecond() {
    return DurationSecondBuilder;
  }
  visitDurationMillisecond() {
    return DurationMillisecondBuilder;
  }
  visitDurationMicrosecond() {
    return DurationMicrosecondBuilder;
  }
  visitDurationNanosecond() {
    return DurationNanosecondBuilder;
  }
  visitFixedSizeList() {
    return FixedSizeListBuilder;
  }
  visitMap() {
    return MapBuilder;
  }
  visitBinaryView() {
    return BinaryViewBuilder;
  }
  visitUtf8View() {
    return Utf8ViewBuilder;
  }
};
var instance6 = new GetBuilderCtor();

// src/visitor/typecomparator.ts
var TypeComparator = class extends Visitor {
  compareSchemas(schema, other) {
    return schema === other || other instanceof schema.constructor && this.compareManyFields(schema.fields, other.fields);
  }
  compareManyFields(fields, others) {
    return fields === others || Array.isArray(fields) && Array.isArray(others) && fields.length === others.length && fields.every((f, i) => this.compareFields(f, others[i]));
  }
  compareFields(field, other) {
    return field === other || other instanceof field.constructor && field.name === other.name && field.nullable === other.nullable && this.visit(field.type, other.type);
  }
};
function compareConstructor(type, other) {
  return other instanceof type.constructor;
}
function compareAny(type, other) {
  return type === other || compareConstructor(type, other);
}
function compareInt(type, other) {
  return type === other || compareConstructor(type, other) && type.bitWidth === other.bitWidth && type.isSigned === other.isSigned;
}
function compareFloat(type, other) {
  return type === other || compareConstructor(type, other) && type.precision === other.precision;
}
function compareFixedSizeBinary(type, other) {
  return type === other || compareConstructor(type, other) && type.byteWidth === other.byteWidth;
}
function compareDate(type, other) {
  return type === other || compareConstructor(type, other) && type.unit === other.unit;
}
function compareTimestamp(type, other) {
  return type === other || compareConstructor(type, other) && type.unit === other.unit && type.timezone === other.timezone;
}
function compareTime(type, other) {
  return type === other || compareConstructor(type, other) && type.unit === other.unit && type.bitWidth === other.bitWidth;
}
function compareList(type, other) {
  return type === other || compareConstructor(type, other) && type.children.length === other.children.length && instance7.compareManyFields(type.children, other.children);
}
function compareStruct(type, other) {
  return type === other || compareConstructor(type, other) && type.children.length === other.children.length && instance7.compareManyFields(type.children, other.children);
}
function compareUnion(type, other) {
  return type === other || compareConstructor(type, other) && type.mode === other.mode && type.typeIds.every((x, i) => x === other.typeIds[i]) && instance7.compareManyFields(type.children, other.children);
}
function compareDictionary(type, other) {
  return type === other || compareConstructor(type, other) && type.id === other.id && type.isOrdered === other.isOrdered && instance7.visit(type.indices, other.indices) && instance7.visit(type.dictionary, other.dictionary);
}
function compareInterval(type, other) {
  return type === other || compareConstructor(type, other) && type.unit === other.unit;
}
function compareDuration(type, other) {
  return type === other || compareConstructor(type, other) && type.unit === other.unit;
}
function compareFixedSizeList(type, other) {
  return type === other || compareConstructor(type, other) && type.listSize === other.listSize && type.children.length === other.children.length && instance7.compareManyFields(type.children, other.children);
}
function compareMap(type, other) {
  return type === other || compareConstructor(type, other) && type.keysSorted === other.keysSorted && type.children.length === other.children.length && instance7.compareManyFields(type.children, other.children);
}
TypeComparator.prototype.visitNull = compareAny;
TypeComparator.prototype.visitBool = compareAny;
TypeComparator.prototype.visitInt = compareInt;
TypeComparator.prototype.visitInt8 = compareInt;
TypeComparator.prototype.visitInt16 = compareInt;
TypeComparator.prototype.visitInt32 = compareInt;
TypeComparator.prototype.visitInt64 = compareInt;
TypeComparator.prototype.visitUint8 = compareInt;
TypeComparator.prototype.visitUint16 = compareInt;
TypeComparator.prototype.visitUint32 = compareInt;
TypeComparator.prototype.visitUint64 = compareInt;
TypeComparator.prototype.visitFloat = compareFloat;
TypeComparator.prototype.visitFloat16 = compareFloat;
TypeComparator.prototype.visitFloat32 = compareFloat;
TypeComparator.prototype.visitFloat64 = compareFloat;
TypeComparator.prototype.visitUtf8 = compareAny;
TypeComparator.prototype.visitLargeUtf8 = compareAny;
TypeComparator.prototype.visitUtf8View = compareAny;
TypeComparator.prototype.visitBinary = compareAny;
TypeComparator.prototype.visitLargeBinary = compareAny;
TypeComparator.prototype.visitBinaryView = compareAny;
TypeComparator.prototype.visitFixedSizeBinary = compareFixedSizeBinary;
TypeComparator.prototype.visitDate = compareDate;
TypeComparator.prototype.visitDateDay = compareDate;
TypeComparator.prototype.visitDateMillisecond = compareDate;
TypeComparator.prototype.visitTimestamp = compareTimestamp;
TypeComparator.prototype.visitTimestampSecond = compareTimestamp;
TypeComparator.prototype.visitTimestampMillisecond = compareTimestamp;
TypeComparator.prototype.visitTimestampMicrosecond = compareTimestamp;
TypeComparator.prototype.visitTimestampNanosecond = compareTimestamp;
TypeComparator.prototype.visitTime = compareTime;
TypeComparator.prototype.visitTimeSecond = compareTime;
TypeComparator.prototype.visitTimeMillisecond = compareTime;
TypeComparator.prototype.visitTimeMicrosecond = compareTime;
TypeComparator.prototype.visitTimeNanosecond = compareTime;
TypeComparator.prototype.visitDecimal = compareAny;
TypeComparator.prototype.visitList = compareList;
TypeComparator.prototype.visitLargeList = compareList;
TypeComparator.prototype.visitStruct = compareStruct;
TypeComparator.prototype.visitUnion = compareUnion;
TypeComparator.prototype.visitDenseUnion = compareUnion;
TypeComparator.prototype.visitSparseUnion = compareUnion;
TypeComparator.prototype.visitDictionary = compareDictionary;
TypeComparator.prototype.visitInterval = compareInterval;
TypeComparator.prototype.visitIntervalDayTime = compareInterval;
TypeComparator.prototype.visitIntervalYearMonth = compareInterval;
TypeComparator.prototype.visitIntervalMonthDayNano = compareInterval;
TypeComparator.prototype.visitDuration = compareDuration;
TypeComparator.prototype.visitDurationSecond = compareDuration;
TypeComparator.prototype.visitDurationMillisecond = compareDuration;
TypeComparator.prototype.visitDurationMicrosecond = compareDuration;
TypeComparator.prototype.visitDurationNanosecond = compareDuration;
TypeComparator.prototype.visitFixedSizeList = compareFixedSizeList;
TypeComparator.prototype.visitMap = compareMap;
var instance7 = new TypeComparator();
function compareSchemas(schema, other) {
  return instance7.compareSchemas(schema, other);
}
function compareFields(field, other) {
  return instance7.compareFields(field, other);
}
function compareTypes(type, other) {
  return instance7.visit(type, other);
}

// src/factories.ts
function makeBuilder(options) {
  const type = options.type;
  const builder = new (instance6.getVisitFn(type)())(options);
  if (type.children && type.children.length > 0) {
    const children = options["children"] || [];
    const defaultOptions = { "nullValues": options["nullValues"] };
    const getChildOptions = Array.isArray(children) ? ((_, i) => children[i] || defaultOptions) : (({ name }) => children[name] || defaultOptions);
    for (const [index, field] of type.children.entries()) {
      const { type: type2 } = field;
      const opts = getChildOptions(field, index);
      builder.children.push(makeBuilder({ ...opts, type: type2 }));
    }
  }
  return builder;
}
function vectorFromArray(init, type) {
  if (init instanceof Data || init instanceof Vector || init.type instanceof DataType || ArrayBuffer.isView(init)) {
    return makeVector(init);
  }
  const options = { type: type ?? inferType(init), nullValues: [null] };
  const chunks = [...builderThroughIterable(options)(init)];
  const vector = chunks.length === 1 ? chunks[0] : chunks.reduce((a, b) => a.concat(b));
  if (DataType.isDictionary(vector.type)) {
    return vector.memoize();
  }
  return vector;
}
function tableFromJSON(array) {
  const vector = vectorFromArray(array);
  const batch = new RecordBatch3(new Schema2(vector.type.children), vector.data[0]);
  return new Table(batch);
}
function inferType(value) {
  if (value.length === 0) {
    return new Null2();
  }
  let nullsCount = 0;
  let arraysCount = 0;
  let objectsCount = 0;
  let numbersCount = 0;
  let stringsCount = 0;
  let bigintsCount = 0;
  let booleansCount = 0;
  let datesCount = 0;
  for (const val of value) {
    if (val == null) {
      ++nullsCount;
      continue;
    }
    switch (typeof val) {
      case "bigint":
        ++bigintsCount;
        continue;
      case "boolean":
        ++booleansCount;
        continue;
      case "number":
        ++numbersCount;
        continue;
      case "string":
        ++stringsCount;
        continue;
      case "object":
        if (Array.isArray(val)) {
          ++arraysCount;
        } else if (Object.prototype.toString.call(val) === "[object Date]") {
          ++datesCount;
        } else {
          ++objectsCount;
        }
        continue;
    }
    throw new TypeError("Unable to infer Vector type from input values, explicit type declaration expected.");
  }
  if (numbersCount + nullsCount === value.length) {
    return new Float64();
  } else if (stringsCount + nullsCount === value.length) {
    return new Dictionary(new Utf82(), new Int32());
  } else if (bigintsCount + nullsCount === value.length) {
    return new Int64();
  } else if (booleansCount + nullsCount === value.length) {
    return new Bool2();
  } else if (datesCount + nullsCount === value.length) {
    return new TimestampMillisecond();
  } else if (arraysCount + nullsCount === value.length) {
    const array = value;
    const childType = inferType(array[array.findIndex((ary) => ary != null)]);
    if (array.every((ary) => ary == null || compareTypes(childType, inferType(ary)))) {
      return new List2(new Field2("", childType, true));
    }
  } else if (objectsCount + nullsCount === value.length) {
    const fields = /* @__PURE__ */ new Map();
    for (const row of value) {
      for (const key of Object.keys(row)) {
        if (!fields.has(key) && row[key] != null) {
          fields.set(key, new Field2(key, inferType([row[key]]), true));
        }
      }
    }
    return new Struct([...fields.values()]);
  }
  throw new TypeError("Unable to infer Vector type from input values, explicit type declaration expected.");
}
function builderThroughIterable(options) {
  const { ["queueingStrategy"]: queueingStrategy = "count" } = options;
  const { ["highWaterMark"]: highWaterMark = queueingStrategy !== "bytes" ? Number.POSITIVE_INFINITY : 2 ** 14 } = options;
  const sizeProperty = queueingStrategy !== "bytes" ? "length" : "byteLength";
  return function* (source) {
    let numChunks = 0;
    const builder = makeBuilder(options);
    for (const value of source) {
      if (builder.append(value)[sizeProperty] >= highWaterMark) {
        ++numChunks && (yield builder.toVector());
      }
    }
    if (builder.finish().length > 0 || numChunks === 0) {
      yield builder.toVector();
    }
  };
}
function builderThroughAsyncIterable(options) {
  const { ["queueingStrategy"]: queueingStrategy = "count" } = options;
  const { ["highWaterMark"]: highWaterMark = queueingStrategy !== "bytes" ? Number.POSITIVE_INFINITY : 2 ** 14 } = options;
  const sizeProperty = queueingStrategy !== "bytes" ? "length" : "byteLength";
  return async function* (source) {
    let numChunks = 0;
    const builder = makeBuilder(options);
    for await (const value of source) {
      if (builder.append(value)[sizeProperty] >= highWaterMark) {
        ++numChunks && (yield builder.toVector());
      }
    }
    if (builder.finish().length > 0 || numChunks === 0) {
      yield builder.toVector();
    }
  };
}

// src/util/recordbatch.ts
function distributeVectorsIntoRecordBatches(schema, vecs) {
  return uniformlyDistributeChunksAcrossRecordBatches(schema, vecs.map((v) => v.data.concat()));
}
function uniformlyDistributeChunksAcrossRecordBatches(schema, cols) {
  const fields = [...schema.fields];
  const batches = [];
  const memo = { numBatches: cols.reduce((n, c) => Math.max(n, c.length), 0) };
  let numBatches = 0, batchLength = 0;
  let i = -1;
  const numColumns = cols.length;
  let child, children = [];
  while (memo.numBatches-- > 0) {
    for (batchLength = Number.POSITIVE_INFINITY, i = -1; ++i < numColumns; ) {
      children[i] = child = cols[i].shift();
      batchLength = Math.min(batchLength, child ? child.length : batchLength);
    }
    if (Number.isFinite(batchLength)) {
      children = distributeChildren(fields, batchLength, children, cols, memo);
      if (batchLength > 0) {
        batches[numBatches++] = makeData({
          type: new Struct(fields),
          length: batchLength,
          nullCount: 0,
          children: children.slice()
        });
      }
    }
  }
  return [
    schema = schema.assign(fields),
    batches.map((data) => new RecordBatch3(schema, data))
  ];
}
function distributeChildren(fields, batchLength, children, columns, memo) {
  const nullBitmapSize = (batchLength + 63 & ~63) >> 3;
  for (let i = -1, n = columns.length; ++i < n; ) {
    const child = children[i];
    const length = child?.length;
    if (length >= batchLength) {
      if (length === batchLength) {
        children[i] = child;
      } else {
        children[i] = child.slice(0, batchLength);
        memo.numBatches = Math.max(memo.numBatches, columns[i].unshift(
          child.slice(batchLength, length - batchLength)
        ));
      }
    } else {
      const field = fields[i];
      fields[i] = field.clone({ nullable: true });
      children[i] = child?._changeLengthAndBackfillNullBitmap(batchLength) ?? makeData({
        type: field.type,
        length: batchLength,
        nullCount: batchLength,
        nullBitmap: new Uint8Array(nullBitmapSize)
      });
    }
  }
  return children;
}

// src/table.ts
var kTableSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/Table");
var Table = class _Table {
  /**
   * Check if an object is an instance of Table.
   * This works across different instances of the Arrow library.
   */
  /** @nocollapse */
  static isTable(x) {
    return x?.[kTableSymbol] === true;
  }
  constructor(...args) {
    if (args.length === 0) {
      this.batches = [];
      this.schema = new Schema2([]);
      this._offsets = [0];
      return this;
    }
    let schema;
    let offsets;
    if (args[0] instanceof Schema2) {
      schema = args.shift();
    }
    if (args.at(-1) instanceof Uint32Array) {
      offsets = args.pop();
    }
    const unwrap = (x) => {
      if (x) {
        if (x instanceof RecordBatch3) {
          return [x];
        } else if (x instanceof _Table) {
          return x.batches;
        } else if (x instanceof Data) {
          if (x.type instanceof Struct) {
            return [new RecordBatch3(new Schema2(x.type.children), x)];
          }
        } else if (Array.isArray(x)) {
          return x.flatMap((v) => unwrap(v));
        } else if (typeof x[Symbol.iterator] === "function") {
          return [...x].flatMap((v) => unwrap(v));
        } else if (typeof x === "object") {
          const keys = Object.keys(x);
          const vecs = keys.map((k) => new Vector([x[k]]));
          const batchSchema = schema ?? new Schema2(keys.map((k, i) => new Field2(String(k), vecs[i].type, vecs[i].nullable)));
          const [, batches2] = distributeVectorsIntoRecordBatches(batchSchema, vecs);
          return batches2.length === 0 ? [new RecordBatch3(x)] : batches2;
        }
      }
      return [];
    };
    const batches = args.flatMap((v) => unwrap(v));
    schema = schema ?? batches[0]?.schema ?? new Schema2([]);
    if (!(schema instanceof Schema2)) {
      throw new TypeError("Table constructor expects a [Schema, RecordBatch[]] pair.");
    }
    for (const batch of batches) {
      if (!(batch instanceof RecordBatch3)) {
        throw new TypeError("Table constructor expects a [Schema, RecordBatch[]] pair.");
      }
      if (!compareSchemas(schema, batch.schema)) {
        throw new TypeError("Table and inner RecordBatch schemas must be equivalent.");
      }
    }
    this.schema = schema;
    this.batches = batches;
    this._offsets = offsets ?? computeChunkOffsets(this.data);
  }
  /**
   * The contiguous {@link RecordBatch `RecordBatch`} chunks of the Table rows.
   */
  get data() {
    return this.batches.map(({ data }) => data);
  }
  /**
   * The number of columns in this Table.
   */
  get numCols() {
    return this.schema.fields.length;
  }
  /**
   * The number of rows in this Table.
   */
  get numRows() {
    return this.data.reduce((numRows, data) => numRows + data.length, 0);
  }
  /**
   * The number of null rows in this Table.
   */
  get nullCount() {
    if (this._nullCount === -1) {
      this._nullCount = computeChunkNullCounts(this.data);
    }
    return this._nullCount;
  }
  /**
   * Check whether an element is null.
   *
   * @param index The index at which to read the validity bitmap.
   */
  // @ts-ignore
  isValid(index) {
    return false;
  }
  /**
   * Get an element value by position.
   *
   * @param index The index of the element to read.
   */
  // @ts-ignore
  get(index) {
    return null;
  }
  /**
    * Get an element value by position.
    * @param index The index of the element to read. A negative index will count back from the last element.
    */
  // @ts-ignore
  at(index) {
    return this.get(wrapIndex(index, this.numRows));
  }
  /**
   * Set an element value by position.
   *
   * @param index The index of the element to write.
   * @param value The value to set.
   */
  // @ts-ignore
  set(index, value) {
    return;
  }
  /**
   * Retrieve the index of the first occurrence of a value in an Vector.
   *
   * @param element The value to locate in the Vector.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  // @ts-ignore
  indexOf(element, offset) {
    return -1;
  }
  /**
   * Iterator for rows in this Table.
   */
  [Symbol.iterator]() {
    if (this.batches.length > 0) {
      return instance4.visit(new Vector(this.data));
    }
    return new Array(0)[Symbol.iterator]();
  }
  /**
   * Return a JavaScript Array of the Table rows.
   *
   * @returns An Array of Table rows.
   */
  toArray() {
    return [...this];
  }
  /**
   * Returns a string representation of the Table rows.
   *
   * @returns A string representation of the Table rows.
   */
  toString() {
    return `[
  ${this.toArray().join(",\n  ")}
]`;
  }
  /**
   * Combines two or more Tables of the same schema.
   *
   * @param others Additional Tables to add to the end of this Tables.
   */
  concat(...others) {
    const schema = this.schema;
    const data = this.data.concat(others.flatMap(({ data: data2 }) => data2));
    return new _Table(schema, data.map((data2) => new RecordBatch3(schema, data2)));
  }
  /**
   * Return a zero-copy sub-section of this Table.
   *
   * @param begin The beginning of the specified portion of the Table.
   * @param end The end of the specified portion of the Table. This is exclusive of the element at the index 'end'.
   */
  slice(begin, end) {
    const schema = this.schema;
    [begin, end] = clampRange({ length: this.numRows }, begin, end);
    const data = sliceChunks(this.data, this._offsets, begin, end);
    return new _Table(schema, data.map((chunk) => new RecordBatch3(schema, chunk)));
  }
  /**
   * Returns a child Vector by name, or null if this Vector has no child with the given name.
   *
   * @param name The name of the child to retrieve.
   */
  getChild(name) {
    return this.getChildAt(this.schema.fields.findIndex((f) => f.name === name));
  }
  /**
   * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
   *
   * @param index The index of the child to retrieve.
   */
  getChildAt(index) {
    if (index > -1 && index < this.schema.fields.length) {
      const data = this.data.map((data2) => data2.children[index]);
      if (data.length === 0) {
        const { type } = this.schema.fields[index];
        const empty = makeData({ type, length: 0, nullCount: 0 });
        data.push(empty._changeLengthAndBackfillNullBitmap(this.numRows));
      }
      return new Vector(data);
    }
    return null;
  }
  /**
   * Sets a child Vector by name.
   *
   * @param name The name of the child to overwrite.
   * @returns A new Table with the supplied child for the specified name.
   */
  setChild(name, child) {
    return this.setChildAt(this.schema.fields?.findIndex((f) => f.name === name), child);
  }
  setChildAt(index, child) {
    let schema = this.schema;
    let batches = [...this.batches];
    if (index > -1 && index < this.numCols) {
      if (!child) {
        child = new Vector([makeData({ type: new Null2(), length: this.numRows })]);
      }
      const fields = schema.fields.slice();
      const field = fields[index].clone({ type: child.type });
      const children = this.schema.fields.map((_, i) => this.getChildAt(i));
      [fields[index], children[index]] = [field, child];
      [schema, batches] = distributeVectorsIntoRecordBatches(schema, children);
    }
    return new _Table(schema, batches);
  }
  /**
   * Construct a new Table containing only specified columns.
   *
   * @param columnNames Names of columns to keep.
   * @returns A new Table of columns matching the specified names.
   */
  select(columnNames) {
    const nameToIndex = this.schema.fields.reduce((m, f, i) => m.set(f.name, i), /* @__PURE__ */ new Map());
    return this.selectAt(columnNames.map((columnName) => nameToIndex.get(columnName)).filter((x) => x > -1));
  }
  /**
   * Construct a new Table containing only columns at the specified indices.
   *
   * @param columnIndices Indices of columns to keep.
   * @returns A new Table of columns at the specified indices.
   */
  selectAt(columnIndices) {
    const schema = this.schema.selectAt(columnIndices);
    const data = this.batches.map((batch) => batch.selectAt(columnIndices));
    return new _Table(schema, data);
  }
  assign(other) {
    const fields = this.schema.fields;
    const [indices, oldToNew] = other.schema.fields.reduce((memo, f2, newIdx) => {
      const [indices2, oldToNew2] = memo;
      const i = fields.findIndex((f) => f.name === f2.name);
      ~i ? oldToNew2[i] = newIdx : indices2.push(newIdx);
      return memo;
    }, [[], []]);
    const schema = this.schema.assign(other.schema);
    const columns = [
      ...fields.map((_, i) => [i, oldToNew[i]]).map(([i, j]) => j === void 0 ? this.getChildAt(i) : other.getChildAt(j)),
      ...indices.map((i) => other.getChildAt(i))
    ].filter(Boolean);
    return new _Table(...distributeVectorsIntoRecordBatches(schema, columns));
  }
  // Initialize this static property via an IIFE so bundlers don't tree-shake
  // out this logic, but also so we're still compliant with `"sideEffects": false`
  static [Symbol.toStringTag] = ((proto) => {
    proto.schema = null;
    proto.batches = [];
    proto._offsets = new Uint32Array([0]);
    proto._nullCount = -1;
    proto[Symbol.isConcatSpreadable] = true;
    proto[kTableSymbol] = true;
    proto["isValid"] = wrapChunkedCall1(isChunkedValid);
    proto["get"] = wrapChunkedCall1(instance2.getVisitFn(13 /* Struct */));
    proto["set"] = wrapChunkedCall2(instance.getVisitFn(13 /* Struct */));
    proto["indexOf"] = wrapChunkedIndexOf(instance3.getVisitFn(13 /* Struct */));
    return "Table";
  })(_Table.prototype);
};
Object.defineProperty(Table, Symbol.hasInstance, {
  value: function isTableInstance(instance8) {
    return Function.prototype[Symbol.hasInstance].call(this, instance8) || this === Table && Table.isTable(instance8);
  }
});
function makeTable(input) {
  const vecs = {};
  const inputs = Object.entries(input);
  for (const [key, col] of inputs) {
    vecs[key] = makeVector(col);
  }
  return new Table(vecs);
}
function tableFromArrays(input) {
  const vecs = {};
  const inputs = Object.entries(input);
  for (const [key, col] of inputs) {
    vecs[key] = vectorFromArray(col);
  }
  return new Table(vecs);
}

// src/recordbatch.ts
var kRecordBatchSymbol = /* @__PURE__ */ Symbol.for("apache-arrow/RecordBatch");
var RecordBatch3 = class _RecordBatch {
  /**
   * Check if an object is an instance of RecordBatch.
   * This works across different instances of the Arrow library.
   */
  /** @nocollapse */
  static isRecordBatch(x) {
    return x?.[kRecordBatchSymbol] === true;
  }
  constructor(...args) {
    switch (args.length) {
      case 3:
      case 2: {
        [this.schema] = args;
        if (!(this.schema instanceof Schema2)) {
          throw new TypeError("RecordBatch constructor expects a [Schema, Data] pair.");
        }
        [
          ,
          this.data = makeData({
            nullCount: 0,
            type: new Struct(this.schema.fields),
            children: this.schema.fields.map((f) => makeData({ type: f.type, nullCount: 0 }))
          }),
          this._metadata = /* @__PURE__ */ new Map()
        ] = args;
        if (!(this.data instanceof Data)) {
          throw new TypeError("RecordBatch constructor expects a [Schema, Data] pair.");
        }
        [this.schema, this.data] = ensureSameLengthData(this.schema, this.data.children, this.data.length);
        break;
      }
      case 1: {
        const [obj] = args;
        const { fields, children, length } = Object.keys(obj).reduce((memo, name, i) => {
          memo.children[i] = obj[name];
          memo.length = Math.max(memo.length, obj[name].length);
          memo.fields[i] = Field2.new({ name, type: obj[name].type, nullable: true });
          return memo;
        }, {
          length: 0,
          fields: new Array(),
          children: new Array()
        });
        const schema = new Schema2(fields);
        const data = makeData({ type: new Struct(fields), length, children, nullCount: 0 });
        [this.schema, this.data] = ensureSameLengthData(schema, data.children, length);
        this._metadata = /* @__PURE__ */ new Map();
        break;
      }
      default:
        throw new TypeError("RecordBatch constructor expects an Object mapping names to child Data, or a [Schema, Data] pair.");
    }
  }
  _dictionaries;
  _metadata;
  schema;
  data;
  /**
   * Custom metadata for this RecordBatch.
   */
  get metadata() {
    return this._metadata;
  }
  get dictionaries() {
    return this._dictionaries || (this._dictionaries = collectDictionaries(this.schema.fields, this.data.children));
  }
  /**
   * The number of columns in this RecordBatch.
   */
  get numCols() {
    return this.schema.fields.length;
  }
  /**
   * The number of rows in this RecordBatch.
   */
  get numRows() {
    return this.data.length;
  }
  /**
   * The number of null rows in this RecordBatch.
   */
  get nullCount() {
    return this.data.nullCount;
  }
  /**
   * Check whether an row is null.
   * @param index The index at which to read the validity bitmap.
   */
  isValid(index) {
    return this.data.getValid(index);
  }
  /**
   * Get a row by position.
   * @param index The index of the row to read.
   */
  get(index) {
    return instance2.visit(this.data, index);
  }
  /**
    * Get a row value by position.
    * @param index The index of the row to read. A negative index will count back from the last row.
    */
  at(index) {
    return this.get(wrapIndex(index, this.numRows));
  }
  /**
   * Set a row by position.
   * @param index The index of the row to write.
   * @param value The value to set.
   */
  set(index, value) {
    return instance.visit(this.data, index, value);
  }
  /**
   * Retrieve the index of the first occurrence of a row in an RecordBatch.
   * @param element The row to locate in the RecordBatch.
   * @param offset The index at which to begin the search. If offset is omitted, the search starts at index 0.
   */
  indexOf(element, offset) {
    return instance3.visit(this.data, element, offset);
  }
  /**
   * Iterator for rows in this RecordBatch.
   */
  [Symbol.iterator]() {
    return instance4.visit(new Vector([this.data]));
  }
  /**
   * Return a JavaScript Array of the RecordBatch rows.
   * @returns An Array of RecordBatch rows.
   */
  toArray() {
    return [...this];
  }
  /**
   * Combines two or more RecordBatch of the same schema.
   * @param others Additional RecordBatch to add to the end of this RecordBatch.
   */
  concat(...others) {
    return new Table(this.schema, [this, ...others]);
  }
  /**
   * Return a zero-copy sub-section of this RecordBatch.
   * @param start The beginning of the specified portion of the RecordBatch.
   * @param end The end of the specified portion of the RecordBatch. This is exclusive of the row at the index 'end'.
   */
  slice(begin, end) {
    const [slice] = new Vector([this.data]).slice(begin, end).data;
    return new _RecordBatch(this.schema, slice, this._metadata);
  }
  /**
   * Returns a child Vector by name, or null if this Vector has no child with the given name.
   * @param name The name of the child to retrieve.
   */
  getChild(name) {
    return this.getChildAt(this.schema.fields?.findIndex((f) => f.name === name));
  }
  /**
   * Returns a child Vector by index, or null if this Vector has no child at the supplied index.
   * @param index The index of the child to retrieve.
   */
  getChildAt(index) {
    if (index > -1 && index < this.schema.fields.length) {
      return new Vector([this.data.children[index]]);
    }
    return null;
  }
  /**
   * Sets a child Vector by name.
   * @param name The name of the child to overwrite.
   * @returns A new RecordBatch with the new child for the specified name.
   */
  setChild(name, child) {
    return this.setChildAt(this.schema.fields?.findIndex((f) => f.name === name), child);
  }
  setChildAt(index, child) {
    let schema = this.schema;
    let data = this.data;
    if (index > -1 && index < this.numCols) {
      if (!child) {
        child = new Vector([makeData({ type: new Null2(), length: this.numRows })]);
      }
      const fields = schema.fields.slice();
      const children = data.children.slice();
      const field = fields[index].clone({ type: child.type });
      [fields[index], children[index]] = [field, child.data[0]];
      schema = new Schema2(fields, new Map(this.schema.metadata));
      data = makeData({ type: new Struct(fields), length: data.length, children });
    }
    return new _RecordBatch(schema, data, this._metadata);
  }
  /**
   * Construct a new RecordBatch containing only specified columns.
   *
   * @param columnNames Names of columns to keep.
   * @returns A new RecordBatch of columns matching the specified names.
   */
  select(columnNames) {
    const schema = this.schema.select(columnNames);
    const type = new Struct(schema.fields);
    const children = [];
    for (const name of columnNames) {
      const index = this.schema.fields.findIndex((f) => f.name === name);
      if (~index) {
        children[index] = this.data.children[index];
      }
    }
    return new _RecordBatch(schema, makeData({ type, length: this.numRows, children }), this._metadata);
  }
  /**
   * Construct a new RecordBatch containing only columns at the specified indices.
   *
   * @param columnIndices Indices of columns to keep.
   * @returns A new RecordBatch of columns matching at the specified indices.
   */
  selectAt(columnIndices) {
    const schema = this.schema.selectAt(columnIndices);
    const children = columnIndices.map((i) => this.data.children[i]).filter(Boolean);
    const subset = makeData({ type: new Struct(schema.fields), length: this.numRows, children });
    return new _RecordBatch(schema, subset, this._metadata);
  }
  // Initialize this static property via an IIFE so bundlers don't tree-shake
  // out this logic, but also so we're still compliant with `"sideEffects": false`
  static [Symbol.toStringTag] = ((proto) => {
    proto._nullCount = -1;
    proto[Symbol.isConcatSpreadable] = true;
    proto[kRecordBatchSymbol] = true;
    return "RecordBatch";
  })(_RecordBatch.prototype);
};
Object.defineProperty(RecordBatch3, Symbol.hasInstance, {
  value: function isRecordBatchInstance(instance8) {
    return Function.prototype[Symbol.hasInstance].call(this, instance8) || this === RecordBatch3 && RecordBatch3.isRecordBatch(instance8);
  }
});
function ensureSameLengthData(schema, chunks, maxLength = chunks.reduce((max, col) => Math.max(max, col.length), 0)) {
  const fields = [...schema.fields];
  const children = [...chunks];
  const nullBitmapSize = (maxLength + 63 & ~63) >> 3;
  for (const [idx, field] of schema.fields.entries()) {
    const chunk = chunks[idx];
    if (!chunk || chunk.length !== maxLength) {
      fields[idx] = field.clone({ nullable: true });
      children[idx] = chunk?._changeLengthAndBackfillNullBitmap(maxLength) ?? makeData({
        type: field.type,
        length: maxLength,
        nullCount: maxLength,
        nullBitmap: new Uint8Array(nullBitmapSize)
      });
    }
  }
  return [
    schema.assign(fields),
    makeData({ type: new Struct(fields), length: maxLength, children })
  ];
}
function collectDictionaries(fields, children, dictionaries = /* @__PURE__ */ new Map()) {
  if ((fields?.length ?? 0) > 0 && fields?.length === children?.length) {
    for (let i = -1, n = fields.length; ++i < n; ) {
      const { type } = fields[i];
      const data = children[i];
      for (const next of [data, ...data?.dictionary?.data || []]) {
        collectDictionaries(type.children, next?.children, dictionaries);
      }
      if (DataType.isDictionary(type)) {
        const { id } = type;
        if (!dictionaries.has(id)) {
          if (data?.dictionary) {
            dictionaries.set(id, data.dictionary);
          }
        } else if (dictionaries.get(id) !== data.dictionary) {
          throw new Error(`Cannot create Schema containing two different dictionaries with the same Id`);
        }
      }
    }
  }
  return dictionaries;
}
var _InternalEmptyPlaceholderRecordBatch2 = class extends RecordBatch3 {
  constructor(schema, metadata) {
    const children = schema.fields.map((f) => makeData({ type: f.type }));
    const data = makeData({ type: new Struct(schema.fields), length: 0, nullCount: 0, children });
    super(schema, data, metadata || /* @__PURE__ */ new Map());
  }
};

// src/ipc/message.ts
import { ByteBuffer as ByteBuffer5 } from "flatbuffers";
var invalidMessageType = (type) => `Expected ${MessageHeader[type]} Message in stream, but was null or length 0.`;
var nullMessage = (type) => `Header pointer of flatbuffer-encoded ${MessageHeader[type]} Message is null or length 0.`;
var invalidMessageMetadata = (expected, actual) => `Expected to read ${expected} metadata bytes, but only read ${actual}.`;
var invalidMessageBodyLength = (expected, actual) => `Expected to read ${expected} bytes for message body, but only read ${actual}.`;
var MessageReader = class {
  source;
  constructor(source) {
    this.source = source instanceof ByteStream ? source : new ByteStream(source);
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    let r;
    if ((r = this.readMetadataLength()).done) {
      return ITERATOR_DONE;
    }
    if (r.value === -1 && (r = this.readMetadataLength()).done) {
      return ITERATOR_DONE;
    }
    if ((r = this.readMetadata(r.value)).done) {
      return ITERATOR_DONE;
    }
    return r;
  }
  throw(value) {
    return this.source.throw(value);
  }
  return(value) {
    return this.source.return(value);
  }
  readMessage(type) {
    let r;
    if ((r = this.next()).done) {
      return null;
    }
    if (type != null && r.value.headerType !== type) {
      throw new Error(invalidMessageType(type));
    }
    return r.value;
  }
  readMessageBody(bodyLength) {
    if (bodyLength <= 0) {
      return new Uint8Array(0);
    }
    const buf = toUint8Array(this.source.read(bodyLength));
    if (buf.byteLength < bodyLength) {
      throw new Error(invalidMessageBodyLength(bodyLength, buf.byteLength));
    }
    return (
      /* 1. */
      buf.byteOffset % 8 === 0 && /* 2. */
      buf.byteOffset + buf.byteLength <= buf.buffer.byteLength ? buf : buf.slice()
    );
  }
  readSchema(throwIfNull = false) {
    const type = 1 /* Schema */;
    const message = this.readMessage(type);
    const schema = message?.header();
    if (throwIfNull && !schema) {
      throw new Error(nullMessage(type));
    }
    return schema;
  }
  readMetadataLength() {
    const buf = this.source.read(PADDING);
    const bb = buf && new ByteBuffer5(buf);
    const len = bb?.readInt32(0) || 0;
    return { done: len === 0, value: len };
  }
  readMetadata(metadataLength) {
    const buf = this.source.read(metadataLength);
    if (!buf) {
      return ITERATOR_DONE;
    }
    if (buf.byteLength < metadataLength) {
      throw new Error(invalidMessageMetadata(metadataLength, buf.byteLength));
    }
    return { done: false, value: Message2.decode(buf) };
  }
};
var AsyncMessageReader = class {
  source;
  constructor(source, byteLength) {
    this.source = source instanceof AsyncByteStream ? source : isFileHandle(source) ? new AsyncRandomAccessFile(source, byteLength) : new AsyncByteStream(source);
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  async next() {
    let r;
    if ((r = await this.readMetadataLength()).done) {
      return ITERATOR_DONE;
    }
    if (r.value === -1 && (r = await this.readMetadataLength()).done) {
      return ITERATOR_DONE;
    }
    if ((r = await this.readMetadata(r.value)).done) {
      return ITERATOR_DONE;
    }
    return r;
  }
  async throw(value) {
    return await this.source.throw(value);
  }
  async return(value) {
    return await this.source.return(value);
  }
  async readMessage(type) {
    let r;
    if ((r = await this.next()).done) {
      return null;
    }
    if (type != null && r.value.headerType !== type) {
      throw new Error(invalidMessageType(type));
    }
    return r.value;
  }
  async readMessageBody(bodyLength) {
    if (bodyLength <= 0) {
      return new Uint8Array(0);
    }
    const buf = toUint8Array(await this.source.read(bodyLength));
    if (buf.byteLength < bodyLength) {
      throw new Error(invalidMessageBodyLength(bodyLength, buf.byteLength));
    }
    return (
      /* 1. */
      buf.byteOffset % 8 === 0 && /* 2. */
      buf.byteOffset + buf.byteLength <= buf.buffer.byteLength ? buf : buf.slice()
    );
  }
  async readSchema(throwIfNull = false) {
    const type = 1 /* Schema */;
    const message = await this.readMessage(type);
    const schema = message?.header();
    if (throwIfNull && !schema) {
      throw new Error(nullMessage(type));
    }
    return schema;
  }
  async readMetadataLength() {
    const buf = await this.source.read(PADDING);
    const bb = buf && new ByteBuffer5(buf);
    const len = bb?.readInt32(0) || 0;
    return { done: len === 0, value: len };
  }
  async readMetadata(metadataLength) {
    const buf = await this.source.read(metadataLength);
    if (!buf) {
      return ITERATOR_DONE;
    }
    if (buf.byteLength < metadataLength) {
      throw new Error(invalidMessageMetadata(metadataLength, buf.byteLength));
    }
    return { done: false, value: Message2.decode(buf) };
  }
};
var JSONMessageReader = class extends MessageReader {
  _schema = false;
  _json;
  _body = [];
  _batchIndex = 0;
  _dictionaryIndex = 0;
  constructor(source) {
    super(new Uint8Array(0));
    this._json = source instanceof ArrowJSON ? source : new ArrowJSON(source);
  }
  next() {
    const { _json } = this;
    if (!this._schema) {
      this._schema = true;
      const message = Message2.fromJSON(_json.schema, 1 /* Schema */);
      return { done: false, value: message };
    }
    if (this._dictionaryIndex < _json.dictionaries.length) {
      const batch = _json.dictionaries[this._dictionaryIndex++];
      this._body = batch["data"]["columns"];
      const message = Message2.fromJSON(batch, 2 /* DictionaryBatch */);
      return { done: false, value: message };
    }
    if (this._batchIndex < _json.batches.length) {
      const batch = _json.batches[this._batchIndex++];
      this._body = batch["columns"];
      const message = Message2.fromJSON(batch, 3 /* RecordBatch */);
      return { done: false, value: message };
    }
    this._body = [];
    return ITERATOR_DONE;
  }
  readMessageBody(_bodyLength) {
    return flattenDataSources(this._body);
    function flattenDataSources(xs) {
      return (xs || []).reduce((buffers, column) => [
        ...buffers,
        ...column["VALIDITY"] && [column["VALIDITY"]] || [],
        ...column["TYPE_ID"] && [column["TYPE_ID"]] || [],
        ...column["OFFSET"] && [column["OFFSET"]] || [],
        ...column["DATA"] && [column["DATA"]] || [],
        ...column["VIEWS"] && [column["VIEWS"]] || [],
        ...column["VARIADIC_DATA_BUFFERS"] || [],
        ...flattenDataSources(column["children"])
      ], []);
    }
  }
  readMessage(type) {
    let r;
    if ((r = this.next()).done) {
      return null;
    }
    if (type != null && r.value.headerType !== type) {
      throw new Error(invalidMessageType(type));
    }
    return r.value;
  }
  readSchema() {
    const type = 1 /* Schema */;
    const message = this.readMessage(type);
    const schema = message?.header();
    if (!message || !schema) {
      throw new Error(nullMessage(type));
    }
    return schema;
  }
};
var PADDING = 4;
var MAGIC_STR = "ARROW1";
var MAGIC = new Uint8Array(MAGIC_STR.length);
for (let i = 0; i < MAGIC_STR.length; i += 1) {
  MAGIC[i] = MAGIC_STR.codePointAt(i);
}
function checkForMagicArrowString(buffer, index = 0) {
  for (let i = -1, n = MAGIC.length; ++i < n; ) {
    if (MAGIC[i] !== buffer[index + i]) {
      return false;
    }
  }
  return true;
}
var magicLength = MAGIC.length;
var magicAndPadding = magicLength + PADDING;
var magicX2AndPadding = magicLength * 2 + PADDING;

// src/ipc/compression/validators.ts
var Lz4FrameValidator = class {
  LZ4_FRAME_MAGIC = new Uint8Array([4, 34, 77, 24]);
  MIN_HEADER_LENGTH = 7;
  // 4 (magic) + 2 (FLG + BD) + 1 (header checksum) = 7 min bytes
  isValidCodecEncode(codec) {
    const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const compressed = codec.encode(testData);
    return this._isValidCompressed(compressed);
  }
  _isValidCompressed(buffer) {
    return this._hasMinimumLength(buffer) && this._hasValidMagicNumber(buffer) && this._hasValidVersion(buffer);
  }
  _hasMinimumLength(buffer) {
    return buffer.length >= this.MIN_HEADER_LENGTH;
  }
  _hasValidMagicNumber(buffer) {
    return this.LZ4_FRAME_MAGIC.every(
      (byte, i) => buffer[i] === byte
    );
  }
  _hasValidVersion(buffer) {
    const flg = buffer[4];
    const versionBits = (flg & 192) >> 6;
    return versionBits === 1;
  }
};
var ZstdValidator = class {
  ZSTD_MAGIC = new Uint8Array([40, 181, 47, 253]);
  MIN_HEADER_LENGTH = 6;
  // 4 (magic) + 2 (min Frame_Header) = 6 min bytes
  isValidCodecEncode(codec) {
    const testData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const compressed = codec.encode(testData);
    return this._isValidCompressed(compressed);
  }
  _isValidCompressed(buffer) {
    return this._hasMinimumLength(buffer) && this._hasValidMagicNumber(buffer);
  }
  _hasMinimumLength(buffer) {
    return buffer.length >= this.MIN_HEADER_LENGTH;
  }
  _hasValidMagicNumber(buffer) {
    return this.ZSTD_MAGIC.every(
      (byte, i) => buffer[i] === byte
    );
  }
};
var compressionValidators = {
  [0 /* LZ4_FRAME */]: new Lz4FrameValidator(),
  [1 /* ZSTD */]: new ZstdValidator()
};

// src/ipc/compression/registry.ts
var _CompressionRegistry = class {
  constructor() {
    this.registry = {};
  }
  set(compression, codec) {
    if (codec?.encode && typeof codec.encode === "function" && !compressionValidators[compression].isValidCodecEncode(codec)) {
      throw new Error(`Encoder for ${CompressionType[compression]} is not valid.`);
    }
    this.registry[compression] = codec;
  }
  get(compression) {
    return this.registry?.[compression] || null;
  }
};
var compressionRegistry = new _CompressionRegistry();

// src/ipc/reader.ts
import * as flatbuffers45 from "flatbuffers";

// src/ipc/compression/constants.ts
var LENGTH_NO_COMPRESSED_DATA = -1;
var COMPRESS_LENGTH_PREFIX = 8;

// src/ipc/reader.ts
var RecordBatchReader = class _RecordBatchReader extends ReadableInterop {
  _impl;
  constructor(impl) {
    super();
    this._impl = impl;
  }
  get closed() {
    return this._impl.closed;
  }
  get schema() {
    return this._impl.schema;
  }
  get autoDestroy() {
    return this._impl.autoDestroy;
  }
  get dictionaries() {
    return this._impl.dictionaries;
  }
  get numDictionaries() {
    return this._impl.numDictionaries;
  }
  get numRecordBatches() {
    return this._impl.numRecordBatches;
  }
  get footer() {
    return this._impl.isFile() ? this._impl.footer : null;
  }
  isSync() {
    return this._impl.isSync();
  }
  isAsync() {
    return this._impl.isAsync();
  }
  isFile() {
    return this._impl.isFile();
  }
  isStream() {
    return this._impl.isStream();
  }
  next() {
    return this._impl.next();
  }
  throw(value) {
    return this._impl.throw(value);
  }
  return(value) {
    return this._impl.return(value);
  }
  cancel() {
    return this._impl.cancel();
  }
  reset(schema) {
    this._impl.reset(schema);
    this._DOMStream = void 0;
    this._nodeStream = void 0;
    return this;
  }
  open(options) {
    const opening = this._impl.open(options);
    return isPromise(opening) ? opening.then(() => this) : this;
  }
  readRecordBatch(index) {
    return this._impl.isFile() ? this._impl.readRecordBatch(index) : null;
  }
  [Symbol.iterator]() {
    return this._impl[Symbol.iterator]();
  }
  [Symbol.asyncIterator]() {
    return this._impl[Symbol.asyncIterator]();
  }
  toDOMStream() {
    return adapters_default.toDOMStream(
      this.isSync() ? { [Symbol.iterator]: () => this } : { [Symbol.asyncIterator]: () => this }
    );
  }
  toNodeStream() {
    return adapters_default.toNodeStream(
      this.isSync() ? { [Symbol.iterator]: () => this } : { [Symbol.asyncIterator]: () => this },
      { objectMode: true }
    );
  }
  /** @nocollapse */
  // @ts-ignore
  static throughNode(options) {
    throw new Error(`"throughNode" not available in this environment`);
  }
  /** @nocollapse */
  static throughDOM(writableStrategy, readableStrategy) {
    throw new Error(`"throughDOM" not available in this environment`);
  }
  /** @nocollapse */
  static from(source) {
    if (source instanceof _RecordBatchReader) {
      return source;
    } else if (isArrowJSON(source)) {
      return fromArrowJSON(source);
    } else if (isFileHandle(source)) {
      return fromFileHandle(source);
    } else if (isPromise(source)) {
      return (async () => await _RecordBatchReader.from(await source))();
    } else if (isFetchResponse(source) || isReadableDOMStream(source) || isReadableNodeStream(source) || isAsyncIterable(source)) {
      return fromAsyncByteStream(new AsyncByteStream(source));
    }
    return fromByteStream(new ByteStream(source));
  }
  /** @nocollapse */
  static readAll(source) {
    if (source instanceof _RecordBatchReader) {
      return source.isSync() ? readAllSync(source) : readAllAsync(source);
    } else if (isArrowJSON(source) || ArrayBuffer.isView(source) || isIterable(source) || isIteratorResult(source)) {
      return readAllSync(source);
    }
    return readAllAsync(source);
  }
};
var RecordBatchStreamReader = class extends RecordBatchReader {
  constructor(_impl) {
    super(_impl);
    this._impl = _impl;
  }
  readAll() {
    return [...this];
  }
  [Symbol.iterator]() {
    return this._impl[Symbol.iterator]();
  }
  async *[Symbol.asyncIterator]() {
    yield* this[Symbol.iterator]();
  }
};
var AsyncRecordBatchStreamReader = class extends RecordBatchReader {
  constructor(_impl) {
    super(_impl);
    this._impl = _impl;
  }
  async readAll() {
    const batches = new Array();
    for await (const batch of this) {
      batches.push(batch);
    }
    return batches;
  }
  [Symbol.iterator]() {
    throw new Error(`AsyncRecordBatchStreamReader is not Iterable`);
  }
  [Symbol.asyncIterator]() {
    return this._impl[Symbol.asyncIterator]();
  }
};
var RecordBatchFileReader = class extends RecordBatchStreamReader {
  constructor(_impl) {
    super(_impl);
    this._impl = _impl;
  }
};
var AsyncRecordBatchFileReader = class extends AsyncRecordBatchStreamReader {
  constructor(_impl) {
    super(_impl);
    this._impl = _impl;
  }
};
var RecordBatchReaderImpl = class {
  closed = false;
  autoDestroy = true;
  dictionaries;
  _dictionaryIndex = 0;
  _recordBatchIndex = 0;
  get numDictionaries() {
    return this._dictionaryIndex;
  }
  get numRecordBatches() {
    return this._recordBatchIndex;
  }
  constructor(dictionaries = /* @__PURE__ */ new Map()) {
    this.dictionaries = dictionaries;
  }
  isSync() {
    return false;
  }
  isAsync() {
    return false;
  }
  isFile() {
    return false;
  }
  isStream() {
    return false;
  }
  reset(schema) {
    this._dictionaryIndex = 0;
    this._recordBatchIndex = 0;
    this.schema = schema;
    this.dictionaries = /* @__PURE__ */ new Map();
    return this;
  }
  _loadRecordBatch(header, body, messageMetadata) {
    let children;
    if (header.compression != null) {
      const codec = compressionRegistry.get(header.compression.type);
      if (codec?.decode && typeof codec.decode === "function") {
        const { decommpressedBody, buffers } = this._decompressBuffers(header, body, codec);
        children = this._loadCompressedVectors(header, decommpressedBody, this.schema.fields);
        header = new RecordBatch2(
          header.length,
          header.nodes,
          buffers,
          null
        );
      } else {
        throw new Error("Record batch is compressed but codec not found");
      }
    } else {
      children = this._loadVectors(header, body, this.schema.fields);
    }
    const data = makeData({ type: new Struct(this.schema.fields), length: header.length, children });
    return new RecordBatch3(this.schema, data, messageMetadata);
  }
  _loadDictionaryBatch(header, body) {
    const { id, isDelta } = header;
    const { dictionaries, schema } = this;
    const dictionary = dictionaries.get(id);
    const type = schema.dictionaries.get(id);
    let data;
    if (header.data.compression != null) {
      const codec = compressionRegistry.get(header.data.compression.type);
      if (codec?.decode && typeof codec.decode === "function") {
        const { decommpressedBody, buffers } = this._decompressBuffers(header.data, body, codec);
        data = this._loadCompressedVectors(header.data, decommpressedBody, [type]);
        header = new DictionaryBatch2(new RecordBatch2(
          header.data.length,
          header.data.nodes,
          buffers,
          null,
          header.data.variadicBufferCounts
        ), id, isDelta);
      } else {
        throw new Error("Dictionary batch is compressed but codec not found");
      }
    } else {
      data = this._loadVectors(header.data, body, [type]);
    }
    return (dictionary && isDelta ? dictionary.concat(
      new Vector(data)
    ) : new Vector(data)).memoize();
  }
  _loadVectors(header, body, types) {
    return new VectorLoader(body, header.nodes, header.buffers, this.dictionaries, this.schema.metadataVersion, header.variadicBufferCounts).visitMany(types);
  }
  _loadCompressedVectors(header, body, types) {
    return new CompressedVectorLoader(body, header.nodes, header.buffers, this.dictionaries, this.schema.metadataVersion, header.variadicBufferCounts).visitMany(types);
  }
  _decompressBuffers(header, body, codec) {
    const decompressedBuffers = [];
    const newBufferRegions = [];
    let currentOffset = 0;
    for (const { offset, length } of header.buffers) {
      if (length === 0) {
        decompressedBuffers.push(new Uint8Array(0));
        newBufferRegions.push(new BufferRegion(currentOffset, 0));
        continue;
      }
      const byteBuf = new flatbuffers45.ByteBuffer(body.subarray(offset, offset + length));
      const uncompressedLenth = bigIntToNumber(byteBuf.readInt64(0));
      const bytes = byteBuf.bytes().subarray(COMPRESS_LENGTH_PREFIX);
      const decompressed = uncompressedLenth === LENGTH_NO_COMPRESSED_DATA ? bytes : codec.decode(bytes);
      decompressedBuffers.push(decompressed);
      const padding = (currentOffset + 7 & ~7) - currentOffset;
      currentOffset += padding;
      newBufferRegions.push(new BufferRegion(currentOffset, decompressed.length));
      currentOffset += decompressed.length;
    }
    return {
      decommpressedBody: decompressedBuffers,
      buffers: newBufferRegions
    };
  }
};
var RecordBatchStreamReaderImpl = class extends RecordBatchReaderImpl {
  _reader;
  _handle;
  constructor(source, dictionaries) {
    super(dictionaries);
    this._reader = !isArrowJSON(source) ? new MessageReader(this._handle = source) : new JSONMessageReader(this._handle = source);
  }
  isSync() {
    return true;
  }
  isStream() {
    return true;
  }
  [Symbol.iterator]() {
    return this;
  }
  cancel() {
    if (!this.closed && (this.closed = true)) {
      this.reset()._reader.return();
      this._reader = null;
      this.dictionaries = null;
    }
  }
  open(options) {
    if (!this.closed) {
      this.autoDestroy = shouldAutoDestroy(this, options);
      if (!(this.schema || (this.schema = this._reader.readSchema()))) {
        this.cancel();
      }
    }
    return this;
  }
  throw(value) {
    if (!this.closed && this.autoDestroy && (this.closed = true)) {
      return this.reset()._reader.throw(value);
    }
    return ITERATOR_DONE;
  }
  return(value) {
    if (!this.closed && this.autoDestroy && (this.closed = true)) {
      return this.reset()._reader.return(value);
    }
    return ITERATOR_DONE;
  }
  next() {
    if (this.closed) {
      return ITERATOR_DONE;
    }
    let message;
    const { _reader: reader } = this;
    while (message = this._readNextMessageAndValidate()) {
      if (message.isSchema()) {
        this.reset(message.header());
      } else if (message.isRecordBatch()) {
        this._recordBatchIndex++;
        const header = message.header();
        const buffer = reader.readMessageBody(message.bodyLength);
        const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
        return { done: false, value: recordBatch };
      } else if (message.isDictionaryBatch()) {
        this._dictionaryIndex++;
        const header = message.header();
        const buffer = reader.readMessageBody(message.bodyLength);
        const vector = this._loadDictionaryBatch(header, buffer);
        this.dictionaries.set(header.id, vector);
      }
    }
    if (this.schema && this._recordBatchIndex === 0) {
      this._recordBatchIndex++;
      return { done: false, value: new _InternalEmptyPlaceholderRecordBatch2(this.schema) };
    }
    return this.return();
  }
  _readNextMessageAndValidate(type) {
    return this._reader.readMessage(type);
  }
};
var AsyncRecordBatchStreamReaderImpl = class extends RecordBatchReaderImpl {
  _handle;
  _reader;
  constructor(source, dictionaries) {
    super(dictionaries);
    this._reader = new AsyncMessageReader(this._handle = source);
  }
  isAsync() {
    return true;
  }
  isStream() {
    return true;
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  async cancel() {
    if (!this.closed && (this.closed = true)) {
      await this.reset()._reader.return();
      this._reader = null;
      this.dictionaries = null;
    }
  }
  async open(options) {
    if (!this.closed) {
      this.autoDestroy = shouldAutoDestroy(this, options);
      if (!(this.schema || (this.schema = await this._reader.readSchema()))) {
        await this.cancel();
      }
    }
    return this;
  }
  async throw(value) {
    if (!this.closed && this.autoDestroy && (this.closed = true)) {
      return await this.reset()._reader.throw(value);
    }
    return ITERATOR_DONE;
  }
  async return(value) {
    if (!this.closed && this.autoDestroy && (this.closed = true)) {
      return await this.reset()._reader.return(value);
    }
    return ITERATOR_DONE;
  }
  async next() {
    if (this.closed) {
      return ITERATOR_DONE;
    }
    let message;
    const { _reader: reader } = this;
    while (message = await this._readNextMessageAndValidate()) {
      if (message.isSchema()) {
        await this.reset(message.header());
      } else if (message.isRecordBatch()) {
        this._recordBatchIndex++;
        const header = message.header();
        const buffer = await reader.readMessageBody(message.bodyLength);
        const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
        return { done: false, value: recordBatch };
      } else if (message.isDictionaryBatch()) {
        this._dictionaryIndex++;
        const header = message.header();
        const buffer = await reader.readMessageBody(message.bodyLength);
        const vector = this._loadDictionaryBatch(header, buffer);
        this.dictionaries.set(header.id, vector);
      }
    }
    if (this.schema && this._recordBatchIndex === 0) {
      this._recordBatchIndex++;
      return { done: false, value: new _InternalEmptyPlaceholderRecordBatch2(this.schema) };
    }
    return await this.return();
  }
  async _readNextMessageAndValidate(type) {
    return await this._reader.readMessage(type);
  }
};
var RecordBatchFileReaderImpl = class extends RecordBatchStreamReaderImpl {
  _footer;
  get footer() {
    return this._footer;
  }
  get numDictionaries() {
    return this._footer ? this._footer.numDictionaries : 0;
  }
  get numRecordBatches() {
    return this._footer ? this._footer.numRecordBatches : 0;
  }
  constructor(source, dictionaries) {
    super(source instanceof RandomAccessFile ? source : new RandomAccessFile(source), dictionaries);
  }
  isSync() {
    return true;
  }
  isFile() {
    return true;
  }
  open(options) {
    if (!this.closed && !this._footer) {
      this.schema = (this._footer = this._readFooter()).schema;
      for (const block of this._footer.dictionaryBatches()) {
        block && this._readDictionaryBatch(this._dictionaryIndex++);
      }
    }
    return super.open(options);
  }
  readRecordBatch(index) {
    if (this.closed) {
      return null;
    }
    if (!this._footer) {
      this.open();
    }
    const block = this._footer?.getRecordBatch(index);
    if (block && this._handle.seek(block.offset)) {
      const message = this._reader.readMessage(3 /* RecordBatch */);
      if (message?.isRecordBatch()) {
        const header = message.header();
        const buffer = this._reader.readMessageBody(message.bodyLength);
        const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
        return recordBatch;
      }
    }
    return null;
  }
  _readDictionaryBatch(index) {
    const block = this._footer?.getDictionaryBatch(index);
    if (block && this._handle.seek(block.offset)) {
      const message = this._reader.readMessage(2 /* DictionaryBatch */);
      if (message?.isDictionaryBatch()) {
        const header = message.header();
        const buffer = this._reader.readMessageBody(message.bodyLength);
        const vector = this._loadDictionaryBatch(header, buffer);
        this.dictionaries.set(header.id, vector);
      }
    }
  }
  _readFooter() {
    const { _handle } = this;
    const offset = _handle.size - magicAndPadding;
    const length = _handle.readInt32(offset);
    const buffer = _handle.readAt(offset - length, length);
    return Footer_.decode(buffer);
  }
  _readNextMessageAndValidate(type) {
    if (!this._footer) {
      this.open();
    }
    if (this._footer && this._recordBatchIndex < this.numRecordBatches) {
      const block = this._footer?.getRecordBatch(this._recordBatchIndex);
      if (block && this._handle.seek(block.offset)) {
        return this._reader.readMessage(type);
      }
    }
    return null;
  }
};
var AsyncRecordBatchFileReaderImpl = class extends AsyncRecordBatchStreamReaderImpl {
  _footer;
  get footer() {
    return this._footer;
  }
  get numDictionaries() {
    return this._footer ? this._footer.numDictionaries : 0;
  }
  get numRecordBatches() {
    return this._footer ? this._footer.numRecordBatches : 0;
  }
  constructor(source, ...rest) {
    const byteLength = typeof rest[0] !== "number" ? rest.shift() : void 0;
    const dictionaries = rest[0] instanceof Map ? rest.shift() : void 0;
    super(source instanceof AsyncRandomAccessFile ? source : new AsyncRandomAccessFile(source, byteLength), dictionaries);
  }
  isFile() {
    return true;
  }
  isAsync() {
    return true;
  }
  async open(options) {
    if (!this.closed && !this._footer) {
      this.schema = (this._footer = await this._readFooter()).schema;
      for (const block of this._footer.dictionaryBatches()) {
        block && await this._readDictionaryBatch(this._dictionaryIndex++);
      }
    }
    return await super.open(options);
  }
  async readRecordBatch(index) {
    if (this.closed) {
      return null;
    }
    if (!this._footer) {
      await this.open();
    }
    const block = this._footer?.getRecordBatch(index);
    if (block && await this._handle.seek(block.offset)) {
      const message = await this._reader.readMessage(3 /* RecordBatch */);
      if (message?.isRecordBatch()) {
        const header = message.header();
        const buffer = await this._reader.readMessageBody(message.bodyLength);
        const recordBatch = this._loadRecordBatch(header, buffer, message.metadata);
        return recordBatch;
      }
    }
    return null;
  }
  async _readDictionaryBatch(index) {
    const block = this._footer?.getDictionaryBatch(index);
    if (block && await this._handle.seek(block.offset)) {
      const message = await this._reader.readMessage(2 /* DictionaryBatch */);
      if (message?.isDictionaryBatch()) {
        const header = message.header();
        const buffer = await this._reader.readMessageBody(message.bodyLength);
        const vector = this._loadDictionaryBatch(header, buffer);
        this.dictionaries.set(header.id, vector);
      }
    }
  }
  async _readFooter() {
    const { _handle } = this;
    _handle._pending && await _handle._pending;
    const offset = _handle.size - magicAndPadding;
    const length = await _handle.readInt32(offset);
    const buffer = await _handle.readAt(offset - length, length);
    return Footer_.decode(buffer);
  }
  async _readNextMessageAndValidate(type) {
    if (!this._footer) {
      await this.open();
    }
    if (this._footer && this._recordBatchIndex < this.numRecordBatches) {
      const block = this._footer.getRecordBatch(this._recordBatchIndex);
      if (block && await this._handle.seek(block.offset)) {
        return await this._reader.readMessage(type);
      }
    }
    return null;
  }
};
var RecordBatchJSONReaderImpl = class extends RecordBatchStreamReaderImpl {
  constructor(source, dictionaries) {
    super(source, dictionaries);
  }
  _loadVectors(header, body, types) {
    return new JSONVectorLoader(body, header.nodes, header.buffers, this.dictionaries, this.schema.metadataVersion, header.variadicBufferCounts).visitMany(types);
  }
};
function shouldAutoDestroy(self, options) {
  return options && typeof options["autoDestroy"] === "boolean" ? options["autoDestroy"] : self["autoDestroy"];
}
function* readAllSync(source) {
  const reader = RecordBatchReader.from(source);
  try {
    if (!reader.open({ autoDestroy: false }).closed) {
      do {
        yield reader;
      } while (!reader.reset().open().closed);
    }
  } finally {
    reader.cancel();
  }
}
async function* readAllAsync(source) {
  const reader = await RecordBatchReader.from(source);
  try {
    if (!(await reader.open({ autoDestroy: false })).closed) {
      do {
        yield reader;
      } while (!(await reader.reset().open()).closed);
    }
  } finally {
    await reader.cancel();
  }
}
function fromArrowJSON(source) {
  return new RecordBatchStreamReader(new RecordBatchJSONReaderImpl(source));
}
function fromByteStream(source) {
  const bytes = source.peek(magicLength + 7 & ~7);
  return bytes && bytes.byteLength >= 4 ? !checkForMagicArrowString(bytes) ? new RecordBatchStreamReader(new RecordBatchStreamReaderImpl(source)) : new RecordBatchFileReader(new RecordBatchFileReaderImpl(source.read())) : new RecordBatchStreamReader(new RecordBatchStreamReaderImpl((function* () {
  })()));
}
async function fromAsyncByteStream(source) {
  const bytes = await source.peek(magicLength + 7 & ~7);
  return bytes && bytes.byteLength >= 4 ? !checkForMagicArrowString(bytes) ? new AsyncRecordBatchStreamReader(new AsyncRecordBatchStreamReaderImpl(source)) : new RecordBatchFileReader(new RecordBatchFileReaderImpl(await source.read())) : new AsyncRecordBatchStreamReader(new AsyncRecordBatchStreamReaderImpl((async function* () {
  })()));
}
async function fromFileHandle(source) {
  const { size } = await source.stat();
  const file = new AsyncRandomAccessFile(source, size);
  if (size >= magicX2AndPadding && checkForMagicArrowString(await file.readAt(0, magicLength + 7 & ~7))) {
    return new AsyncRecordBatchFileReader(new AsyncRecordBatchFileReaderImpl(file));
  }
  return new AsyncRecordBatchStreamReader(new AsyncRecordBatchStreamReaderImpl(file));
}

// src/visitor/vectorassembler.ts
var VectorAssembler = class _VectorAssembler extends Visitor {
  /** @nocollapse */
  static assemble(...args) {
    const unwrap = (nodes) => nodes.flatMap((node) => Array.isArray(node) ? unwrap(node) : node instanceof RecordBatch3 ? node.data.children : node.data);
    const assembler = new _VectorAssembler();
    assembler.visitMany(unwrap(args));
    return assembler;
  }
  constructor() {
    super();
  }
  visit(data) {
    if (data instanceof Vector) {
      this.visitMany(data.data);
      return this;
    }
    const { type } = data;
    if (!DataType.isDictionary(type)) {
      const { length } = data;
      if (length > 2147483647) {
        throw new RangeError("Cannot write arrays larger than 2^31 - 1 in length");
      }
      if (DataType.isUnion(type)) {
        this.nodes.push(new FieldNode2(length, 0));
      } else {
        const { nullCount } = data;
        if (!DataType.isNull(type)) {
          addBuffer.call(
            this,
            nullCount <= 0 ? new Uint8Array(0) : truncateBitmap(data.offset, length, data.nullBitmap)
          );
        }
        this.nodes.push(new FieldNode2(length, nullCount));
      }
    }
    return super.visit(data);
  }
  visitNull(_null) {
    return this;
  }
  visitDictionary(data) {
    return this.visit(data.clone(data.type.indices));
  }
  get nodes() {
    return this._nodes;
  }
  get buffers() {
    return this._buffers;
  }
  get byteLength() {
    return this._byteLength;
  }
  get bufferRegions() {
    return this._bufferRegions;
  }
  get variadicBufferCounts() {
    return this._variadicBufferCounts;
  }
  _byteLength = 0;
  _nodes = [];
  _buffers = [];
  _bufferRegions = [];
  _variadicBufferCounts = [];
};
function addBuffer(values) {
  const byteLength = values.byteLength + 7 & ~7;
  this.buffers.push(values);
  this.bufferRegions.push(new BufferRegion(this._byteLength, byteLength));
  this._byteLength += byteLength;
  return this;
}
function assembleUnion(data) {
  const { type, length, typeIds, valueOffsets } = data;
  addBuffer.call(this, typeIds);
  if (type.mode === 0 /* Sparse */) {
    return assembleNestedVector.call(this, data);
  } else if (type.mode === 1 /* Dense */) {
    if (data.offset <= 0) {
      addBuffer.call(this, valueOffsets);
      return assembleNestedVector.call(this, data);
    } else {
      const shiftedOffsets = new Int32Array(length);
      const childOffsets = /* @__PURE__ */ Object.create(null);
      const childLengths = /* @__PURE__ */ Object.create(null);
      for (let typeId, shift, index = -1; ++index < length; ) {
        if ((typeId = typeIds[index]) === void 0) {
          continue;
        }
        if ((shift = childOffsets[typeId]) === void 0) {
          shift = childOffsets[typeId] = valueOffsets[index];
        }
        shiftedOffsets[index] = valueOffsets[index] - shift;
        childLengths[typeId] = (childLengths[typeId] ?? 0) + 1;
      }
      addBuffer.call(this, shiftedOffsets);
      this.visitMany(data.children.map((child, childIndex) => {
        const typeId = type.typeIds[childIndex];
        const childOffset = childOffsets[typeId];
        const childLength = childLengths[typeId];
        return child.slice(childOffset, Math.min(length, childLength));
      }));
    }
  }
  return this;
}
function assembleBoolVector(data) {
  let values;
  if (data.nullCount >= data.length) {
    return addBuffer.call(this, new Uint8Array(data.length + 7 >> 3));
  } else if ((values = data.values) instanceof Uint8Array) {
    return addBuffer.call(this, truncateBitmap(data.offset, data.length, values));
  }
  return addBuffer.call(this, packBools(data.values));
}
function assembleFlatVector(data) {
  return addBuffer.call(this, data.values.subarray(0, data.length * data.stride));
}
function assembleFlatListVector(data) {
  const { length, values, valueOffsets } = data;
  const begin = bigIntToNumber(valueOffsets[0]);
  const end = bigIntToNumber(valueOffsets[length]);
  const byteLength = Math.min(end - begin, values.byteLength - begin);
  addBuffer.call(this, rebaseValueOffsets(-begin, length + 1, valueOffsets));
  addBuffer.call(this, values.subarray(begin, begin + byteLength));
  return this;
}
function assembleBinaryViewVector(data) {
  const { offset, length, stride, values, variadicBuffers = [] } = data;
  if (!values) {
    throw new Error("BinaryView data is missing view buffer");
  }
  const start = offset * stride;
  const end = start + length * stride;
  addBuffer.call(this, values.subarray(start, end));
  for (const buffer of variadicBuffers) {
    addBuffer.call(this, buffer);
  }
  this._variadicBufferCounts.push(variadicBuffers.length);
  return this;
}
function assembleListVector(data) {
  const { length, valueOffsets } = data;
  if (valueOffsets) {
    const begin = bigIntToNumber(valueOffsets[0]);
    const end = bigIntToNumber(valueOffsets[length]);
    addBuffer.call(this, rebaseValueOffsets(-begin, length + 1, valueOffsets));
    return this.visit(data.children[0].slice(begin, end - begin));
  }
  return this.visit(data.children[0]);
}
function assembleNestedVector(data) {
  return this.visitMany(data.type.children.map((_, i) => data.children[i]).filter(Boolean))[0];
}
VectorAssembler.prototype.visitBool = assembleBoolVector;
VectorAssembler.prototype.visitInt = assembleFlatVector;
VectorAssembler.prototype.visitFloat = assembleFlatVector;
VectorAssembler.prototype.visitUtf8 = assembleFlatListVector;
VectorAssembler.prototype.visitLargeUtf8 = assembleFlatListVector;
VectorAssembler.prototype.visitUtf8View = assembleBinaryViewVector;
VectorAssembler.prototype.visitBinary = assembleFlatListVector;
VectorAssembler.prototype.visitLargeBinary = assembleFlatListVector;
VectorAssembler.prototype.visitBinaryView = assembleBinaryViewVector;
VectorAssembler.prototype.visitFixedSizeBinary = assembleFlatVector;
VectorAssembler.prototype.visitDate = assembleFlatVector;
VectorAssembler.prototype.visitTimestamp = assembleFlatVector;
VectorAssembler.prototype.visitTime = assembleFlatVector;
VectorAssembler.prototype.visitDecimal = assembleFlatVector;
VectorAssembler.prototype.visitList = assembleListVector;
VectorAssembler.prototype.visitLargeList = assembleListVector;
VectorAssembler.prototype.visitStruct = assembleNestedVector;
VectorAssembler.prototype.visitUnion = assembleUnion;
VectorAssembler.prototype.visitInterval = assembleFlatVector;
VectorAssembler.prototype.visitDuration = assembleFlatVector;
VectorAssembler.prototype.visitFixedSizeList = assembleListVector;
VectorAssembler.prototype.visitMap = assembleListVector;

// src/visitor/jsontypeassembler.ts
var JSONTypeAssembler = class extends Visitor {
  visit(node) {
    return node == null ? void 0 : super.visit(node);
  }
  visitNull({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitInt({ typeId, bitWidth, isSigned }) {
    return { "name": Type[typeId].toLowerCase(), "bitWidth": bitWidth, "isSigned": isSigned };
  }
  visitFloat({ typeId, precision }) {
    return { "name": Type[typeId].toLowerCase(), "precision": Precision[precision] };
  }
  visitBinary({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitLargeBinary({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitBinaryView({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitBool({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitUtf8({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitLargeUtf8({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitUtf8View({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitDecimal({ typeId, scale, precision, bitWidth }) {
    return { "name": Type[typeId].toLowerCase(), "scale": scale, "precision": precision, "bitWidth": bitWidth };
  }
  visitDate({ typeId, unit }) {
    return { "name": Type[typeId].toLowerCase(), "unit": DateUnit[unit] };
  }
  visitTime({ typeId, unit, bitWidth }) {
    return { "name": Type[typeId].toLowerCase(), "unit": TimeUnit[unit], bitWidth };
  }
  visitTimestamp({ typeId, timezone, unit }) {
    return { "name": Type[typeId].toLowerCase(), "unit": TimeUnit[unit], timezone };
  }
  visitInterval({ typeId, unit }) {
    return { "name": Type[typeId].toLowerCase(), "unit": IntervalUnit[unit] };
  }
  visitDuration({ typeId, unit }) {
    return { "name": Type[typeId].toLocaleLowerCase(), "unit": TimeUnit[unit] };
  }
  visitList({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitLargeList({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitStruct({ typeId }) {
    return { "name": Type[typeId].toLowerCase() };
  }
  visitUnion({ typeId, mode, typeIds }) {
    return {
      "name": Type[typeId].toLowerCase(),
      "mode": UnionMode[mode].toUpperCase(),
      "typeIds": [...typeIds]
    };
  }
  visitDictionary(node) {
    return this.visit(node.dictionary);
  }
  visitFixedSizeBinary({ typeId, byteWidth }) {
    return { "name": Type[typeId].toLowerCase(), "byteWidth": byteWidth };
  }
  visitFixedSizeList({ typeId, listSize }) {
    return { "name": Type[typeId].toLowerCase(), "listSize": listSize };
  }
  visitMap({ typeId, keysSorted }) {
    return { "name": Type[typeId].toLowerCase(), "keysSorted": keysSorted };
  }
};

// src/visitor/jsonvectorassembler.ts
var JSONVectorAssembler = class _JSONVectorAssembler extends Visitor {
  /** @nocollapse */
  static assemble(...batches) {
    const assembler = new _JSONVectorAssembler();
    return batches.map(({ schema, data }) => {
      return assembler.visitMany(schema.fields, data.children);
    });
  }
  visit({ name }, data) {
    const { length } = data;
    const { offset, nullCount, nullBitmap } = data;
    const type = DataType.isDictionary(data.type) ? data.type.indices : data.type;
    const buffers = Object.assign([], data.buffers, { [2 /* VALIDITY */]: void 0 });
    return {
      "name": name,
      "count": length,
      "VALIDITY": DataType.isNull(type) || DataType.isUnion(type) ? void 0 : nullCount <= 0 ? Array.from({ length }, () => 1) : [...new BitIterator(nullBitmap, offset, length, null, getBit)],
      ...super.visit(data.clone(type, offset, length, 0, buffers))
    };
  }
  visitNull() {
    return {};
  }
  visitBool({ values, offset, length }) {
    return { "DATA": [...new BitIterator(values, offset, length, null, getBool2)] };
  }
  visitInt(data) {
    return {
      "DATA": data.type.bitWidth < 64 ? [...data.values] : [...bigNumsToStrings(data.values, 2)]
    };
  }
  visitFloat(data) {
    return { "DATA": [...data.values] };
  }
  visitUtf8(data) {
    return { "DATA": [...new Vector([data])], "OFFSET": [...data.valueOffsets] };
  }
  visitLargeUtf8(data) {
    return { "DATA": [...new Vector([data])], "OFFSET": [...bigNumsToStrings(data.valueOffsets, 2)] };
  }
  visitBinary(data) {
    return { "DATA": [...binaryToString(new Vector([data]))], "OFFSET": [...data.valueOffsets] };
  }
  visitLargeBinary(data) {
    return { "DATA": [...binaryToString(new Vector([data]))], "OFFSET": [...bigNumsToStrings(data.valueOffsets, 2)] };
  }
  visitBinaryView(data) {
    return binaryViewDataToJSON(data, (bytes) => Array.from(bytes).map((b) => ("0" + (b & 255).toString(16)).slice(-2)).join("").toUpperCase());
  }
  visitUtf8View(data) {
    return binaryViewDataToJSON(data, (bytes) => Array.from(bytes).map((b) => String.fromCodePoint(b)).join(""));
  }
  visitFixedSizeBinary(data) {
    return { "DATA": [...binaryToString(new Vector([data]))] };
  }
  visitDate(data) {
    return {
      "DATA": data.type.unit === 0 /* DAY */ ? [...data.values] : [...bigNumsToStrings(data.values, 2)]
    };
  }
  visitTimestamp(data) {
    return { "DATA": [...bigNumsToStrings(data.values, 2)] };
  }
  visitTime(data) {
    return {
      "DATA": data.type.unit < 2 /* MICROSECOND */ ? [...data.values] : [...bigNumsToStrings(data.values, 2)]
    };
  }
  visitDecimal(data) {
    return { "DATA": [...bigNumsToStrings(data.values, 4)] };
  }
  visitList(data) {
    return {
      "OFFSET": [...data.valueOffsets],
      "children": this.visitMany(data.type.children, data.children)
    };
  }
  visitLargeList(data) {
    return {
      "OFFSET": [...bigNumsToStrings(data.valueOffsets, 2)],
      "children": this.visitMany(data.type.children, data.children)
    };
  }
  visitStruct(data) {
    return {
      "children": this.visitMany(data.type.children, data.children)
    };
  }
  visitUnion(data) {
    return {
      "TYPE_ID": [...data.typeIds],
      "OFFSET": data.type.mode === 1 /* Dense */ ? [...data.valueOffsets] : void 0,
      "children": this.visitMany(data.type.children, data.children)
    };
  }
  visitInterval(data) {
    switch (data.type.unit) {
      case 0 /* YEAR_MONTH */:
        return { "DATA": [...data.values] };
      case 1 /* DAY_TIME */:
        return { "DATA": toIntervalDayTimeObjects(data.values) };
      case 2 /* MONTH_DAY_NANO */:
        return { "DATA": toIntervalMonthDayNanoObjects(data.values, true) };
    }
  }
  visitDuration(data) {
    return { "DATA": [...bigNumsToStrings(data.values, 2)] };
  }
  visitFixedSizeList(data) {
    return {
      "children": this.visitMany(data.type.children, data.children)
    };
  }
  visitMap(data) {
    return {
      "OFFSET": [...data.valueOffsets],
      "children": this.visitMany(data.type.children, data.children)
    };
  }
};
function* binaryToString(vector) {
  for (const octets of vector) {
    yield octets.reduce((str, byte) => {
      return `${str}${("0" + (byte & 255).toString(16)).slice(-2)}`;
    }, "").toUpperCase();
  }
}
function* bigNumsToStrings(values, stride) {
  const u32s = new Uint32Array(values.buffer);
  for (let i = -1, n = u32s.length / stride; ++i < n; ) {
    yield `${BN.new(u32s.subarray((i + 0) * stride, (i + 1) * stride), false)}`;
  }
}
function binaryViewDataToJSON(data, formatInlined) {
  const INLINE_SIZE = 12;
  const viewsData = data.values;
  const dataView = new DataView(viewsData.buffer, viewsData.byteOffset, viewsData.byteLength);
  const numViews = viewsData.byteLength / 16;
  const bytesToHex = (bytes) => Array.from(bytes).map((b) => ("0" + (b & 255).toString(16)).slice(-2)).join("").toUpperCase();
  const parsedViews = Array.from({ length: numViews }, (_, i) => {
    const offset = i * 16;
    const size = dataView.getInt32(offset, true);
    return [offset, size];
  }).map(([offset, size]) => size > INLINE_SIZE ? {
    "SIZE": size,
    "PREFIX_HEX": bytesToHex(viewsData.subarray(offset + 4, offset + 8)),
    "BUFFER_INDEX": dataView.getInt32(offset + 8, true),
    "OFFSET": dataView.getInt32(offset + 12, true)
  } : {
    "SIZE": size,
    "INLINED": formatInlined(viewsData.subarray(offset + 4, offset + 4 + size))
  });
  const uniqueBufferIndices = [...new Set(
    parsedViews.map((v) => v["BUFFER_INDEX"]).filter((idx) => idx !== void 0)
  )];
  const variadicBuffers = uniqueBufferIndices.map(
    (bufferIndex) => bytesToHex(data.variadicBuffers[bufferIndex])
  );
  const bufferIndexMap = new Map(
    uniqueBufferIndices.map((bufferIndex, outputIndex) => [bufferIndex, outputIndex])
  );
  const views = parsedViews.map(
    (v) => v["BUFFER_INDEX"] !== void 0 ? { ...v, "BUFFER_INDEX": bufferIndexMap.get(v["BUFFER_INDEX"]) } : v
  );
  return { "VIEWS": views, "VARIADIC_DATA_BUFFERS": variadicBuffers };
}

// src/ipc/writer.ts
import * as flatbuffers46 from "flatbuffers";
var RecordBatchWriter = class extends ReadableInterop {
  /** @nocollapse */
  // @ts-ignore
  static throughNode(options) {
    throw new Error(`"throughNode" not available in this environment`);
  }
  /** @nocollapse */
  static throughDOM(writableStrategy, readableStrategy) {
    throw new Error(`"throughDOM" not available in this environment`);
  }
  constructor(options) {
    super();
    isObject(options) || (options = { autoDestroy: true, writeLegacyIpcFormat: false, compressionType: null });
    this._autoDestroy = typeof options.autoDestroy === "boolean" ? options.autoDestroy : true;
    this._writeLegacyIpcFormat = typeof options.writeLegacyIpcFormat === "boolean" ? options.writeLegacyIpcFormat : false;
    if (options.compressionType != null) {
      if (this._writeLegacyIpcFormat) {
        throw new Error("Legacy IPC format does not support columnar compression. Use modern IPC format (writeLegacyIpcFormat=false).");
      }
      if (Object.values(CompressionType).includes(options.compressionType)) {
        this._compression = new BodyCompression2(options.compressionType);
      } else {
        const validCompressionTypes = Object.values(CompressionType).filter((v) => typeof v === "string");
        throw new Error(`Unsupported compressionType: ${options.compressionType} Available types: ${validCompressionTypes.join(", ")}`);
      }
    } else {
      this._compression = null;
    }
  }
  _position = 0;
  _started = false;
  _autoDestroy;
  _writeLegacyIpcFormat;
  _compression = null;
  // @ts-ignore
  _sink = new AsyncByteQueue();
  _schema = null;
  _dictionaryBlocks = [];
  _recordBatchBlocks = [];
  _seenDictionaries = /* @__PURE__ */ new Map();
  _dictionaryDeltaOffsets = /* @__PURE__ */ new Map();
  toString(sync = false) {
    return this._sink.toString(sync);
  }
  toUint8Array(sync = false) {
    return this._sink.toUint8Array(sync);
  }
  writeAll(input) {
    if (isPromise(input)) {
      return input.then((x) => this.writeAll(x));
    } else if (isAsyncIterable(input)) {
      return writeAllAsync(this, input);
    }
    return writeAll(this, input);
  }
  get closed() {
    return this._sink.closed;
  }
  [Symbol.asyncIterator]() {
    return this._sink[Symbol.asyncIterator]();
  }
  toDOMStream(options) {
    return this._sink.toDOMStream(options);
  }
  toNodeStream(options) {
    return this._sink.toNodeStream(options);
  }
  close() {
    return this.reset()._sink.close();
  }
  abort(reason) {
    return this.reset()._sink.abort(reason);
  }
  finish() {
    this._autoDestroy ? this.close() : this.reset(this._sink, this._schema);
    return this;
  }
  reset(sink = this._sink, schema = null) {
    if (sink === this._sink || sink instanceof AsyncByteQueue) {
      this._sink = sink;
    } else {
      this._sink = new AsyncByteQueue();
      if (sink && isWritableDOMStream(sink)) {
        this.toDOMStream({ type: "bytes" }).pipeTo(sink);
      } else if (sink && isWritableNodeStream(sink)) {
        this.toNodeStream({ objectMode: false }).pipe(sink);
      }
    }
    if (this._started && this._schema) {
      this._writeFooter(this._schema);
    }
    this._started = false;
    this._dictionaryBlocks = [];
    this._recordBatchBlocks = [];
    this._seenDictionaries = /* @__PURE__ */ new Map();
    this._dictionaryDeltaOffsets = /* @__PURE__ */ new Map();
    if (!schema || !compareSchemas(schema, this._schema)) {
      if (schema == null) {
        this._position = 0;
        this._schema = null;
      } else {
        this._started = true;
        this._schema = schema;
        this._writeSchema(schema);
      }
    }
    return this;
  }
  write(payload) {
    let schema = null;
    if (!this._sink) {
      throw new Error(`RecordBatchWriter is closed`);
    } else if (payload == null) {
      return this.finish() && void 0;
    } else if (payload instanceof Table && !(schema = payload.schema)) {
      return this.finish() && void 0;
    } else if (payload instanceof RecordBatch3 && !(schema = payload.schema)) {
      return this.finish() && void 0;
    }
    if (schema && !compareSchemas(schema, this._schema)) {
      if (this._started && this._autoDestroy) {
        return this.close();
      }
      this.reset(this._sink, schema);
    }
    if (payload instanceof RecordBatch3) {
      if (!(payload instanceof _InternalEmptyPlaceholderRecordBatch2)) {
        this._writeRecordBatch(payload);
      }
    } else if (payload instanceof Table) {
      this.writeAll(payload.batches);
    } else if (isIterable(payload)) {
      this.writeAll(payload);
    }
  }
  _writeMessage(message, alignment = 8) {
    const a = alignment - 1;
    const buffer = Message2.encode(message);
    const flatbufferSize = buffer.byteLength;
    const prefixSize = !this._writeLegacyIpcFormat ? 8 : 4;
    const alignedSize = flatbufferSize + prefixSize + a & ~a;
    const nPaddingBytes = alignedSize - flatbufferSize - prefixSize;
    if (message.headerType === 3 /* RecordBatch */) {
      this._recordBatchBlocks.push(new FileBlock(alignedSize, message.bodyLength, this._position));
    } else if (message.headerType === 2 /* DictionaryBatch */) {
      this._dictionaryBlocks.push(new FileBlock(alignedSize, message.bodyLength, this._position));
    }
    if (!this._writeLegacyIpcFormat) {
      this._write(Int32Array.of(-1));
    }
    this._write(Int32Array.of(alignedSize - prefixSize));
    if (flatbufferSize > 0) {
      this._write(buffer);
    }
    return this._writePadding(nPaddingBytes);
  }
  _write(chunk) {
    if (this._started) {
      const buffer = toUint8Array(chunk);
      if (buffer && buffer.byteLength > 0) {
        this._sink.write(buffer);
        this._position += buffer.byteLength;
      }
    }
    return this;
  }
  _writeSchema(schema) {
    return this._writeMessage(Message2.from(schema));
  }
  // @ts-ignore
  _writeFooter(schema) {
    return this._writeLegacyIpcFormat ? this._write(Int32Array.of(0)) : this._write(Int32Array.of(-1, 0));
  }
  _writeMagic() {
    return this._write(MAGIC);
  }
  _writePadding(nBytes) {
    return nBytes > 0 ? this._write(new Uint8Array(nBytes)) : this;
  }
  _writeRecordBatch(batch) {
    const { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts } = this._assembleRecordBatch(batch);
    const recordBatch = new RecordBatch2(batch.numRows, nodes, bufferRegions, this._compression, variadicBufferCounts, batch.metadata);
    const message = Message2.from(recordBatch, byteLength);
    return this._writeDictionaries(batch)._writeMessage(message)._writeBodyBuffers(buffers);
  }
  _assembleRecordBatch(batch) {
    let { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts } = VectorAssembler.assemble(batch);
    if (this._compression != null) {
      ({ byteLength, bufferRegions, buffers } = this._compressBodyBuffers(buffers));
    }
    return { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts };
  }
  _compressBodyBuffers(buffers) {
    const codec = compressionRegistry.get(this._compression.type);
    if (!codec?.encode || typeof codec.encode !== "function") {
      throw new Error(`Codec for compression type "${CompressionType[this._compression.type]}" has invalid encode method`);
    }
    let currentOffset = 0;
    const compressedBuffers = [];
    const bufferRegions = [];
    for (const buffer of buffers) {
      const byteBuf = toUint8Array(buffer);
      if (byteBuf.length === 0) {
        compressedBuffers.push(new Uint8Array(0), new Uint8Array(0));
        bufferRegions.push(new BufferRegion(currentOffset, 0));
        continue;
      }
      const compressed = codec.encode(byteBuf);
      const isCompressionEffective = compressed.length < byteBuf.length;
      const finalBuffer = isCompressionEffective ? compressed : byteBuf;
      const byteLength = isCompressionEffective ? finalBuffer.length : LENGTH_NO_COMPRESSED_DATA;
      const lengthPrefix = new flatbuffers46.ByteBuffer(new Uint8Array(COMPRESS_LENGTH_PREFIX));
      lengthPrefix.writeInt64(0, BigInt(byteLength));
      compressedBuffers.push(lengthPrefix.bytes(), new Uint8Array(finalBuffer));
      const padding = (currentOffset + 7 & ~7) - currentOffset;
      currentOffset += padding;
      const fullBodyLength = COMPRESS_LENGTH_PREFIX + finalBuffer.length;
      bufferRegions.push(new BufferRegion(currentOffset, fullBodyLength));
      currentOffset += fullBodyLength;
    }
    const finalPadding = (currentOffset + 7 & ~7) - currentOffset;
    currentOffset += finalPadding;
    return { byteLength: currentOffset, bufferRegions, buffers: compressedBuffers };
  }
  _writeDictionaryBatch(dictionary, id, isDelta = false) {
    const { byteLength, nodes, bufferRegions, buffers, variadicBufferCounts } = this._assembleRecordBatch(new Vector([dictionary]));
    const recordBatch = new RecordBatch2(dictionary.length, nodes, bufferRegions, this._compression, variadicBufferCounts);
    const dictionaryBatch = new DictionaryBatch2(recordBatch, id, isDelta);
    const message = Message2.from(dictionaryBatch, byteLength);
    return this._writeMessage(message)._writeBodyBuffers(buffers);
  }
  _writeBodyBuffers(buffers) {
    const bufGroupSize = this._compression != null ? 2 : 1;
    const bufs = new Array(bufGroupSize);
    for (let i = 0; i < buffers.length; i += bufGroupSize) {
      let size = 0;
      for (let j = -1; ++j < bufGroupSize; ) {
        bufs[j] = buffers[i + j];
        size += bufs[j].byteLength;
      }
      if (size === 0) {
        continue;
      }
      for (const buf of bufs) this._write(buf);
      const padding = (size + 7 & ~7) - size;
      if (padding > 0) {
        this._writePadding(padding);
      }
    }
    return this;
  }
  _writeDictionaries(batch) {
    for (const [id, dictionary] of batch.dictionaries) {
      const chunks = dictionary?.data ?? [];
      const prevDictionary = this._seenDictionaries.get(id);
      const offset = this._dictionaryDeltaOffsets.get(id) ?? 0;
      if (!prevDictionary || prevDictionary.data[0] !== chunks[0]) {
        for (const [index, chunk] of chunks.entries()) this._writeDictionaryBatch(chunk, id, index > 0);
      } else if (offset < chunks.length) {
        for (const chunk of chunks.slice(offset)) this._writeDictionaryBatch(chunk, id, true);
      }
      this._seenDictionaries.set(id, dictionary);
      this._dictionaryDeltaOffsets.set(id, chunks.length);
    }
    return this;
  }
};
var RecordBatchStreamWriter = class _RecordBatchStreamWriter extends RecordBatchWriter {
  /** @nocollapse */
  static writeAll(input, options) {
    const writer = new _RecordBatchStreamWriter(options);
    if (isPromise(input)) {
      return input.then((x) => writer.writeAll(x));
    } else if (isAsyncIterable(input)) {
      return writeAllAsync(writer, input);
    }
    return writeAll(writer, input);
  }
};
var RecordBatchFileWriter = class _RecordBatchFileWriter extends RecordBatchWriter {
  /** @nocollapse */
  static writeAll(input, options) {
    const writer = new _RecordBatchFileWriter(options);
    if (isPromise(input)) {
      return input.then((x) => writer.writeAll(x));
    } else if (isAsyncIterable(input)) {
      return writeAllAsync(writer, input);
    }
    return writeAll(writer, input);
  }
  constructor(options) {
    super(options);
    this._autoDestroy = true;
    this._writeLegacyIpcFormat = false;
  }
  // @ts-ignore
  _writeSchema(schema) {
    return this._writeMagic()._writePadding(2);
  }
  _writeDictionaryBatch(dictionary, id, isDelta = false) {
    if (!isDelta && this._seenDictionaries.has(id)) {
      throw new Error("The Arrow File format does not support replacement dictionaries. ");
    }
    return super._writeDictionaryBatch(dictionary, id, isDelta);
  }
  _writeFooter(schema) {
    const buffer = Footer_.encode(new Footer_(
      schema,
      4 /* V5 */,
      this._recordBatchBlocks,
      this._dictionaryBlocks
    ));
    return super._writeFooter(schema)._write(buffer)._write(Int32Array.of(buffer.byteLength))._writeMagic();
  }
};
var RecordBatchJSONWriter = class _RecordBatchJSONWriter extends RecordBatchWriter {
  /** @nocollapse */
  static writeAll(input) {
    return new _RecordBatchJSONWriter().writeAll(input);
  }
  _recordBatches;
  _recordBatchesWithDictionaries;
  constructor() {
    super();
    this._autoDestroy = true;
    this._recordBatches = [];
    this._recordBatchesWithDictionaries = [];
  }
  _writeMessage() {
    return this;
  }
  // @ts-ignore
  _writeFooter(schema) {
    return this;
  }
  _writeSchema(schema) {
    return this._write(`{
  "schema": ${JSON.stringify({ fields: schema.fields.map((field) => fieldToJSON(field)) }, null, 2)}`);
  }
  _writeDictionaries(batch) {
    if (batch.dictionaries.size > 0) {
      this._recordBatchesWithDictionaries.push(batch);
    }
    return this;
  }
  _writeDictionaryBatch(dictionary, id, isDelta = false) {
    this._write(this._dictionaryBlocks.length === 0 ? `    ` : `,
    `);
    this._write(dictionaryBatchToJSON(dictionary, id, isDelta));
    this._dictionaryBlocks.push(new FileBlock(0, 0, 0));
    return this;
  }
  _writeRecordBatch(batch) {
    this._writeDictionaries(batch);
    this._recordBatches.push(batch);
    return this;
  }
  close() {
    if (this._recordBatchesWithDictionaries.length > 0) {
      this._write(`,
  "dictionaries": [
`);
      for (const batch of this._recordBatchesWithDictionaries) {
        super._writeDictionaries(batch);
      }
      this._write(`
  ]`);
    }
    if (this._recordBatches.length > 0) {
      for (let i = -1, n = this._recordBatches.length; ++i < n; ) {
        this._write(i === 0 ? `,
  "batches": [
    ` : `,
    `);
        this._write(recordBatchToJSON(this._recordBatches[i]));
        this._recordBatchBlocks.push(new FileBlock(0, 0, 0));
      }
      this._write(`
  ]`);
    }
    if (this._schema) {
      this._write(`
}`);
    }
    this._recordBatchesWithDictionaries = [];
    this._recordBatches = [];
    return super.close();
  }
};
function writeAll(writer, input) {
  let chunks = input;
  if (input instanceof Table) {
    chunks = input.batches;
    writer.reset(void 0, input.schema);
  }
  for (const batch of chunks) {
    writer.write(batch);
  }
  return writer.finish();
}
async function writeAllAsync(writer, batches) {
  for await (const batch of batches) {
    writer.write(batch);
  }
  return writer.finish();
}
function fieldToJSON({ name, type, nullable }) {
  const assembler = new JSONTypeAssembler();
  return {
    "name": name,
    "nullable": nullable,
    "type": assembler.visit(type),
    "children": (type.children || []).map((field) => fieldToJSON(field)),
    "dictionary": !DataType.isDictionary(type) ? void 0 : {
      "id": type.id,
      "isOrdered": type.isOrdered,
      "indexType": assembler.visit(type.indices)
    }
  };
}
function dictionaryBatchToJSON(dictionary, id, isDelta = false) {
  const [columns] = JSONVectorAssembler.assemble(new RecordBatch3({ [id]: dictionary }));
  return JSON.stringify({
    "id": id,
    "isDelta": isDelta,
    "data": {
      "count": dictionary.length,
      "columns": columns
    }
  }, null, 2);
}
function recordBatchToJSON(records) {
  const [columns] = JSONVectorAssembler.assemble(records);
  return JSON.stringify({
    "count": records.numRows,
    "columns": columns
  }, null, 2);
}

// src/io/whatwg/iterable.ts
function toDOMStream(source, options) {
  if (isAsyncIterable(source)) {
    return asyncIterableAsReadableDOMStream(source, options);
  }
  if (isIterable(source)) {
    return iterableAsReadableDOMStream(source, options);
  }
  throw new Error(`toDOMStream() must be called with an Iterable or AsyncIterable`);
}
function iterableAsReadableDOMStream(source, options) {
  let it = null;
  const bm = options?.type === "bytes" || false;
  const hwm = options?.highWaterMark || 2 ** 24;
  return new ReadableStream({
    ...options,
    start(controller) {
      next(controller, it || (it = source[Symbol.iterator]()));
    },
    pull(controller) {
      it ? next(controller, it) : controller.close();
    },
    cancel() {
      it?.return && it.return();
      it = null;
    }
  }, { highWaterMark: bm ? hwm : void 0, ...options });
  function next(controller, it2) {
    let buf;
    let r = null;
    let size = controller.desiredSize || null;
    while (!(r = it2.next(bm ? size : null)).done) {
      if (ArrayBuffer.isView(r.value) && (buf = toUint8Array(r.value))) {
        size != null && bm && (size = size - buf.byteLength + 1);
        r.value = buf;
      }
      controller.enqueue(r.value);
      if (size != null && --size <= 0) {
        return;
      }
    }
    controller.close();
  }
}
function asyncIterableAsReadableDOMStream(source, options) {
  let it = null;
  const bm = options?.type === "bytes" || false;
  const hwm = options?.highWaterMark || 2 ** 24;
  return new ReadableStream({
    ...options,
    async start(controller) {
      await next(controller, it || (it = source[Symbol.asyncIterator]()));
    },
    async pull(controller) {
      it ? await next(controller, it) : controller.close();
    },
    async cancel() {
      it?.return && await it.return();
      it = null;
    }
  }, { highWaterMark: bm ? hwm : void 0, ...options });
  async function next(controller, it2) {
    let buf;
    let r = null;
    let size = controller.desiredSize || null;
    while (!(r = await it2.next(bm ? size : null)).done) {
      if (ArrayBuffer.isView(r.value) && (buf = toUint8Array(r.value))) {
        size != null && bm && (size = size - buf.byteLength + 1);
        r.value = buf;
      }
      controller.enqueue(r.value);
      if (size != null && --size <= 0) {
        return;
      }
    }
    controller.close();
  }
}

// src/io/whatwg/builder.ts
function builderThroughDOMStream(options) {
  return new BuilderTransform(options);
}
var BuilderTransform = class {
  readable;
  writable;
  _controller;
  _numChunks = 0;
  _finished = false;
  _bufferedSize = 0;
  _builder;
  _getSize;
  constructor(options) {
    const {
      ["readableStrategy"]: readableStrategy,
      ["writableStrategy"]: writableStrategy,
      ["queueingStrategy"]: queueingStrategy = "count",
      ...builderOptions
    } = options;
    this._controller = null;
    this._builder = makeBuilder(builderOptions);
    this._getSize = queueingStrategy !== "bytes" ? chunkLength : chunkByteLength;
    const { ["highWaterMark"]: readableHighWaterMark = queueingStrategy === "bytes" ? 2 ** 14 : 1e3 } = { ...readableStrategy };
    const { ["highWaterMark"]: writableHighWaterMark = queueingStrategy === "bytes" ? 2 ** 14 : 1e3 } = { ...writableStrategy };
    this["readable"] = new ReadableStream({
      ["cancel"]: () => {
        this._builder.clear();
      },
      ["pull"]: (c) => {
        this._maybeFlush(this._builder, this._controller = c);
      },
      ["start"]: (c) => {
        this._maybeFlush(this._builder, this._controller = c);
      }
    }, {
      "highWaterMark": readableHighWaterMark,
      "size": queueingStrategy !== "bytes" ? chunkLength : chunkByteLength
    });
    this["writable"] = new WritableStream({
      ["abort"]: () => {
        this._builder.clear();
      },
      ["write"]: () => {
        this._maybeFlush(this._builder, this._controller);
      },
      ["close"]: () => {
        this._maybeFlush(this._builder.finish(), this._controller);
      }
    }, {
      "highWaterMark": writableHighWaterMark,
      "size": (value) => this._writeValueAndReturnChunkSize(value)
    });
  }
  _writeValueAndReturnChunkSize(value) {
    const bufferedSize = this._bufferedSize;
    this._bufferedSize = this._getSize(this._builder.append(value));
    return this._bufferedSize - bufferedSize;
  }
  _maybeFlush(builder, controller) {
    if (controller == null) {
      return;
    }
    if (this._bufferedSize >= controller.desiredSize) {
      ++this._numChunks && this._enqueue(controller, builder.toVector());
    }
    if (builder.finished) {
      if (builder.length > 0 || this._numChunks === 0) {
        ++this._numChunks && this._enqueue(controller, builder.toVector());
      }
      if (!this._finished && (this._finished = true)) {
        this._enqueue(controller, null);
      }
    }
  }
  _enqueue(controller, chunk) {
    this._bufferedSize = 0;
    this._controller = null;
    chunk == null ? controller.close() : controller.enqueue(chunk);
  }
};
var chunkLength = (chunk) => chunk?.length ?? 0;
var chunkByteLength = (chunk) => chunk?.byteLength ?? 0;

// src/io/whatwg/reader.ts
function recordBatchReaderThroughDOMStream(writableStrategy, readableStrategy) {
  const queue = new AsyncByteQueue();
  let reader = null;
  const readable = new ReadableStream({
    async cancel() {
      await queue.close();
    },
    async start(controller) {
      await next(controller, reader || (reader = await open()));
    },
    async pull(controller) {
      reader ? await next(controller, reader) : controller.close();
    }
  });
  return { writable: new WritableStream(queue, { "highWaterMark": 2 ** 14, ...writableStrategy }), readable };
  async function open() {
    return await (await RecordBatchReader.from(queue)).open(readableStrategy);
  }
  async function next(controller, reader2) {
    let size = controller.desiredSize;
    let r = null;
    while (!(r = await reader2.next()).done) {
      controller.enqueue(r.value);
      if (size != null && --size <= 0) {
        return;
      }
    }
    controller.close();
  }
}

// src/io/whatwg/writer.ts
function recordBatchWriterThroughDOMStream(writableStrategy, readableStrategy) {
  const writer = new this(writableStrategy);
  const reader = new AsyncByteStream(writer);
  const readable = new ReadableStream({
    // type: 'bytes',
    async cancel() {
      await reader.cancel();
    },
    async pull(controller) {
      await next(controller);
    },
    async start(controller) {
      await next(controller);
    }
  }, { "highWaterMark": 2 ** 14, ...readableStrategy });
  return { writable: new WritableStream(writer, writableStrategy), readable };
  async function next(controller) {
    let buf = null;
    let size = controller.desiredSize;
    while (buf = await reader.read(size || null)) {
      controller.enqueue(buf);
      if (size != null && (size -= buf.byteLength) <= 0) {
        return;
      }
    }
    controller.close();
  }
}

// src/ipc/serialization.ts
function tableFromIPC(input) {
  const reader = RecordBatchReader.from(input);
  if (isPromise(reader)) {
    return reader.then((reader2) => tableFromIPC(reader2));
  }
  if (reader.isAsync()) {
    return reader.readAll().then((xs) => new Table(xs));
  }
  return new Table(reader.readAll());
}
function tableToIPC(table, type = "stream", compressionType = null) {
  const writerOptions = { compressionType };
  return (type === "stream" ? RecordBatchStreamWriter : RecordBatchFileWriter).writeAll(table, writerOptions).toUint8Array(true);
}

// src/util/typecheck.ts
var typecheck_exports = {};
__export(typecheck_exports, {
  isArrowData: () => isArrowData,
  isArrowDataType: () => isArrowDataType,
  isArrowField: () => isArrowField,
  isArrowRecordBatch: () => isArrowRecordBatch,
  isArrowSchema: () => isArrowSchema,
  isArrowTable: () => isArrowTable,
  isArrowVector: () => isArrowVector
});
function isArrowSchema(x) {
  return Schema2.isSchema(x);
}
function isArrowField(x) {
  return Field2.isField(x);
}
function isArrowDataType(x) {
  return DataType.isDataType(x);
}
function isArrowData(x) {
  return Data.isData(x);
}
function isArrowVector(x) {
  return Vector.isVector(x);
}
function isArrowRecordBatch(x) {
  return RecordBatch3.isRecordBatch(x);
}
function isArrowTable(x) {
  return Table.isTable(x);
}

// src/Arrow.ts
var util = {
  ...bn_exports,
  ...int_exports,
  ...bit_exports,
  ...math_exports,
  ...buffer_exports,
  ...vector_exports,
  ...pretty_exports,
  ...interval_exports,
  ...typecheck_exports,
  compareSchemas,
  compareFields,
  compareTypes
};

// src/Arrow.dom.ts
adapters_default.toDOMStream = toDOMStream;
Builder["throughDOM"] = builderThroughDOMStream;
RecordBatchReader["throughDOM"] = recordBatchReaderThroughDOMStream;
RecordBatchFileReader["throughDOM"] = recordBatchReaderThroughDOMStream;
RecordBatchStreamReader["throughDOM"] = recordBatchReaderThroughDOMStream;
RecordBatchWriter["throughDOM"] = recordBatchWriterThroughDOMStream;
RecordBatchFileWriter["throughDOM"] = recordBatchWriterThroughDOMStream;
RecordBatchStreamWriter["throughDOM"] = recordBatchWriterThroughDOMStream;
export {
  AsyncByteQueue,
  AsyncByteStream,
  AsyncMessageReader,
  AsyncRecordBatchFileReader,
  AsyncRecordBatchStreamReader,
  Binary2 as Binary,
  BinaryBuilder,
  BinaryView2 as BinaryView,
  BinaryViewBuilder,
  Bool2 as Bool,
  BoolBuilder,
  BufferType,
  Builder,
  ByteStream,
  CompressionType,
  Data,
  DataType,
  DateBuilder,
  DateDay,
  DateDayBuilder,
  DateMillisecond,
  DateMillisecondBuilder,
  DateUnit,
  Date_,
  Decimal2 as Decimal,
  DecimalBuilder,
  DenseUnion,
  DenseUnionBuilder,
  Dictionary,
  DictionaryBuilder,
  Duration2 as Duration,
  DurationBuilder,
  DurationMicrosecond,
  DurationMicrosecondBuilder,
  DurationMillisecond,
  DurationMillisecondBuilder,
  DurationNanosecond,
  DurationNanosecondBuilder,
  DurationSecond,
  DurationSecondBuilder,
  Field2 as Field,
  FixedSizeBinary2 as FixedSizeBinary,
  FixedSizeBinaryBuilder,
  FixedSizeList2 as FixedSizeList,
  FixedSizeListBuilder,
  Float,
  Float16,
  Float16Builder,
  Float32,
  Float32Builder,
  Float64,
  Float64Builder,
  FloatBuilder,
  Int_ as Int,
  Int16,
  Int16Builder,
  Int32,
  Int32Builder,
  Int64,
  Int64Builder,
  Int8,
  Int8Builder,
  IntBuilder,
  Interval_ as Interval,
  IntervalBuilder,
  IntervalDayTime,
  IntervalDayTimeBuilder,
  IntervalMonthDayNano,
  IntervalMonthDayNanoBuilder,
  IntervalUnit,
  IntervalYearMonth,
  IntervalYearMonthBuilder,
  JSONMessageReader,
  LargeBinary2 as LargeBinary,
  LargeBinaryBuilder,
  LargeList2 as LargeList,
  LargeListBuilder,
  LargeUtf82 as LargeUtf8,
  LargeUtf8Builder,
  List2 as List,
  ListBuilder,
  MapBuilder,
  MapRow,
  Map_,
  Message2 as Message,
  MessageHeader,
  MessageReader,
  MetadataVersion,
  Null2 as Null,
  NullBuilder,
  Precision,
  RecordBatch3 as RecordBatch,
  RecordBatchFileReader,
  RecordBatchFileWriter,
  RecordBatchJSONWriter,
  RecordBatchReader,
  RecordBatchStreamReader,
  RecordBatchStreamWriter,
  RecordBatchWriter,
  Schema2 as Schema,
  SparseUnion,
  SparseUnionBuilder,
  Struct,
  StructBuilder,
  StructRow,
  Table,
  Time_ as Time,
  TimeBuilder,
  TimeMicrosecond,
  TimeMicrosecondBuilder,
  TimeMillisecond,
  TimeMillisecondBuilder,
  TimeNanosecond,
  TimeNanosecondBuilder,
  TimeSecond,
  TimeSecondBuilder,
  TimeUnit,
  Timestamp_ as Timestamp,
  TimestampBuilder,
  TimestampMicrosecond,
  TimestampMicrosecondBuilder,
  TimestampMillisecond,
  TimestampMillisecondBuilder,
  TimestampNanosecond,
  TimestampNanosecondBuilder,
  TimestampSecond,
  TimestampSecondBuilder,
  Type2 as Type,
  Uint16,
  Uint16Builder,
  Uint32,
  Uint32Builder,
  Uint64,
  Uint64Builder,
  Uint8,
  Uint8Builder,
  Union_ as Union,
  UnionBuilder,
  UnionMode,
  Utf82 as Utf8,
  Utf8Builder,
  Utf8View2 as Utf8View,
  Utf8ViewBuilder,
  Vector,
  Visitor,
  builderThroughAsyncIterable,
  builderThroughIterable,
  compressionRegistry,
  isArrowData,
  isArrowDataType,
  isArrowField,
  isArrowRecordBatch,
  isArrowSchema,
  isArrowTable,
  isArrowVector,
  makeBuilder,
  makeData,
  makeTable,
  makeVector,
  tableFromArrays,
  tableFromIPC,
  tableFromJSON,
  tableToIPC,
  util,
  vectorFromArray
};
//# sourceMappingURL=Arrow.dom.mjs.map
