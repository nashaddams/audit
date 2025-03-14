import type { Resolver } from "../types.ts";
import DenoLockResolver from "./deno-lock.ts";
import PackageLockResolver from "./package-lock.ts";
import BunLockResolver from "./bun-lock.ts";

/** @internal */
export const resolvers = [
  DenoLockResolver.name,
  PackageLockResolver.name,
  BunLockResolver.name,
] as const;

/** @internal */
export const ResolverRegistry: Record<
  typeof resolvers[number],
  Resolver<typeof resolvers[number]>
> = {
  [DenoLockResolver.name]: DenoLockResolver,
  [PackageLockResolver.name]: PackageLockResolver,
  [BunLockResolver.name]: BunLockResolver,
};
