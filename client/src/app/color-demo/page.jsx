"use client";
import { useTheme } from "@/contexts/ThemeContext";

export default function ColorDemoPage() {
  const { theme } = useTheme();

  const colorFamilies = [
    {
      name: "Ink Black",
      prefix: "ink-black",
      description: "Primary blue tones for main UI elements",
    },
    {
      name: "Prussian Blue",
      prefix: "prussian-blue",
      description: "Deep blue tones for headers and important elements",
    },
    {
      name: "Dusk Blue",
      prefix: "dusk-blue",
      description: "Muted blue tones for secondary elements",
    },
    {
      name: "Dusty Denim",
      prefix: "dusty-denim",
      description: "Neutral blue-grey tones for text and borders",
    },
    {
      name: "Alabaster Grey",
      prefix: "alabaster-grey",
      description: "Warm grey tones for backgrounds",
    },
  ];

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Color Palette Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Current theme: <span className="font-semibold">{theme}</span>
          </p>
          <p className="text-muted-foreground mt-2">
            Toggle the theme using the button in the navbar to see how colors adapt.
          </p>
        </div>

        {/* Semantic Colors */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Semantic Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-primary text-primary-foreground p-6 rounded-lg">
              <div className="font-semibold">Primary</div>
              <div className="text-sm opacity-90">Main actions</div>
            </div>
            <div className="bg-secondary text-secondary-foreground p-6 rounded-lg">
              <div className="font-semibold">Secondary</div>
              <div className="text-sm opacity-90">Secondary elements</div>
            </div>
            <div className="bg-accent text-accent-foreground p-6 rounded-lg">
              <div className="font-semibold">Accent</div>
              <div className="text-sm opacity-90">Highlighted items</div>
            </div>
            <div className="bg-muted text-muted-foreground p-6 rounded-lg">
              <div className="font-semibold">Muted</div>
              <div className="text-sm">Subtle backgrounds</div>
            </div>
          </div>
        </section>

        {/* Color Families */}
        {colorFamilies.map((family) => (
          <section key={family.prefix} className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">{family.name}</h2>
            <p className="text-muted-foreground mb-4">{family.description}</p>
            <div className="grid grid-cols-11 gap-2">
              {shades.map((shade) => (
                <div key={shade} className="flex flex-col">
                  <div
                    className={`bg-${family.prefix}-${shade} h-20 rounded-lg border border-border`}
                    title={`${family.prefix}-${shade}`}
                  />
                  <div className="text-xs text-center mt-2 text-muted-foreground">
                    {shade}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Example Components */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Example Components</h2>
          
          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="bg-prussian-blue-600 hover:bg-prussian-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Primary Button
                </button>
                <button className="bg-dusk-blue-100 hover:bg-dusk-blue-200 text-ink-black-900 dark:bg-prussian-blue-900 dark:hover:bg-prussian-blue-800 dark:text-alabaster-grey-100 px-6 py-2 rounded-lg transition-colors">
                  Secondary Button
                </button>
                <button className="border-2 border-prussian-blue-600 text-prussian-blue-600 hover:bg-prussian-blue-50 dark:hover:bg-prussian-blue-950 px-6 py-2 rounded-lg transition-colors">
                  Outline Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
                  <h4 className="text-lg font-semibold mb-2 text-card-foreground">
                    Card Title
                  </h4>
                  <p className="text-muted-foreground">
                    This is a card with semantic colors that adapt to the theme.
                  </p>
                </div>
                <div className="bg-alabaster-grey-50 dark:bg-ink-black-900 border border-alabaster-grey-300 dark:border-dusty-denim-800 rounded-lg p-6 shadow-lg">
                  <h4 className="text-lg font-semibold mb-2 text-ink-black-900 dark:text-alabaster-grey-50">
                    Custom Card
                  </h4>
                  <p className="text-dusty-denim-600 dark:text-dusty-denim-300">
                    This card uses specific color utilities.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-prussian-blue-500 to-ink-black-600 text-white rounded-lg p-6 shadow-lg">
                  <h4 className="text-lg font-semibold mb-2">
                    Gradient Card
                  </h4>
                  <p className="opacity-90">
                    Cards can use gradients from the palette.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Elements */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Form Elements</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Input
                  </label>
                  <input
                    type="text"
                    placeholder="Enter text..."
                    className="w-full bg-background border border-input text-foreground px-4 py-2 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select
                  </label>
                  <select className="w-full bg-background border border-input text-foreground px-4 py-2 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Textarea
                  </label>
                  <textarea
                    placeholder="Enter description..."
                    rows={4}
                    className="w-full bg-background border border-input text-foreground px-4 py-2 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Text Styles */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Typography</h3>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">
                  Heading 1
                </h1>
                <h2 className="text-3xl font-semibold text-foreground">
                  Heading 2
                </h2>
                <h3 className="text-2xl font-semibold text-foreground">
                  Heading 3
                </h3>
                <p className="text-base text-foreground">
                  Regular paragraph text with normal weight.
                </p>
                <p className="text-sm text-muted-foreground">
                  Muted text for less important information.
                </p>
                <a href="#" className="text-primary hover:underline">
                  Link text with primary color
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
