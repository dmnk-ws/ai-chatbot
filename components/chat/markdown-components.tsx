import { Components } from "react-markdown";

export const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-3">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 ml-4 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="mb-3">{children}</li>,
  h1: ({ children }) => <h1 className="text-2xl font-bold mb-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-bold mb-3">{children}</h3>,
  code: ({ className, children }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
        {children}
      </code>
    ) : (
      <code className={className}>{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-gray-300">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2">{children}</td>
  ),
  hr: ({ children }) => <hr className="my-8">{children}</hr>,
};
