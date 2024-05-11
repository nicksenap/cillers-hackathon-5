import React, { useEffect, useState } from 'react';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { GET_SIGNATURES, VERIFY_SIGNATURE } from '../graphql/operations';
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

const Management: React.FC = () => {
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const { data, loading, error } = useQuery(GET_SIGNATURES);
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
        <div className='container mx-auto'>
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4 mt-4">Management</h1>
            
            <div className="container">
                <h1 className="text-2xl font-bold mb-4">Signatures</h1>
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
        </div>
    );
};
export default Management;
