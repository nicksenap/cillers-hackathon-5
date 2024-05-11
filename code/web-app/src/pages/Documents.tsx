import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_DOCUMENT } from '../graphql/operations';

interface Document {
  id: string;
  name: string;
  content: string;
  first_name: string;
  last_name: string;
  email: string;
}

// interface GetDocumentsQuery {
//   documents: Document[];
// }

const Documents: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  // const { data, loading, error, subscribeToMore } = useQuery(GET_PRODUCTS);
  const [addDocument] = useMutation(ADD_DOCUMENT);

  // useEffect(() => {
  //   subscribeToMore({
  //     document: PRODUCT_ADDED_SUBSCRIPTION,
  //     updateQuery: (prev, { subscriptionData }) => {
  //       if (!subscriptionData.data) return prev;
  //       const newProduct = subscriptionData.data.productAdded;

  //       if (prev.products.some((product: Product) => product.id === newProduct.id)) {
  //         return prev;
  //       }
  //       return Object.assign({}, prev, {
  //         products: [...prev.products, newProduct]
  //       });
  //     },
  //   });
  // }, [subscribeToMore]);

  // if (loading) return (
  //   <div className="flex justify-center items-center min-h-screen bg-base-300">
  //     <button className="btn">
  //       <span className="loading loading-spinner"></span>
  //       Loading...
  //     </button>
  //   </div>
  // );
  // if (error) return <p>{'Error: ' + error}</p>;

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

  const handleAddDocument = async () => {
    if (!firstName || !lastName || !email) {
      // Handle validation or error message here
      return;
    }
    await addDocument({ variables: { 
      name: 'Test Document',
      content: 'This is a test document',
      first_name: firstName,
      last_name: lastName,
      email: email,
    } });
    setFirstName('');
    setLastName('');
    setEmail('');
  }

  return (
    <div className="min-h-screen flex flex-col">
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
              </div>
              <div className="form-control">
                <button className="btn btn-primary w-full" onClick={handleAddDocument}>
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
