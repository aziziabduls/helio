import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const V1_1_0_Content = () => {
  return (
    <div>
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Design Tokens 2.0 Global Theme Rebuild</h3>
          <p className="text-white/60 text-sm">
            We&apos;ve completely redesigned the theme system for Design Tokens 2.0. Tokens are now hierarchical,
            semantic, and fully type-safe — built for scaling design systems.
          </p>
        </div>
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/timeline/image-03.png"
          alt="Component Sync Demo"
          className="rounded-[10px] border border-white/10"
        />
        <p className="text-white/60 text-sm">
          Design Tokens 2.0 introduces a complete overhaul of how themes are managed within shadcnstudio. With this
          update, design tokens are now hierarchical and semantic, offering greater flexibility and scalability for your
          design system.
        </p>
        <p className="text-white/60 text-sm">
          The new system supports automatic dark/light theme pairing, making it easier than ever to maintain consistent
          visuals across all environments. Tokens for colors, spacing, typography, and more are now fully type-safe and
          easily customizable, ensuring that your design system can grow alongside your projects.{' '}
        </p>
        <Accordion type="multiple" className="-mt-4 mb-0 w-full border-none" defaultValue={['item-1']}>
          <AccordionItem value="item-1" className="bg-transparent border-none">
            <AccordionTrigger className="px-0 hover:no-underline">
              <Badge className="h-6 rounded-sm border-none bg-green-600/10 px-2 text-green-400">
                New
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              <ul className="text-white/60 list-inside list-disc space-y-3 text-sm">
                <li>Complete token overhaul unified color, spacing & typography system.</li>
                <li>Preset Themes instantly apply predefined light/dark palettes.</li>
                <li>Global token inspector view & edit all tokens in one place.</li>
                <li>Preview share links generate temporary links to share progress with your team</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="bg-transparent border-none">
            <AccordionTrigger className="px-0 hover:no-underline">
              <Badge className="h-6 rounded-sm border-none bg-sky-600/10 px-2 text-sky-400">
                Updates
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              <ul className="text-white/60 list-inside list-disc space-y-3 text-sm">
                <li>Smarter token fallback logic for consistent theming across components</li>
                <li>Improved OKLCH color handling for better contrast & accessibility</li>
                <li>Faster token rendering in the design preview (25% boost)</li>
                <li>Better error handling during build failures with clearer actions</li>
                <li>Updated environment variable manager for easier key/value edits</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="bg-transparent border-none">
            <AccordionTrigger className="px-0 hover:no-underline">
              <Badge className="h-6 rounded-sm border-none bg-amber-600/10 px-2 text-amber-400">
                Bug Fixes
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              <ul className="text-white/60 list-inside list-disc space-y-3 text-sm">
                <li>Fixed broken references causing inconsistent button colors</li>
                <li>Corrected spacing token mismatch in forms and modals</li>
                <li>Resolved theme switching lag in large projects</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default V1_1_0_Content;
