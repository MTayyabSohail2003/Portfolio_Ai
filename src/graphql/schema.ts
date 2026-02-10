import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String
    email: String
    image: String
    role: String
  }

  type Workspace {
    id: ID!
    name: String!
    owner: User!
    members: [WorkspaceMember!]
    description: String
    boards: [Board!]
  }

  type WorkspaceMember {
    user: User!
    role: String!
  }

  type Board {
    id: ID!
    name: String!
    workspaceId: ID!
    key: String
    background: String
    columns: [Column!]
    tasks: [Task!]
  }

  type Column {
    id: ID!
    title: String!
    boardId: ID!
    order: Int!
    type: String
    tasks: [Task!]
  }

  type Task {
    id: ID!
    title: String!
    description: String
    boardId: ID!
    columnId: ID!
    assignee: User
    reporter: User
    priority: String
    dueDate: Date
    order: Int
    labels: [String!]
  }

  type Query {
    workspaces: [Workspace!]
    workspace(id: ID!): Workspace
    board(id: ID!): Board
    users: [User!]
  }

  type Mutation {
    createWorkspace(name: String!, description: String): Workspace
    createBoard(
      workspaceId: ID!
      name: String!
      key: String
      background: String
    ): Board
    createColumn(boardId: ID!, title: String!, type: String): Column
    createTask(
      boardId: ID!
      columnId: ID!
      title: String!
      description: String
      priority: String
      assigneeId: ID
      dueDate: Date
    ): Task
    moveTask(taskId: ID!, columnId: ID!, order: Int!): Task
    updateTask(taskId: ID!, input: UpdateTaskInput!): Task
    deleteTask(taskId: ID!): Boolean
    updateProfileImage(image: String!): User
  }

  input UpdateTaskInput {
    title: String
    description: String
    priority: String
    assigneeId: ID
    dueDate: Date
  }
`;
