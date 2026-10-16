import ChangelogContent from '@/components/shadcn-studio/blocks/timeline-component-05/timeline-component-05';
import type { Release } from '@/components/shadcn-studio/blocks/timeline-component-05/timeline-component-05';
import V1_3_0_Content from '@/components/shadcn-studio/blocks/timeline-component-05/content/v1-3-0';
import V1_2_0_Content from '@/components/shadcn-studio/blocks/timeline-component-05/content/v1-2-0';
import V1_1_0_Content from '@/components/shadcn-studio/blocks/timeline-component-05/content/v1-1-0';

const releases: Release[] = [
  {
    version: 'v 1.3.0',
    date: 'November 7, 2025',
    content: <V1_3_0_Content />,
  },
  {
    version: 'v 1.2.0',
    date: 'March 22, 2025',
    content: <V1_2_0_Content />,
  },
  {
    version: 'v 1.1.0',
    date: 'January 15, 2025',
    content: <V1_1_0_Content />,
  },
];

const ChangelogComponentPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0e14] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
        <div className="flex flex-col items-start w-full">
          <ChangelogContent releases={releases} />
        </div>
      </div>
    </div>
  );
};

export default ChangelogComponentPage;
