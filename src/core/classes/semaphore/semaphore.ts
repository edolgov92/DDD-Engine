export class Semaphore {
  count: number;

  private tasks: (() => void)[] = [];

  constructor(count: number) {
    this.count = count;
  }

  private sched(): void {
    if (this.count > 0 && this.tasks.length > 0) {
      this.count--;
      const next: (() => void) | undefined = this.tasks.shift();
      if (next === undefined) {
        throw 'Unexpected undefined value in tasks list';
      }
      next();
    }
  }

  public acquire(): Promise<() => void> {
    return new Promise<() => void>((res, rej) => {
      const task: () => void = () => {
        let released: boolean = false;
        res(() => {
          if (!released) {
            released = true;
            this.count++;
            this.sched();
          }
        });
      };
      this.tasks.push(task);
      if (process && process.nextTick) {
        process.nextTick(this.sched.bind(this));
      } else {
        setImmediate(this.sched.bind(this));
      }
    });
  }

  async use<T>(func: () => Promise<T>): Promise<T> {
    return this.acquire().then((release) => {
      return func()
        .then((res: T) => {
          release();
          return res;
        })
        .catch((err: any) => {
          release();
          throw err;
        });
    });
  }
}
