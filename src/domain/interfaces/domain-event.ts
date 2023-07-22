export interface DomainEvent<T = any> {
  data?: T;
  name: string;
}
