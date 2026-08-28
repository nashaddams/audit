import type { Resolver } from "../types.ts";
import DenoLockResolver from "./deno-lock.ts";
import PackageLockResolver from "./package-lock.ts";

/** @internal */
export const resolvers = [
  DenoLockResolver.name,
  PackageLockResolver.name,
] as const;

/** @internal */
export const ResolverRegistry: Record<
  typeof resolvers[number],
  Resolver<typeof resolvers[number]>
> = {
  [DenoLockResolver.name]: DenoLockResolver,
  [PackageLockResolver.name]: PackageLockResolver,
};
