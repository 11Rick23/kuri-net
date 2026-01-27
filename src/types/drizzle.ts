import { customType } from "drizzle-orm/pg-core";

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
			if (Buffer.isBuffer(value)) return new Uint8Array(value); // copy -> ArrayBuffer
			if (value instanceof Uint8Array) return new Uint8Array(value); // copy -> ArrayBuffer
			return new Uint8Array(value as any);
		},
	})(name);
