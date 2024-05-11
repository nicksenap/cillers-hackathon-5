import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_DOCUMENT, SIGN_DOCUMENT, GET_TEMPLATES } from '../graphql/operations';
import { renderDocumentAsStaticHtml } from '../utils/staticRenderHandler';
import DocumentRendered from '../templates/DocumentRendered';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Template } from '../types';


const Documents: React.FC = () => {
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [content, setContent] = useState('');
  const [addDocument] = useMutation(ADD_DOCUMENT);
  const [signDocument] = useMutation(SIGN_DOCUMENT);
  const [template, setTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { data, loading, error } = useQuery(GET_TEMPLATES);

  useEffect(() => {
    console.log('Fetching templates...');
    
    if (loading) {
      console.log('Loading templates...');
    } else if (error) {
      console.error('Error fetching templates:', error);
    } else if (data) {
      console.log(data);
      setTemplate(data.templates[0]);
    }
  }, [data, loading, error]);

  const handleAddDocument = async (staticHtml: string) => {
    if (!name || !firstName || !lastName || !email ) {
      // Handle validation or error message here
      return;
    }
    const response = await addDocument({ variables: { 
      name: name,
      first_name: firstName,
      last_name: lastName,
      email: email,
      content: staticHtml
    } });
    console.log(response);
    setId(response.data.addDocument.id);
    setContent(staticHtml);
    setShowPreview(true);
  }

  const renderDocument = async () => {
    const kv = { name, first_name: firstName, last_name: lastName, email };
    const staticHtml = renderDocumentAsStaticHtml({ kv, template: template!});
    await handleAddDocument(staticHtml);
  }

  const handleSignDocument = async () => {
    console.log(content);
    const response = await signDocument({ variables: { 
      document_id: id,
      signed_by_email: email,
      signed_content: content
    } });
    if(response.data){toast.success('Successfully signed!');}
    else {toast.error('Failed to sign!');}
  }
  const fields = template?.fields || [];
  console.log(fields);
  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />
      
      <div className="navbar bg-base-300 text-neutral-content">
        <div className="flex-1">
          <a href="/" className="p-2 normal-case text-xl">Form</a>
        </div>
      </div>
      <div className="flex flex-grow justify-center items-center bg-neutral">
        <div className="card card-compact w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body items-stretch text-center">
            <h1 className="card-title self-center text-2xl font-bold mb-4">Start a new form</h1>
            <div className="form-control w-full">
            <div className="form-control">
                <input
                  type="text"
                  placeholder="Form Name"
                  className="input input-bordered input-md input-primary w-full mb-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <input
                  type="text"
                  placeholder="First Name"
                  className="input input-bordered input-md input-primary w-full mb-2"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input input-bordered input-md input-primary w-full mb-2"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Email"
                  className="input input-bordered input-md input-primary w-full mb-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              <button className="btn btn-primary w-full mb-5" onClick={renderDocument}>
                  Generate
              </button>
            </div>
            {showPreview && (
              <div className="form-control w-full mb-5 p5">
                <h1 className="card-title self-center text-2xl font-bold mb-4">Form Preview</h1>
                <div className="document-content mb-5">
                  <DocumentRendered
                    kv={{ name, first_name: firstName, last_name: lastName, email }}
                    template={template!}
                  />
                </div>
                <button className="btn btn-primary w-full" onClick={handleSignDocument}>
                  Sign
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default Documents;
