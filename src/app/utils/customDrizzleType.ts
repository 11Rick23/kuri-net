import { customType } from "drizzle-orm/pg-core";

// PostgreSQLのbytea型を扱うための定義
export const bytea = (name: string) =>
	customType<{ data: Uint8Array; driverData: Buffer }>({
		dataType() {
			return "bytea";
		},

		// アプリ → DBドライバ（pgはbyteaにBufferを期待することが多い）
		toDriver(value: Uint8Array) {
			return Buffer.from(value);
		},

		// DBドライバ → アプリ（BufferをUint8Arrayに戻す）
		fromDriver(value: unknown) {
			if (Buffer.isBuffer(value)) return new Uint8Array(value);
			if (value instanceof Uint8Array) return value;
			return new Uint8Array(value as any);
		},
	})(name);
