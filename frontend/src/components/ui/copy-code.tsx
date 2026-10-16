'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

type CopyCodeProps = {
  code: string;
  language?: string;
};

function CopyCode({ code = 'javascript' }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        // Fallback method for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');

        textArea.value = code;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      console.error('Failed to copy', err);
      alert('Failed to copy code to clipboard');
    }
  };

  // Simple syntax highlighting for JavaScript/TypeScript
  const highlightCode = (code: string) => {
    let result = code;

    // 1. Strings (blue) - process first to protect content
    result = result.replace(/"([^"]*)"/g, '<span class="text-blue-600 dark:text-blue-400">"$1"</span>');
    result = result.replace(/\b(agent)\b/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>');

    // 2. Keywords (red/green)
    result = result.replace(/\b(const|let|var|new|false)\b/g, '<span class="text-red-600 dark:text-red-400">$1</span>');
    result = result.replace(/\b(AIAgent|true)\b/g, '<span class="text-green-600 dark:text-green-400">$1</span>');

    // 3. Comments (gray) - process last
    result = result.replace(/\/\/ ([^\n]*)/g, '<span class="text-gray-500 dark:text-gray-400">// $1</span>');

    return result;
  };

  return (
    <div className="bg-white/[0.05] border border-white/[0.08] relative rounded-[14px] p-2.5 font-mono">
      <div className="rounded-[10px] bg-black/40 px-3.5 py-2.5 text-xs text-white">
        <pre className="overflow-x-auto">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
        </pre>
        <button
          onClick={handleCopy}
          className="bg-white/10 hover:bg-white/20 absolute right-3 bottom-3 rounded-md p-1.5 transition-colors text-white"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <CheckIcon className="size-3 text-emerald-400" />
          ) : (
            <CopyIcon className="size-3 text-white/60" />
          )}
        </button>
      </div>
    </div>
  );
}

export { CopyCode };
