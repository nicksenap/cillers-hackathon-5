import React, { useEffect, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_SIGNATURES, VERIFY_SIGNATURE, GET_TEMPLATES } from '../graphql/operations';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Signature {
    id: string;
    document: {
        id: string;
        name: string;
        content: string;
        firstName: string;
        lastName: string;
        email: string;
        checksum: string;
    };
    signedByEmail: string;
    signedContent: string;
    signedChecksum: string;
    signedTs: string;
}

interface Template {
    id: string;
    name: string;
    template: string;
    fieldIds: string[];
}

interface Templates {
    templates: Template[];
}

const Management: React.FC = () => {
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const { data, loading, error } = useQuery(GET_SIGNATURES);
    const { data: templateData, loading: templateLoading, error: templateError } = useQuery(GET_TEMPLATES); // Add a new query for fetching templates
    const [verifySignature, { data: verifySignatureData, loading: verifySignatureLoading, error: verifySignatureError }] = useLazyQuery(VERIFY_SIGNATURE);
    useEffect(() => {
        if (loading) {
            console.log('Loading signatures...');
        } else if (error) {
            console.error('Error fetching signatures:', error);
        } else if (data) {
            setSignatures(data.signatures);
        }
    }, [data, loading, error]);

    useEffect(() => {
        if (templateLoading) {
            console.log('Loading templates...');
        } else if (templateError) {
            console.error('Error fetching templates:', templateError);
        } else if (templateData) {
            console.log("Template data:", templateData);
            setTemplates(templateData.templates);
        }
    }, [templateData, templateLoading, templateError]);

    const handleIntegrityCheck = async (signature: Signature) => {
        // Placeholder for integrity check logic
        console.log(`Checking integrity for signature ID: ${signature.id}`);
        const res = await verifySignature({ variables: { id: signature.id } });
        if(res.data && res.data.verifySignature.signedChecksum === signature.document.checksum) {
            toast.success('Successfully verified');
        }
        else {
            toast.error('Integrity check failed');
        }
    };


    return (
        <div className="min-h-screen flex flex-col">
            <ToastContainer />
            <div className="navbar bg-base-300 text-neutral-content">
                <div className="flex-1">
                <a href="/" className="p-2 normal-case text-xl text-black">Management</a>
                </div>
            </div>

        <div className='container mx-auto'>

            
            <div className="container mt-4">
                <h2 className="text-2xl font-bold mb-4">Signatures</h2>
                {loading ? (
                    <p>Loading signatures...</p>
                ) : error ? (
                    <p>Error fetching signatures: {error.message}</p>
                ) : (
                    <table className="table-auto">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Document Name</th>
                                <th className="px-4 py-2">Signed By</th>
                                <th className="px-4 py-2">Timestamp</th>
                                <th className="px-4 py-2">Checksum</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {signatures.map((signature, index) => (
                                <tr key={signature.id} className={index % 2 === 0 ? "" : "bg-gray-100"}>
                                    <td className="border px-4 py-2">{signature.document.name}</td>
                                    <td className="border px-4 py-2">{signature.signedByEmail}</td>
                                    <td className="border px-4 py-2">{signature.signedTs}</td>
                                    <td className="border px-4 py-2">{signature.signedChecksum}</td>
                                    <td className="border px-4 py-2">
                                        <button onClick={() => handleIntegrityCheck(signature)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Check Integrity
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="container mt-4">
                <h2 className="text-2xl font-bold mb-4">Contract Template Management</h2>
                {templateLoading ? (
                    <p>Loading templates...</p>
                ) : templateError ? (
                    <p>Error fetching templates: {templateError.message}</p>
                ) : (
                    <div>
                        {templates.map((template) => (
                            <div key={template.id} className="mb-4">
                                <h3 className="text-xl font-semibold">{template.name}</h3>
                                <textarea className="textarea textarea-bordered w-full mt-4" defaultValue={template.template}></textarea>
                                <button className="btn mt-2" onClick={() => {}}>Save</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="container mt-4">
                <h2 className="text-2xl font-bold mb-4">Field Management</h2>
                {loading ? (
                    <p>Loading fields...</p>
                ) : error ? (
                    <p>Error fetching fields: {error.message}</p>
                ) : (
                    <div>tbh</div>
                )}
            </div>

        </div>
    </div>);
};
export default Management;
