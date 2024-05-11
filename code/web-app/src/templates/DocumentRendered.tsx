interface DocumentRenderedProps {
    name: string;
    first_name: string;
    last_name: string;
    email: string;
}

const DocumentRendered: React.FC<DocumentRenderedProps> = ({ name, first_name, last_name, email }) => {
  return (
    <div>
      <h1>Super Awesome Document - {name}</h1>
      <p>First Name: {first_name}</p>
      <p>Last Name: {last_name}</p>
      <p>Email: {email}</p>
    </div>
  );
};

export default DocumentRendered;

