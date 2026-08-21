import { MdAutoAwesome, MdHelpOutline } from "react-icons/md";
import ToolBadge from "@/features/tools/components/ToolBadge";
import {
	type DifficultyKey,
	difficultyDefinitions,
	difficultyKeys,
} from "@/features/tools/minesweeper/model";

export type BoardSettings = {
	width: number;
	height: number;
	mineCount: number;
	difficulty: DifficultyKey;
};

const presetKeys = ["beginner", "intermediate", "advanced"] as const;

function BoardSettingsFields({
	settings,
	onChange,
	disabled,
}: {
	settings: BoardSettings;
	onChange: (settings: BoardSettings) => void;
	disabled: boolean;
}) {
	const updateNumber = (
		key: "width" | "height" | "mineCount",
		value: string,
	) => {
		onChange({ ...settings, [key]: Number(value) });
	};

	return (
		<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
			{(
				[
					["width", "幅", 5, 20],
					["height", "高さ", 5, 20],
					[
						"mineCount",
						"地雷数目安",
						1,
						Math.max(1, settings.width * settings.height - 9),
					],
				] as const
			).map(([key, label, min, max]) => (
				<label key={key} className="grid gap-1 text-xs text-ctp-subtext1">
					<span>{label}</span>
					<input
						type="number"
						min={min}
						max={max}
						value={settings[key]}
						disabled={disabled}
						onChange={(event) => updateNumber(key, event.target.value)}
						className="h-9 min-w-0 rounded-md border border-ctp-surface1 bg-ctp-mantle px-2 text-sm text-ctp-text transition focus:border-ctp-blue disabled:opacity-50"
					/>
				</label>
			))}
			<div className="grid gap-1 text-xs text-ctp-subtext1">
				<div className="flex items-center gap-1">
					<span>推論難度</span>
					<ToolBadge
						icon={<MdHelpOutline size={15} aria-hidden="true" />}
						ariaLabel="推論難度の説明を表示"
						triggerClassName="!p-0 text-ctp-subtext0 hover:text-ctp-blue"
						contentToneClassName="!right-auto !left-0 w-64 !translate-x-0 text-left leading-5"
						wrapContent
					>
						盤面を解くために必要な推論1手あたりの平均的な複雑さです。盤面サイズや地雷数とは別で、高いほど集合比較や候補の組み合わせを使う盤面になります。
					</ToolBadge>
				</div>
				<select
					aria-label="推論難度"
					value={settings.difficulty}
					disabled={disabled}
					onChange={(event) =>
						onChange({
							...settings,
							difficulty: event.target.value as DifficultyKey,
						})
					}
					className="h-9 min-w-0 cursor-pointer rounded-md border border-ctp-surface1 bg-ctp-mantle px-2 text-sm text-ctp-text transition focus:border-ctp-blue disabled:cursor-not-allowed disabled:opacity-50"
				>
					{difficultyKeys.map((key) => (
						<option key={key} value={key}>
							{difficultyDefinitions[key].label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export default function MinesweeperSettings({
	settings,
	onChange,
	onGenerate,
	isGenerating,
	generationError,
}: {
	settings: BoardSettings;
	onChange: (settings: BoardSettings) => void;
	onGenerate: () => void;
	isGenerating: boolean;
	generationError: string | null;
}) {
	const selectedPreset = presetKeys.find((key) => {
		const preset = difficultyDefinitions[key];
		return (
			settings.width === preset.width &&
			settings.height === preset.height &&
			settings.mineCount === preset.mineCount &&
			settings.difficulty === key
		);
	});

	return (
		<section
			aria-label="難易度と盤面設定"
			className="rounded-lg border border-ctp-surface1 bg-ctp-base p-3"
		>
			<div className="grid justify-items-center gap-5 md:grid-cols-[5rem_minmax(19rem,24rem)_auto] md:items-center md:justify-center">
				<fieldset className="grid w-full max-w-xs grid-cols-3 gap-2 md:w-20 md:grid-cols-1 md:justify-self-center">
					<legend className="sr-only">設定プリセット</legend>
					{presetKeys.map((key) => {
						const definition = difficultyDefinitions[key];
						const active = selectedPreset === key;
						return (
							<button
								key={key}
								type="button"
								aria-pressed={active}
								aria-label={`${definition.label}、${definition.width}×${definition.height}、地雷目安${definition.mineCount}`}
								disabled={isGenerating}
								onClick={() => onChange({ ...definition, difficulty: key })}
								className={[
									"h-9 cursor-pointer rounded-md border px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
									active
										? "border-ctp-blue bg-ctp-blue/15 text-ctp-blue"
										: "border-ctp-surface1 bg-ctp-mantle text-ctp-subtext1 hover:border-ctp-overlay0 hover:text-ctp-text",
								].join(" ")}
							>
								{definition.label}
							</button>
						);
					})}
				</fieldset>
				<div className="w-full max-w-xs sm:max-w-sm md:flex md:max-w-none md:items-center md:self-stretch md:border-x md:border-ctp-surface1 md:px-6">
					<BoardSettingsFields
						settings={settings}
						onChange={onChange}
						disabled={isGenerating}
					/>
				</div>
				<button
					type="button"
					disabled={isGenerating}
					onClick={onGenerate}
					className="inline-flex h-9 w-auto shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-ctp-blue px-4 text-sm font-bold text-ctp-base transition hover:bg-ctp-sapphire disabled:cursor-wait disabled:opacity-60 md:justify-self-center"
				>
					<MdAutoAwesome size={18} aria-hidden="true" />
					{isGenerating ? "論理検証中…" : "盤面を生成"}
				</button>
			</div>

			{generationError && (
				<p
					role="alert"
					className="mt-3 rounded-md border border-ctp-red/40 bg-ctp-red/10 px-3 py-2 text-sm text-ctp-red"
				>
					{generationError}
				</p>
			)}
		</section>
	);
}
