import * as vscode from "vscode";

const tokens: [string, number][] = [
  ["$size-spacing-0", 0],
  ["$size-spacing-1", 0.25],
  ["$size-spacing-2", 0.5],
  ["$size-spacing-3", 0.75],
  ["$size-spacing-4", 1],
  ["$size-spacing-5", 1.25],
  ["$size-spacing-6", 1.5],
  ["$size-spacing-7", 1.75],
  ["$size-spacing-8", 2],
  ["$size-spacing-9", 2.25],
  ["$size-spacing-10", 2.5],
  ["$size-spacing-11", 2.75],
  ["$size-spacing-12", 3],
  ["$size-spacing-14", 3.5],
  ["$size-spacing-16", 4],
  ["$size-spacing-20", 5],
  ["$size-spacing-24", 6],
  ["$size-spacing-28", 7],
  ["$size-spacing-32", 8],
  ["$size-spacing-36", 9],
  ["$size-spacing-40", 10],
  ["$size-spacing-44", 11],
  ["$size-spacing-48", 12],
  ["$size-spacing-52", 13],
  ["$size-spacing-56", 14],
  ["$size-spacing-60", 15],
  ["$size-spacing-64", 16],
  ["$size-spacing-72", 18],
  ["$size-spacing-80", 20],
  ["$size-spacing-96", 24],
  ["$size-spacing-px", 0.0625],
  ["$size-spacing-0-5", 0.125],
  ["$breakpoint-md", 37.5],
  ["$breakpoint-lg", 56.563],
  ["$breakpoint-xl", 77.5],
];

const colorTokens: [string, string][] = [
  ["$color-base-gray-100", "#f2f2f2"],
  ["$color-base-gray-200", "#e0e0e0"],
  ["$color-base-gray-300", "#a8a8a8"],
  ["$color-base-gray-400", "#8d8d8d"],
  ["$color-base-gray-500", "#6f6f6f"],
  ["$color-base-gray-600", "#525252"],
  ["$color-base-gray-700", "#363534"],
  ["$color-base-orange-300", "#f68c2c"],
  ["$color-base-orange-900", "#bc5801"],
  ["$color-base-white", "#ffffff"],
  ["$color-border-base", "#363534"],
  ["$color-border-focus", "#363534"],
  ["$color-border-inverse-base", "#ffffff"],
  ["$color-border-inverse-focus", "#ffffff"],
  ["$color-border-button-outline", "#363534"],
  ["$color-border-button-inverse-outline", "#ffffff"],
  ["$color-brand-background", "#ffffff"],
  ["$color-brand-primary-base", "#363534"],
  ["$color-brand-primary-hover", "#525252"],
  ["$color-brand-primary-active", "#6f6f6f"],
  ["$color-brand-primary-disabled", "#a8a8a8"],
  ["$color-brand-surface-base", "#f2f2f2"],
  ["$color-brand-surface-hover", "#e0e0e0"],
  ["$color-brand-surface-active", "#a8a8a8"],
  ["$color-brand-surface-disabled", "#a8a8a8"],
  ["$color-brand-on-primary", "#ffffff"],
  ["$color-brand-on-surface", "#363534"],
  ["$color-brand-on-background-base", "#363534"],
  ["$color-brand-on-background-variant", "#6f6f6f"],
  ["$color-brand-inverse-background", "#363534"],
  ["$color-brand-inverse-primary-base", "#ffffff"],
  ["$color-brand-inverse-primary-hover", "#f2f2f2"],
  ["$color-brand-inverse-primary-active", "#e0e0e0"],
  ["$color-brand-inverse-primary-disabled", "#a8a8a8"],
  ["$color-brand-inverse-surface-base", "#525252"],
  ["$color-brand-inverse-surface-hover", "#6f6f6f"],
  ["$color-brand-inverse-surface-active", "#8d8d8d"],
  ["$color-brand-inverse-surface-disabled", "#a8a8a8"],
  ["$color-brand-inverse-on-primary", "#363534"],
  ["$color-brand-inverse-on-surface", "#ffffff"],
  ["$color-brand-inverse-on-background-base", "#ffffff"],
  ["$color-brand-inverse-on-background-variant", "#a8a8a8"],
  ["$color-brand-support-informational", "#363534"],
  ["$color-brand-support-error", "#f4d8da"],
  ["$color-brand-support-warning", "#ffdd99"],
  ["$color-brand-support-success", "#000000"],
  ["$color-brand-support-on-informational", "#ffffff"],
  ["$color-brand-support-on-error", "#b10009"],
  ["$color-brand-support-on-warning", "#363534"],
  ["$color-brand-support-on-success", "#000000"],
  ["$color-font-button-primary", "#ffffff"],
  ["$color-font-button-outline", "#363534"],
  ["$color-font-button-ghost", "#363534"],
  ["$color-font-button-disabled", "#363534"],
  ["$color-font-button-inverse-primary", "#363534"],
  ["$color-font-button-inverse-outline", "#ffffff"],
  ["$color-font-button-inverse-ghost", "#ffffff"],
  ["$color-support-error-base", "#b10009"],
  ["$color-support-error-light", "#f4d8da"],
  ["$color-support-warning-base", "#ffdd99"],
  ["$color-support-warning-light", "#ffeecc"],
  ["$color-support-success-base", "#006600"],
  ["$color-support-success-light", "#d8ecb6"],
];

