import { validateNotepadContent } from "@/features/tools/notepad/domain/content";

export type QueuedSaveDecision =
	| { type: "none" }
	| { type: "invalid"; content: string; error: string }
	| { type: "save"; content: string };

export type SaveQueueOutcome =
	| { type: "drained" }
	| { type: "invalid"; error: string }
	| { type: "failed" };

export type SaveQueueAdapter<Result> = {
	getQueuedContent: () => string | null;
	setQueuedContent: (content: string | null) => void;
	getCurrentContent: () => string;
	getLastSavedContent: () => string;
	setLastSavedContent: (content: string) => void;
	save: (content: string) => Promise<Result>;
	onSaveStart?: (content: string) => void;
	onSaveSuccess?: (result: Result, content: string) => void;
};

export function decideQueuedSave(
	queuedContent: string | null,
	lastSavedContent: string,
): QueuedSaveDecision {
	if (queuedContent === null || queuedContent === lastSavedContent) {
		return { type: "none" };
	}

	const validated = validateNotepadContent(queuedContent);

	if (!validated.ok) {
		return {
			type: "invalid",
			content: queuedContent,
			error: validated.error,
		};
	}

	return { type: "save", content: validated.value };
}

export async function drainSaveQueue<Result>(
	adapter: SaveQueueAdapter<Result>,
): Promise<SaveQueueOutcome> {
	while (true) {
		const queuedContent = adapter.getQueuedContent();
		const decision = decideQueuedSave(
			queuedContent,
			adapter.getLastSavedContent(),
		);

		if (decision.type === "none") {
			if (queuedContent !== null) {
				adapter.setQueuedContent(null);
				continue;
			}

			return { type: "drained" };
		}

		if (decision.type === "invalid") {
			return { type: "invalid", error: decision.error };
		}

		adapter.setQueuedContent(null);
		adapter.onSaveStart?.(decision.content);

		try {
			const result = await adapter.save(decision.content);
			adapter.setLastSavedContent(decision.content);
			adapter.onSaveSuccess?.(result, decision.content);
		} catch {
			adapter.setQueuedContent(adapter.getCurrentContent());
			return { type: "failed" };
		}
	}
}

export function getStateAfterQueueDrained(
	currentContent: string,
	lastSavedContent: string,
): "saved" | "pending" {
	return currentContent === lastSavedContent ? "saved" : "pending";
}
