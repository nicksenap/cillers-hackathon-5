import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import DocumentRendered from '../templates/DocumentRendered';
import { Template } from '../types';

export const renderDocumentAsStaticHtml = (documentProps: {
    kv: Record<string, string>;
    template: Template;
}): string => {
    const element = React.createElement(DocumentRendered, documentProps);
    const renderedHtml = ReactDOMServer.renderToStaticMarkup(element);
    return renderedHtml;
};
