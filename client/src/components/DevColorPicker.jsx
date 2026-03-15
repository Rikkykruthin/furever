"use client";
import { useState } from "react";
import { Copy, Check, Palette } from "lucide-react";

export default function DevColorPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [selectedType, setSelectedType] = useState("bg");

  const colors = {
    "Ink Black": "ink-black",
    "Prussian Blue": "prussian-blue",
    "Dusk Blue": "dusk-blue",
    "Dusty Denim": "dusty-denim",
    "Alabaster Grey": "alabaster-grey",
  };

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const types = [
    { value: "bg", label: "Background" },
    { value: "text", label: "Text" },
    { value: "border", label: "Border" },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-prussian-blue-600 hover:bg-prussian-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-50"
        title="Open Color Picker"
      >
        <Palette className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-2xl p-4 w-96 max-h-[80vh] overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Dev Color Picker
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Type Selector */}
      <div className="flex gap-2 mb-4">
        {types.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              selectedType === type.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Color Grid */}
      <div className="space-y-4">
        {Object.entries(colors).map(([name, prefix]) => (
          <div key={prefix}>
            <h4 className="text-sm font-semibold mb-2 text-card-foreground">
              {name}
            </h4>
            <div className="grid grid-cols-6 gap-1">
              {shades.map((shade) => {
                const className = `${selectedType}-${prefix}-${shade}`;
                const isCopied = copiedText === className;

                return (
                  <button
                    key={shade}
                    onClick={() => copyToClipboard(className)}
                    className="group relative"
                    title={className}
                  >
                    <div
                      className={`w-full aspect-square rounded border border-border bg-${prefix}-${shade} hover:scale-110 transition-transform ${
                        isCopied ? "ring-2 ring-green-500" : ""
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-500 drop-shadow-lg" />
                      ) : (
                        <Copy className="w-3 h-3 text-white drop-shadow-lg" />
                      )}
                    </div>
                    <div className="text-[10px] text-center mt-1 text-muted-foreground">
                      {shade}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Copied Feedback */}
      {copiedText && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span>
              Copied: <code className="font-mono">{copiedText}</code>
            </span>
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-4 p-3 bg-muted rounded text-xs space-y-1">
        <div className="font-semibold text-card-foreground mb-1">
          Quick Reference:
        </div>
        <div className="text-muted-foreground">
          Click any color to copy its class name
        </div>
        <div className="text-muted-foreground">
          Use in JSX: <code className="text-primary">className="{copiedText || 'bg-prussian-blue-600'}"</code>
        </div>
      </div>
    </div>
  );
}
