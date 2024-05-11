import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_DOCUMENT, SIGN_DOCUMENT } from '../graphql/operations';
import { renderDocumentAsStaticHtml } from '../utils/staticRenderHandler';
import DocumentRendered from '../templates/DocumentRendered';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Documents: React.FC = () => {
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [content, setContent] = useState('');
  const [addDocument] = useMutation(ADD_DOCUMENT);
  const [signDocument] = useMutation(SIGN_DOCUMENT);
  const [showPreview, setShowPreview] = useState(false);

  // const handleAddProduct = async () => {
  //   if (!newProductText.trim()) return;
  //   if (pushToKafka) {
  //     const response = await fetch('/input/add_product', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ name: newProductText }),
  //     });
  //     if (response.ok) {
  //       setNewProductText('');
  //     } else {
  //       const errorText = await response.text();
  //       console.error('Failed to add product:', errorText);
  //     }
  //   } else {
  //     await addProduct({ variables: { name: newProductText } });
  //     setNewProductText('');
  //   }
  // };

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
    const staticHtml = renderDocumentAsStaticHtml({ name, first_name: firstName, last_name: lastName, email });
    await handleAddDocument(staticHtml);
  }

  const handleSignDocument = async () => {
    console.log(content);
    await signDocument({ variables: { 
      document_id: id,
      signed_by_email: email,
      signed_content: content
    } });
    toast.success('Successfully signed!');
  }

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
                    name={name}
                    first_name={firstName}
                    last_name={lastName}
                    email={email}
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
