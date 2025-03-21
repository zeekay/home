
import React from 'react';

interface SafariContentProps {
  url: string;
  depth: number;
  iframeKey: number;
}

const SafariContent: React.FC<SafariContentProps> = ({ url, depth, iframeKey }) => {
  return (
    <div className="flex-1">
      {url && (
        <iframe 
          src={url} 
          title={`Safari Content (Depth: ${depth})`}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          key={`iframe-${depth}-${iframeKey}`}
          data-safari-depth={depth}
        />
      )}
    </div>
  );
};

export default SafariContent;
