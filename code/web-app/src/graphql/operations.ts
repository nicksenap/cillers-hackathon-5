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
    addDocument(name: $name, content: $content, firstName: $first_name, lastName: $last_name, email: $email) { name, content, firstName, lastName, email }
  }
`;

export const REMOVE_DOCUMENT = gql`
  mutation RemoveDocument($id: String!) {
    removeDocument(id: $id)
  }
`;

export const PRODUCT_ADDED_SUBSCRIPTION = gql`
  subscription OnProductAdded {
    productAdded { name, id }
  }
`;
