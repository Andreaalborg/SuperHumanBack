import { authResolvers } from './authResolver';
import { activityResolvers } from './activityResolver';
import { progressResolvers } from './progressResolver';
import { aiResolvers } from './aiResolver';
import { socialResolvers } from './socialResolver';
import { mockResolvers } from './mockResolvers';
import { GraphQLScalarType, Kind } from 'graphql';
import { AppDataSource } from '../config/database';

// Custom Date scalar
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    // Handle both Date objects and strings
    if (value instanceof Date) {
      return value.toISOString();
    }
    // If it's already an ISO string, return it
    if (typeof value === 'string') {
      // Try to parse it to validate it's a valid date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return value;
      }
    }
    // If it's a number (timestamp), convert to ISO string
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    return null;
  },
  parseValue(value) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    if (value instanceof Date) {
      return value;
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

// Custom JSON scalar
const jsonScalar: GraphQLScalarType = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any): any {
    return value;
  },
  parseValue(value: any): any {
    return value;
  },
  parseLiteral(ast: any, variables?: any): any {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return parseObject(ast);
      case Kind.LIST:
        return ast.values.map((value: any) => parseLiteral(value, variables));
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  },
});

function parseLiteral(ast: any, variables?: any): any {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast);
    case Kind.LIST:
      return ast.values.map((value: any) => parseLiteral(value, variables));
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

function parseObject(ast: any): any {
  const value = Object.create(null);
  ast.fields.forEach((field: any) => {
    value[field.name.value] = parseLiteral(field.value, {});
  });
  return value;
}

// Merge all resolvers
// Use mock resolvers if database is not initialized
const useMockResolvers = !AppDataSource.isInitialized;

export const resolvers = useMockResolvers ? {
  Date: dateScalar,
  JSON: jsonScalar,
  ...mockResolvers,
} : {
  Date: dateScalar,
  JSON: jsonScalar,
  
  Query: {
    ...authResolvers.Query,
    ...activityResolvers.Query,
    ...progressResolvers.Query,
    ...aiResolvers.Query,
    ...socialResolvers.Query,
  },
  
  Mutation: {
    ...authResolvers.Mutation,
    ...activityResolvers.Mutation,
    ...socialResolvers.Mutation,
    ...aiResolvers.Mutation,
  },
  
  // Type resolvers
  User: authResolvers.User || {},
  UserMetadata: authResolvers.UserMetadata || {},
  ProgressStats: progressResolvers.ProgressStats || {},
};
