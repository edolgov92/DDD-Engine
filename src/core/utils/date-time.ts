const DATE_ISO8601: RegExp = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/;

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function setSyncInterval(callback: () => void | Promise<void>, ms: number): void {
  const task: () => Promise<void> = async () => {
    const result: void | Promise<void> = callback();
    if (result instanceof Promise) {
      await result;
    }
    setTimeout(task, ms);
  };
  setTimeout(task, ms);
}

export function isDateString(value: string): boolean {
  if (value === null || value === undefined || typeof value !== 'string') {
    return false;
  }
  return DATE_ISO8601.test(value);
}

export function parseObjectDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  for (const key of Object.keys(obj)) {
    const value: any = obj[key];
    if (isDateString(value)) {
      obj[key] = new Date(value);
    } else if (typeof value === 'object') {
      parseObjectDates(value);
    }
  }
}
