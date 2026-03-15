"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function ColorPaletteReference() {
  const [copiedColor, setCopiedColor] = useState(null);

  const colorFamilies = {
    "Ink Black": {
      prefix: "ink-black",
      shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
      usage: "Primary actions, links, interactive elements",
    },
    "Prussian Blue": {
      prefix: "prussian-blue",
      shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
      usage: "Headers, navigation, primary buttons",
    },
    "Dusk Blue": {
      prefix: "dusk-blue",
      shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
      usage: "Secondary elements, cards, backgrounds",
    },
    "Dusty Denim": {
      prefix: "dusty-denim",
      shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
      usage: "Body text, borders, subtle backgrounds",
    },
    "Alabaster Grey": {
      prefix: "alabaster-grey",
      shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
      usage: "Page backgrounds, neutral elements",
    },
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-card-foreground">
        Color Palette Quick Reference
      </h2>
      
      <div className="space-y-6">
        {Object.entries(colorFamilies).map(([name, { prefix, shades, usage }]) => (
          <div key={prefix} className="border-b border-border pb-4 last:border-b-0">
            <h3 className="text-lg font-semibold mb-1 text-card-foreground">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{usage}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {shades.map((shade) => {
                const className = `bg-${prefix}-${shade}`;
                const cssVar = `var(--color-${prefix}-${shade})`;
                
                return (
                  <button
                    key={shade}
                    onClick={() => copyToClipboard(className)}
                    className="group relative flex items-center gap-2 p-2 rounded border border-border hover:border-primary transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded ${className} border border-border`}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-xs font-mono text-card-foreground">
                        {shade}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedColor === className ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2 text-card-foreground">Usage Examples:</h4>
        <div className="space-y-1 text-sm font-mono text-muted-foreground">
          <div>Background: <code className="text-primary">bg-prussian-blue-600</code></div>
          <div>Text: <code className="text-primary">text-ink-black-900</code></div>
          <div>Border: <code className="text-primary">border-dusty-denim-300</code></div>
          <div>CSS Variable: <code className="text-primary">var(--color-alabaster-grey-50)</code></div>
        </div>
      </div>
    </div>
  );
}
