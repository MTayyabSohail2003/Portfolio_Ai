import { gql } from "@apollo/client";

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!, $description: String) {
    createWorkspace(name: $name, description: $description) {
      id
      name
    }
  }
`;

export const CREATE_BOARD = gql`
  mutation CreateBoard(
    $workspaceId: ID!
    $name: String!
    $key: String
    $background: String
  ) {
    createBoard(
      workspaceId: $workspaceId
      name: $name
      key: $key
      background: $background
    ) {
      id
      name
    }
  }
`;

export const CREATE_COLUMN = gql`
  mutation CreateColumn($boardId: ID!, $title: String!, $type: String) {
    createColumn(boardId: $boardId, title: $title, type: $type) {
      id
      title
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask(
    $boardId: ID!
    $columnId: ID!
    $title: String!
    $priority: String
    $assigneeId: ID
    $dueDate: Date
  ) {
    createTask(
      boardId: $boardId
      columnId: $columnId
      title: $title
      priority: $priority
      assigneeId: $assigneeId
      dueDate: $dueDate
    ) {
      id
      title
      priority
      assignee {
        id
        image
      }
    }
  }
`;

export const MOVE_TASK = gql`
  mutation MoveTask($taskId: ID!, $columnId: ID!, $order: Int!) {
    moveTask(taskId: $taskId, columnId: $columnId, order: $order) {
      id
      columnId
      order
    }
  }
`;

export const UPDATE_PROFILE_IMAGE = gql`
  mutation UpdateProfileImage($image: String!) {
    updateProfileImage(image: $image) {
      id
      image
    }
  }
`;

export const ADD_MEMBER = gql`
  mutation AddMember($workspaceId: ID!, $email: String!, $role: String) {
    addMember(workspaceId: $workspaceId, email: $email, role: $role)
  }
`;
