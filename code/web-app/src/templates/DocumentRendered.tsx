import { Template } from "../types";

interface DocumentRenderedProps {
    kv: Record<string, string>;
    template: Template;
}


const DocumentRendered: React.FC<DocumentRenderedProps> = ({ kv, template }) => {
    const renderTemplate = (): string => {
      const replacements: { [key: string]: string } = kv;
      console.log('Replacement object:', replacements);
      console.log('Template:', template.template);
      return template.template.replace(/\{(.*?)\}/g, (_, key) => {
        const trimmedKey = key.trim();
        console.log('Current key being replaced:', trimmedKey);
  
        // Handle the case where the key is not found in the replacements object
        if (trimmedKey in replacements) {
          return replacements[trimmedKey];
        } else {
          console.error(`Key '${trimmedKey}' not found in replacements`);
          return `{{${trimmedKey}}}`; // Optionally return the original placeholder or a default value
        }
      });
    };
  
    return (
      <div dangerouslySetInnerHTML={{ __html: renderTemplate() }} />
    );
  };

export default DocumentRendered;
