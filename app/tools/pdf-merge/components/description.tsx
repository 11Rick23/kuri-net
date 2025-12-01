export default function Description() {
	return (
		<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
			<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
				使い方
			</h3>
			<ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
				<li>
					「PDFファイルを選択」ボタンから統合したいPDFファイルを選択します
				</li>
				<li>複数のファイルを一度に選択できます（追加選択も可能）</li>
				<li>リスト内でファイルの順序を確認します（この順序で統合されます）</li>
				<li>「PDFを統合してダウンロード」ボタンをクリックします</li>
				<li>統合されたPDFファイルが自動的にダウンロードされます</li>
			</ol>
		</div>
	);
}
