import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import DocumentRendered from '../templates/DocumentRendered';

export const renderDocumentAsStaticHtml = (documentProps: {
  name: string;
  first_name: string;
  last_name: string;
  email: string;
}): string => {
  const element = React.createElement(DocumentRendered, documentProps);
  const renderedHtml = ReactDOMServer.renderToStaticMarkup(element);
  console.log(renderedHtml);
  return renderedHtml;
};
