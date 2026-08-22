import { describe, expect, test } from "bun:test";
import {
	decideDialogKeyboardAction,
	lockBodyScroll,
	resolveFocusReturnTarget,
} from "@/shared/components/modal/dialogAccessibility";

describe("dialog accessibility", () => {
	test("Escape許可時だけダイアログを閉じる", () => {
		// 機能要件：ダイアログは許可された場合だけEscapeキーで閉じる。
		// Given / When
		const allowed = decideDialogKeyboardAction({
			key: "Escape",
			shiftKey: false,
			closeOnEscape: true,
			focusableCount: 1,
			activePosition: "first",
		});
		const blocked = decideDialogKeyboardAction({
			key: "Escape",
			shiftKey: false,
			closeOnEscape: false,
			focusableCount: 1,
			activePosition: "first",
		});

		// Then
		expect(allowed).toBe("close");
		expect(blocked).toBe("none");
	});

	test("Tab操作を先頭と末尾の間で循環させる", () => {
		// 機能要件：フォーカスは開いているダイアログの外へ移動しない。
		// Given / When
		const fromLast = decideDialogKeyboardAction({
			key: "Tab",
			shiftKey: false,
			closeOnEscape: true,
			focusableCount: 3,
			activePosition: "last",
		});
		const fromFirst = decideDialogKeyboardAction({
			key: "Tab",
			shiftKey: true,
			closeOnEscape: true,
			focusableCount: 3,
			activePosition: "first",
		});
		const fromOutside = decideDialogKeyboardAction({
			key: "Tab",
			shiftKey: false,
			closeOnEscape: true,
			focusableCount: 3,
			activePosition: "outside",
		});

		// Then
		expect(fromLast).toBe("focus-first");
		expect(fromFirst).toBe("focus-last");
		expect(fromOutside).toBe("focus-first");
	});

	test("操作可能要素がない場合はダイアログ自体へフォーカスする", () => {
		// 機能要件：操作可能要素がないダイアログでもフォーカスを内部へ維持する。
		// Given / When
		const action = decideDialogKeyboardAction({
			key: "Tab",
			shiftKey: false,
			closeOnEscape: true,
			focusableCount: 0,
			activePosition: "container",
		});

		// Then
		expect(action).toBe("focus-container");
	});

	test("操作可能要素が1つだけでもTab操作を内部へ留める", () => {
		// 機能要件：閉じるボタンだけのダイアログでもTab操作でフォーカスを外へ出さない。
		// Given / When
		const forward = decideDialogKeyboardAction({
			key: "Tab",
			shiftKey: false,
			closeOnEscape: true,
			focusableCount: 1,
			activePosition: "only",
		});
		const backward = decideDialogKeyboardAction({
			key: "Tab",
			shiftKey: true,
			closeOnEscape: true,
			focusableCount: 1,
			activePosition: "only",
		});

		// Then
		expect(forward).toBe("focus-first");
		expect(backward).toBe("focus-last");
	});

	test("表示中だけbodyのスクロールを固定して元の値へ戻す", () => {
		// 機能要件：ダイアログ表示中は背景スクロールを止め、閉じたら以前の設定へ戻す。
		// Given
		const style = { overflow: "auto" };

		// When
		const unlock = lockBodyScroll(style);

		// Then
		expect(style.overflow).toBe("hidden");
		unlock();
		expect(style.overflow).toBe("auto");
	});

	test("元の要素が消えた場合は指定された代替要素へ戻す", () => {
		// 機能要件：モーダルを開いた要素が消えても、関連する操作へフォーカスを復帰する。
		// Given
		const removed = { isConnected: false, focus: () => {} } as HTMLElement;
		const fallback = { isConnected: true, focus: () => {} } as HTMLElement;

		// When
		const target = resolveFocusReturnTarget(removed, () => fallback);

		// Then
		expect(target).toBe(fallback);
	});
});
