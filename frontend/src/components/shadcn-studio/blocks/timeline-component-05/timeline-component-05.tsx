import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';

export interface Release {
  version: string;
  date: string;
  content: ReactNode;
}

interface ChangelogContentProps {
  releases: Release[];
}

const ChangelogContent = ({ releases }: ChangelogContentProps) => {
  return (
    <>
      <div className="mb-8 space-y-4 text-center md:mb-10 lg:mb-14">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl text-white">
          Changelog Origin Update
        </h2>
        <p className="text-white/60 text-lg md:text-xl">
          Discover what’s been added, changed, fixed, improved, and updated in this release.
        </p>
      </div>
      {releases.map((release, index) => (
        <div
          key={release.version}
          id={String(index + 1)}
          className="relative flex scroll-mt-20 justify-end gap-2 w-full"
        >
          <div className="sticky top-24 flex w-36 flex-col items-end gap-2 self-start pb-4 max-md:hidden">
            <Badge className="flex size-6 w-auto justify-end rounded-sm text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {release.version}
            </Badge>
            <div className="text-white/50 text-right text-sm font-medium">{release.date}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="sticky top-24 mb-11 flex size-6 items-center justify-center max-sm:top-5">
              <span className="bg-blue-500/20 flex size-4.5 shrink-0 items-center justify-center rounded-full ring-4 ring-[#0b0e14]">
                <span className="bg-blue-500 size-2.5 rounded-full" />
              </span>
            </div>
            <span className="-mt-12 w-px flex-1 border-r border-white/10" />
          </div>
          <div className="flex flex-1 flex-col gap-4 pb-11 pl-3 md:pl-6 lg:pl-9">
            <div className="flex flex-col gap-2 md:hidden">
              <Badge className="flex rounded-sm font-medium w-fit bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {release.version}
              </Badge>
              <div className="text-xs text-white/50 font-medium">{release.date}</div>
            </div>
            {release.content}
          </div>
        </div>
      ))}
    </>
  );
};

export default ChangelogContent;
export type { ChangelogContentProps };
