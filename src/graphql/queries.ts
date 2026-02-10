import { gql } from "@apollo/client";

export const GET_WORKSPACES = gql`
  query GetWorkspaces {
    workspaces {
      id
      name
      description
      owner {
        id
        name
        image
      }
      members {
        role
        user {
          id
          name
          image
        }
      }
      boards {
        id
        name
        key
        background
      }
    }
  }
`;

export const GET_WORKSPACE = gql`
  query GetWorkspace($id: ID!) {
    workspace(id: $id) {
      id
      name
      description
      members {
        role
        user {
          id
          name
          image
        }
      }
      boards {
        id
        name
        key
        background
      }
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      name
      key
      background
      columns {
        id
        title
        order
        type
        tasks {
          id
          title
          description
          priority
          order
          dueDate
          assignee {
            id
            name
            image
            email
          }
          labels
        }
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      image
    }
  }
`;
