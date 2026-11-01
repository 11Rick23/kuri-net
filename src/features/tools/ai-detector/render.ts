import { pageStyles } from "./pageStyles";
import type { DetectionResult, DetectionStatus } from "./server/types";

const presentations: Record<
	DetectionStatus,
	{
		title: string;
		ending: string;
		description: string;
		note: string;
		label: string;
		variant: "public" | "verified-openai" | "verified-test-agent";
	}
> = {
	verified_openai: {
		title: "あなたは",
		ending: "ChatGPTです",
		description: "OpenAIの公開鍵で、このアクセスの署名を確認しました。",
		note: "識別したのは署名主体です。利用者の個人情報や、どのモデルを使っているかは分かりません。",
		label: "VERIFIED CHATGPT AGENT VERSION",
		variant: "verified-openai",
	},
	verified_test_agent: {
		title: "あなたは",
		ending: "テストエージェントです",
		description: "ローカル実験用の鍵で、署名を確認しました。",
		note: "これはOpenAIの署名ではありません。テスト用の検証環境でのみ表示されます。",
		label: "VERIFIED TEST AGENT VERSION",
		variant: "verified-test-agent",
	},
	unsigned: {
		title: "あなたは",
		ending: "誰でしょう？",
		description: "このアクセスには、識別用の署名がありません。",
		note: "普通のブラウザも、署名を送らないAIも、この画面になります。人間かAIかを断定することはできません。",
		label: "PUBLIC VERSION",
		variant: "public",
	},
	invalid_signature: {
		title: "アクセス元を",
		ending: "確認できませんでした",
		description: "署名が不正、期限切れ、または検証条件を満たしていません。",
		note: "ヘッダーでChatGPTを名乗るだけでは、確認済みとして扱いません。",
		label: "PUBLIC VERSION",
		variant: "public",
	},
	unknown_signer: {
		title: "アクセス元を",
		ending: "確認できませんでした",
		description: "この署名主体は、検証対象に登録されていません。",
		note: "このページでは、OpenAIの署名を検証します。未知の署名主体へ公開鍵を問い合わせることはありません。",
		label: "PUBLIC VERSION",
		variant: "public",
	},
	verification_error: {
		title: "署名を",
		ending: "検証できませんでした",
		description: "公開鍵の取得など、検証に必要な処理を完了できませんでした。",
		note: "確認済みとして扱わず、一般向けの画面を表示しています。時間をおいて再度お試しください。",
		label: "PUBLIC VERSION",
		variant: "public",
	},
};

export function contentVariant(result: DetectionResult) {
	return presentations[result.status].variant;
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		switch (character) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case '"':
				return "&quot;";
			default:
				return "&#39;";
		}
	});
}

function row(label: string, value: string) {
	return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`;
}

export function renderDetectionPage(
	result: DetectionResult,
	requestId: string,
) {
	const presentation = presentations[result.status];
	const replay =
		result.replayProtection === "nonce"
			? "nonceの再利用をこのサーバープロセス内で確認しました。再起動や別プロセスをまたぐ再利用は検出できません。"
			: result.replayProtection === "unavailable"
				? "nonceがないため、署名の再利用を検出できません。署名の有効期間のみ確認しています。"
				: "このアクセスは、再利用チェックを通過した署名として扱っていません。";
	const observations = result.signatures
		.map(
			(signature) => `
<h2>署名 ${escapeHtml(signature.label)}</h2>
<dl>
${row("暗号学的な検証", signature.authenticated ? "成功" : "未確認")}
${row("アルゴリズム", signature.algorithm ?? "指定なし・未確定")}
${row("鍵ID", signature.keyid ?? "なし")}
${row("署名対象", signature.components.join(", ") || "なし")}
${row("作成時刻", signature.created === null ? "なし" : String(signature.created))}
${row("有効期限", signature.expires === null ? "なし" : String(signature.expires))}
${row("nonce", signature.noncePresent ? "あり（値は表示しません）" : "なし")}
</dl>`,
		)
		.join("");
	return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="HTTP Message Signaturesを使って、アクセスの署名を検証します。">
<title>AIエージェント判定 | kuri-net</title>
<link rel="icon" href="/favicon.ico">
<style>${pageStyles}</style>
</head>
<body data-variant="${presentation.variant}">
<a class="skip" href="#main-content">本文へ移動</a>
<div class="page">
<header><a class="brand" href="/">kuri-net</a><nav aria-label="アプリ"><a href="/apps">アプリ一覧に戻る</a></nav></header>
<main id="main-content">
<p class="eyebrow">AIエージェント判定</p>
<h1>${presentation.title}<span>${presentation.ending}</span></h1>
<p class="explanation">${presentation.description}</p>
<p class="note">${presentation.note}</p>
<p class="variant"><code>${presentation.label}</code></p>
<details class="details">
<summary>判定の詳細を見る</summary>
<div class="details-content">
<dl>
${row("検証状態", result.status)}
${row("理由", result.reason)}
${row("Signature-Agent", result.signatureAgent ?? "なし")}
${row("署名主体の形式", result.agentFormat ?? "なし・解析できませんでした")}
${row("採用した署名", result.selectedSignature ?? "なし")}
${row("リクエストID", requestId)}
</dl>
<p>${replay}</p>
<p>署名で保護されるのは、署名対象に含まれる情報だけです。ホストだけが対象の場合、同じホスト内のパス変更は検出できません。詳細の値は、暗号学的な検証が成功するまでは送信元の申告です。</p>
${observations}
</div>
</details>
</main>
<footer><p>HTTP Message Signaturesによる識別実験</p><a href="https://www.rfc-editor.org/rfc/rfc9421.html" rel="noreferrer">RFC 9421を読む</a></footer>
</div>
</body>
</html>`;
}
