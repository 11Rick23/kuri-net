import { customType } from "drizzle-orm/pg-core";

const toArrayBackedUint8Array = (
	value: ArrayLike<number>,
): Uint8Array<ArrayBuffer> => Uint8Array.from(value);

// PostgreSQLのbytea型を扱うための定義
export const bytea = (name: string) =>
	customType<{ data: Uint8Array<ArrayBuffer>; driverData: Buffer }>({
		dataType() {
			return "bytea";
		},

		// アプリ → DBドライバ（pgはbyteaにBufferを期待することが多い）
		toDriver(value: Uint8Array) {
			return Buffer.from(value);
		},

		// DBドライバ → アプリ（必ず ArrayBuffer ベースの Uint8Array に正規化）
		fromDriver(value: unknown): Uint8Array<ArrayBuffer> {
			if (Buffer.isBuffer(value)) return toArrayBackedUint8Array(value);
			if (value instanceof Uint8Array) return toArrayBackedUint8Array(value);
			if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
			if (ArrayBuffer.isView(value)) {
				return toArrayBackedUint8Array(
					new Uint8Array(value.buffer, value.byteOffset, value.byteLength),
				);
			}
			throw new TypeError(
				"Expected bytea driver data to be binary-compatible.",
			);
		},
	})(name);
