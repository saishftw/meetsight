import React from 'react';
import { marked } from 'marked'; // Import a markdown library
// import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
// import { serialize } from 'next-mdx-remote/serialize'
// import { GetStaticProps } from 'next'

function MarkdownRenderer({ content, className }: { content: string, className?: string }) {
    const htmlContent = marked.parse(content ?? "");
    return <div className={`chat-message flex-grow flex-wrap ${className}`} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}

// interface MDXRendererProps {
//     markdown: string; // The markdown string to render
// }


// const MarkdownRenderer: React.FC<MDXRendererProps> = async ({ markdown }) => {
//     // Optionally handle loading state or errors
//     if (!markdown) return <div>Loading...</div>;

//     const content = await serialize(markdown); // Serialize the string

//     return <MDXRemote {...content} />; // Render the MDX content
// };

export default MarkdownRenderer;