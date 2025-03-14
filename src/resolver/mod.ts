import type { Resolver } from "../types.ts";
import DenoLockResolver from "./deno-lock.ts";

/** @internal */
export const resolvers = [
  DenoLockResolver.name,
] as const;

/** @internal */
export const ResolverRegistry: Record<
  typeof resolvers[number],
  Resolver<typeof resolvers[number]>
> = {
  [DenoLockResolver.name]: DenoLockResolver,
};
