import React, { useState } from 'react'; 
import { ApolloProvider } from '@apollo/client';
import createAuthenticatedClient from '../apolloClient';
import Documents from './Documents';
import Management from './Management';

interface AuthenticatedProps {
  userInfo: Record<string, any>; 
  logout: () => void; 
  csrf: string;
}

const Authenticated: React.FC<AuthenticatedProps> = ({ userInfo, logout, csrf }) => {
    const [showManagement, setShowManagement] = useState(false);

    return (
        <ApolloProvider client={createAuthenticatedClient(csrf)}>
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <span>
                    Authenticated as: {userInfo.given_name} {userInfo.family_name}
                </span>
                <div>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={logout}>
                        Logout
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded" onClick={() => setShowManagement(!showManagement)}>
                        {showManagement ? 'Show Documents' : 'Show Management'}
                    </button>
                </div>
            </div>
            {showManagement ? <Management /> : <Documents />}
        </ApolloProvider>
    )
} 

export default Authenticated;

