import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const V1_3_0_Content = () => {
  return (
    <div>
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">Component Sync Unified Library Management (Beta)</h3>
          <p className="text-white/60 text-sm">
            We&apos;re launching Component Sync, a new way to manage, version, and update all your shadcn components
            across projects with a single click.
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-medium text-white/80">Now you can :</p>
          <ul className="text-white/60 ml-2 list-inside list-disc space-y-3 text-sm">
            <li>Sync shared components instantly between multiple apps</li>
            <li>Track version diffs and apply updates selectively</li>
            <li>Automatically resolve dependency conflicts</li>
          </ul>
        </div>
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/timeline/image-04.png"
          alt="Component Sync Demo"
          className="rounded-[10px] border border-white/10"
        />
        <Accordion type="multiple" className="-mt-4 mb-0 w-full border-none" defaultValue={['item-1']}>
          <AccordionItem value="item-1" className="bg-transparent border-none">
            <AccordionTrigger className="px-0 hover:no-underline">
              <Badge className="h-6 rounded-sm border-none bg-green-600/10 px-2 text-green-400">
                New
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              <ul className="text-white/60 list-inside list-disc space-y-3 text-sm">
                <li>“Sync All” button for project-wide updates.</li>
                <li>Component diff viewer with inline changelog.</li>
                <li>Scoped sync choose which namespaces or folders to update</li>
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
                <li>Faster load times in component explorer (-30%)</li>
                <li>Auto-preview for dark/light theme variants</li>
                <li>TypeScript types now update automatically when syncing</li>
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
                <li>Fixed sync conflicts with large component libraries</li>
                <li>Resolved memory leak in diff viewer</li>
                <li>Fixed incorrect version detection for nested components</li>
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-sm px-3 py-1 text-xs font-mono">
                  /v1/components/sync
                </div>
                <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-sm px-3 py-1 text-xs font-mono">
                  /v1/components/pull
                </div>
                <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-sm px-3 py-1 text-xs font-mono">
                  --interactive
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default V1_3_0_Content;
