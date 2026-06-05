import { TypeMap } from '../../type.js';
import { RecordBatch } from '../../recordbatch.js';
/** @ignore */
export declare function recordBatchReaderThroughDOMStream<T extends TypeMap = any>(writableStrategy?: ByteLengthQueuingStrategy, readableStrategy?: {
    autoDestroy: boolean;
}): {
    writable: WritableStream<Uint8Array<ArrayBufferLike> | import("../../util/buffer.js").ArrayBufferViewInput>;
    readable: ReadableStream<RecordBatch<T>>;
};
//# sourceMappingURL=reader.d.ts.map