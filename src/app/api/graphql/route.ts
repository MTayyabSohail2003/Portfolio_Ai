import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import mongoose from "mongoose";

// Ensure DB is connected
const uri = process.env.MONGODB_URI;
if (mongoose.connection.readyState === 0 && uri) {
  mongoose.connect(uri);
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => ({ req }),
});

const nextHandler = handler as any;
export { nextHandler as GET, nextHandler as POST };
