import { describe, expect, test } from "bun:test";
import { NOTEPAD_CONTENT_MAX_CODE_POINTS } from "@/features/tools/notepad/domain/content";
import {
	decideQueuedSave,
	drainSaveQueue,
	getStateAfterQueueDrained,
} from "@/features/tools/notepad/domain/saveQueue";

describe("notepad save queue", () => {
	test("保存中に追加入力して失敗しても自動再送せず最新本文を保持する", async () => {
		// 機能要件：保存処理中に本文が変わって失敗した場合は、最新本文を再試行対象として保持する。
		// 非機能要件：保存失敗後に最新本文を自動で連続送信せず、エラー状態で停止する。
		// Given
		let currentContent = "最初の本文";
		let queuedContent: string | null = currentContent;
		let lastSavedContent = "保存済み";
		let rejectSave: (reason?: unknown) => void = () => {};
		const saveCalls: string[] = [];
		const delayedFailure = new Promise<never>((_resolve, reject) => {
			rejectSave = reject;
		});
		const adapter = {
			getQueuedContent: () => queuedContent,
			setQueuedContent: (content: string | null) => {
				queuedContent = content;
			},
			getCurrentContent: () => currentContent,
			getLastSavedContent: () => lastSavedContent,
			setLastSavedContent: (content: string) => {
				lastSavedContent = content;
			},
			save: async (content: string) => {
				saveCalls.push(content);
				return delayedFailure;
			},
		};

		// When
		const processing = drainSaveQueue(adapter);
		await Promise.resolve();
		currentContent = "保存中に追加入力した本文";
		queuedContent = currentContent;
		rejectSave(new Error("保存失敗"));
		const result = await processing;

		// Then
		expect(result).toEqual({ type: "failed" });
		expect(saveCalls).toEqual(["最初の本文"]);
		expect(queuedContent).toBe("保存中に追加入力した本文");
		expect(lastSavedContent).toBe("保存済み");
	});

	test("保存失敗後の手動再試行では保持した最新本文だけを送信する", async () => {
		// 機能要件：保存失敗後に再試行すると、失敗時点で保持した最新本文を保存対象にする。
		// Given
		let queuedContent: string | null = "最新本文";
		let lastSavedContent = "保存済み";
		const saveCalls: string[] = [];

		// When
		const result = await drainSaveQueue({
			getQueuedContent: () => queuedContent,
			setQueuedContent: (content) => {
				queuedContent = content;
			},
			getCurrentContent: () => "最新本文",
			getLastSavedContent: () => lastSavedContent,
			setLastSavedContent: (content) => {
				lastSavedContent = content;
			},
			save: async (content) => {
				saveCalls.push(content);
				return { updatedAt: "2026-08-22T00:00:00.000Z" };
			},
		});

		// Then
		expect(result).toEqual({ type: "drained" });
		expect(saveCalls).toEqual(["最新本文"]);
		expect(queuedContent).toBeNull();
		expect(lastSavedContent).toBe("最新本文");
	});

	test("上限超過後に有効な本文へ戻すと保存可能になる", () => {
		// 機能要件：上限超過で停止した後も、本文を上限内へ直せば再試行できる。
		// Given
		const lastSavedContent = "保存済み";
		const overLimit = "🍑".repeat(NOTEPAD_CONTENT_MAX_CODE_POINTS + 1);

		// When
		const rejected = decideQueuedSave(overLimit, lastSavedContent);
		const corrected = decideQueuedSave("修正済み", lastSavedContent);

		// Then
		expect(rejected.type).toBe("invalid");
		expect(corrected).toEqual({ type: "save", content: "修正済み" });
	});

	test("キュー処理後は現在本文と保存済み本文の差から状態を決める", () => {
		// 機能要件：キュー処理後に未保存内容がなければ保存済み、残っていれば未保存とする。
		// Given / When
		const saved = getStateAfterQueueDrained("同じ本文", "同じ本文");
		const pending = getStateAfterQueueDrained("編集中", "保存済み");

		// Then
		expect(saved).toBe("saved");
		expect(pending).toBe("pending");
	});
});
