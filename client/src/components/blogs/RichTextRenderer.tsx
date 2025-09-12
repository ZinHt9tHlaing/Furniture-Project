import DomPurify from "dompurify";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
}

const RichTextRenderer = ({ content, className }: Props) => {
  // Sanitize HTML
  const sanitizedContent = DomPurify.sanitize(content);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      className={className}
    />
  );
};

export default RichTextRenderer;
