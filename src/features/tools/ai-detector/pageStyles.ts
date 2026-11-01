export const pageStyles = `
:root {
	color-scheme: light dark;
	--canvas: #1e66f5;
	--ink: #ffffff;
	--line: currentColor;
	font-family: -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--canvas); color: var(--ink); }
body[data-variant="verified-openai"] { --canvas: #fe640b; --ink: #181926; }
body[data-variant="verified-test-agent"] { --canvas: #a6da95; --ink: #181926; }
a { color: inherit; text-underline-offset: .3em; }
a, summary { cursor: pointer; }
a:hover { text-decoration-thickness: 3px; }
a:active { text-underline-offset: .15em; }
:focus-visible { outline: 3px solid currentColor; outline-offset: 6px; border-radius: 2px; }
.skip { position: fixed; top: 12px; left: 12px; transform: translateY(-200%); padding: 12px; background: var(--canvas); z-index: 1; }
.skip:focus { transform: none; }
.page { width: min(1280px, 100%); margin: auto; padding: 0 clamp(24px, 5vw, 72px); }
header { display: flex; justify-content: space-between; align-items: center; gap: 24px; min-height: 100px; border-bottom: 1px solid var(--line); }
header a { display: inline-flex; align-items: center; min-height: 44px; font-size: 16px; }
.brand { font-size: 24px; font-weight: 500; text-decoration: none; }
.brand:hover { text-decoration: underline; }
main { padding: clamp(60px, 10vh, 120px) 0 64px; }
.eyebrow { margin: 0 0 32px; font-size: 15px; font-weight: 500; }
h1 { margin: 0; font-size: clamp(48px, 8.8vw, 112px); font-weight: 700; letter-spacing: -.045em; line-height: 1.22; overflow-wrap: anywhere; }
h1 span { display: block; }
.explanation { max-width: 640px; margin: 36px 0 0; font-size: clamp(17px, 2vw, 21px); line-height: 1.9; }
.note { max-width: 640px; margin: 16px 0 0; font-size: 14px; line-height: 1.9; }
.variant { margin: 48px 0 0; font-size: 13px; line-height: 1.8; overflow-wrap: anywhere; }
.details { margin-top: 56px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
summary { padding: 22px 0; font-size: 16px; min-height: 64px; }
summary:hover { text-decoration: underline; text-underline-offset: .3em; }
summary:active { text-decoration-thickness: 3px; }
.details-content { padding: 0 0 28px; max-width: 900px; }
dl { display: grid; grid-template-columns: minmax(120px, 180px) minmax(0, 1fr); gap: 16px 24px; margin: 12px 0 24px; font-size: 14px; line-height: 1.8; }
dt { font-weight: 700; }
dd { margin: 0; overflow-wrap: anywhere; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .95em; }
.details p { font-size: 14px; line-height: 1.9; margin: 16px 0 0; }
.details h2 { font-size: 17px; margin: 28px 0 16px; }
footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 32px; padding: 24px 0 32px; border-top: 1px solid var(--line); font-size: 13px; line-height: 1.8; }
footer p { margin: 0; }
footer a { display: inline-flex; min-height: 44px; align-items: center; }
@media (prefers-color-scheme: dark) {
	:root { --canvas: #8aadf4; --ink: #181926; }
	body[data-variant="verified-openai"] { --canvas: #f5a97f; }
}
@media (max-width: 480px) {
	header { min-height: 84px; }
	main { padding-top: 56px; }
	.eyebrow { margin-bottom: 24px; }
	dl { grid-template-columns: minmax(0, 1fr); gap: 6px; }
	dd { margin-bottom: 16px; }
	.details { margin-top: 40px; }
}
`;