let isEnabled = true;
let statusBarItem: vscode.StatusBarItem;

function toggleTokens() {
  isEnabled = !isEnabled;
  statusBarItem.text = isEnabled ? "+Tokens" : "-Tokens";

  if (isEnabled) {
    if (vscode.window.activeTextEditor) {
      lintDocument(vscode.window.activeTextEditor.document);
    }
  } else {
    clearRecommendations();
  }
}

function clearRecommendations() {
  diagnosticCollection.clear();
  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    activeTextEditor.setDecorations(recommendationDecorationType, []);
  }
}

function findNearestToken(value: number): string {
  let minDiff = Number.MAX_VALUE;
  let nearestToken = "";

  for (const [token, tokenValue] of tokens) {
    if (typeof tokenValue === "number") {
      const diff = Math.abs(tokenValue - value);
      if (diff < minDiff) {
        minDiff = diff;
        nearestToken = token;
      }
    }
  }

  return nearestToken;
}

function findExactToken(hexColor: string): string | undefined {
  for (const [token, tokenColor] of colorTokens) {
    if (tokenColor.toLowerCase() === hexColor.toLowerCase()) {
      return token;
    }
  }
  return undefined;
}

function handleSpacingValue(
  match: RegExpExecArray,
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
  decorations: vscode.DecorationOptions[]
) {
  const pxValueString = match[2].trim();
  const pxValues = pxValueString.match(/(\d+)px/g) || [];

  pxValues.forEach((pxValue) => {
    const value = parseInt(pxValue, 10);
    const startPosition = document.positionAt(
      (match.index ?? 0) + match[0].indexOf(pxValue)
    );
    const endPosition = startPosition.translate(0, pxValue.length);
    const range = new vscode.Range(startPosition, endPosition);

    const recommendation = findNearestToken(value / 16);
    const message = `DESIGN SYSTEM: Consider using '${recommendation}' instead of '${pxValue}'.`;

    diagnostics.push(
      new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning)
    );
    const decoration: vscode.DecorationOptions = {
      range,
      renderOptions: {
        after: {
          contentText: ` ⟶ ${recommendation}`,
        },
      },
    };

    decorations.push(decoration);
  });
}

function handleColorValue(
  match: RegExpExecArray,
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
  decorations: vscode.DecorationOptions[]
) {
  const colorValue = match[2].trim();
  const startPosition = document.positionAt(match.index ?? 0);
  const endPosition = startPosition.translate(0, match[0].length);
  const range = new vscode.Range(startPosition, endPosition);

  const recommendation = findExactToken(colorValue);
  if (recommendation) {
    const message = `DESIGN SYSTEM: Consider using '${recommendation}' instead of '${colorValue}'.`;

    diagnostics.push(
      new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning)
    );
    const decoration: vscode.DecorationOptions = {
      range,
      renderOptions: {
        after: {
          contentText: ` ⟶ ${recommendation}`,
        },
      },
    };

    decorations.push(decoration);
  }
}

let diagnosticCollection: vscode.DiagnosticCollection;

const recommendationDecorationType =
  vscode.window.createTextEditorDecorationType({
    after: {
      color: "rgba(255, 140, 0, 1)",
    },
  });

function lintDocument(document: vscode.TextDocument) {
  if (!isEnabled) {
    return;
  }

  if (
    document.languageId !== "css" &&
    document.languageId !== "scss" &&
    document.languageId !== "svelte"
  ) {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const decorations: vscode.DecorationOptions[] = [];

  const text = document.getText();

  // Match spacing values in px
  const spacingRegex = /([\w-]+)\s*:\s*([\d\s]*(?:\d+px\b\s*)+)/g;
  // Match hex and rgba color values
  const colorRegex =
    /([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\))/g;

  let match: RegExpExecArray | null;

  // Handle spacing values
  while ((match = spacingRegex.exec(text)) !== null) {
    handleSpacingValue(match, document, diagnostics, decorations);
  }

  // Handle color values
  while ((match = colorRegex.exec(text)) !== null) {
    handleColorValue(match, document, diagnostics, decorations);
  }

  diagnosticCollection.set(document.uri, diagnostics);
  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor && activeTextEditor.document.uri === document.uri) {
    activeTextEditor.setDecorations(recommendationDecorationType, decorations);
  }
}

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(
    "tokenRecommendations"
  );

  context.subscriptions.push(diagnosticCollection);

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "+Tokens";
  statusBarItem.command = "tokenRecommendations.toggle";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register toggle command
  context.subscriptions.push(
    vscode.commands.registerCommand("tokenRecommendations.toggle", toggleTokens)
  );

  if (vscode.window.activeTextEditor) {
    lintDocument(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isEnabled) {
        lintDocument(editor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (isEnabled) {
        lintDocument(e.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (isEnabled) {
        lintDocument(document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticCollection.delete(document.uri);
    })
  );
}

export function deactivate() {
  diagnosticCollection.clear();
}
