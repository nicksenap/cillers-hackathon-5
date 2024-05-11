import { gql } from '@apollo/client';

export const GET_HELLO = gql`
  query GetHello {
    hello { message }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    products { name, id }
  }
`;

export const ADD_PRODUCT = gql`
  mutation AddProduct($name: String!) {
    addProduct(name: $name) { name, id }
  }
`;

export const REMOVE_PRODUCT = gql`
  mutation RemoveProduct($id: String!) {
    removeProduct(id: $id)
  }
`;

export const GET_DOCUMENT = gql`
  query GetDocument($id: String!) {
    document(id: $id) { name, id, content, firstName, lastName, email }
  }
`;

export const GET_DOCUMENTS = gql`
  query GetDocuments {
    documents { name, id, content, firstName, lastName, email }
  }
`;

export const ADD_DOCUMENT = gql`
  mutation AddDocument($name: String!, $content: String!,$first_name: String!, $last_name: String!, $email: String!) {
    addDocument(name: $name, content: $content, firstName: $first_name, lastName: $last_name, email: $email) { id, name, content, firstName, lastName, email }
  }
`;

export const REMOVE_DOCUMENT = gql`
  mutation RemoveDocument($id: String!) {
    removeDocument(id: $id)
  }
`;

export const SIGN_DOCUMENT = gql`
  mutation SignDocument($document_id: String!, $signed_by_email: String!, $signed_content: String!) {
    signDocument(documentId: $document_id, signedByEmail: $signed_by_email, signedContent: $signed_content) {
      id
      document {
        id
        name
        content
        firstName
        lastName
        email
        checksum
      }
      signedByEmail
      signedContent
      signedChecksum
      signedTs
    }
  }
`;

export const GET_SIGNATURES = gql`
  query GetSignatures {
    signatures {
      id
      document {
        id
        name
        content
        firstName
        lastName
        email
        checksum
      }
      signedByEmail
      signedContent
      signedChecksum
      signedTs
    }
  }
`;

export const VERIFY_SIGNATURE = gql`
  query VerifySignature($id: String!) {
    verifySignature(id: $id) {
      id
      document {
        id
        name
        content
        firstName
        lastName
        email
        checksum
      }
      signedByEmail
      signedContent
      signedChecksum
      signedTs
    }
  }
`;

export const PRODUCT_ADDED_SUBSCRIPTION = gql`
  subscription OnProductAdded {
    productAdded { name, id }
  }
`;

export const ADD_TEMPLATE = gql`
  mutation AddTemplate($name: String!, $template: String!, $fieldIds: [String!]!) {
    addTemplate(name: $name, template: $template, fieldIds: $field_ids) {
      id
      name
      template
      fieldIds
    }
  }
`;

export const REMOVE_TEMPLATE = gql`
  mutation RemoveTemplate($id: String!) {
    removeTemplate(id: $id)
  }
`;

export const GET_TEMPLATES = gql`
  query GetTemplates {
    templates { id, name, template, fieldIds }
  }
`;

export const GET_TEMPLATE = gql`
  query GetTemplate($id: String!) {
    template(id: $id) { id, name, template, fieldIds }
  }
`;

