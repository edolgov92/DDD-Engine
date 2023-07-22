import { container, DependencyContainer } from 'tsyringe';

export function getContainer(): DependencyContainer {
  return ((globalThis as any).container as DependencyContainer) || container;
}
