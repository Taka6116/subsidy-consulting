type Task<T> = () => Promise<T>;

type QueueItem<T> = {
  run: Task<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
  domain: string;
};

export type DomainRateLimiterOptions = {
  requestDelayMs?: number;
  maxConcurrent?: number;
};

/**
 * ドメインごとに最低間隔を担保しつつ、全体同時実行数を制御する。
 * - 同一ドメインの同時リクエストは1
 * - 全体同時実行は maxConcurrent
 */
export class DomainRateLimiter {
  private readonly requestDelayMs: number;
  private readonly maxConcurrent: number;
  private queue: Array<QueueItem<unknown>> = [];
  private runningTotal = 0;
  private readonly runningByDomain = new Map<string, number>();
  private readonly nextAllowedAtByDomain = new Map<string, number>();
  private draining = false;

  constructor(options: DomainRateLimiterOptions = {}) {
    this.requestDelayMs = options.requestDelayMs ?? 1_000;
    this.maxConcurrent = options.maxConcurrent ?? 10;
  }

  run<T>(url: string, task: Task<T>): Promise<T> {
    const domain = new URL(url).hostname;
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ domain, run: task, resolve, reject } as QueueItem<unknown>);
      void this.drain();
    });
  }

  private async drain() {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.runningTotal < this.maxConcurrent && this.queue.length > 0) {
        const now = Date.now();
        let pickedIndex = -1;

        for (let i = 0; i < this.queue.length; i += 1) {
          const item = this.queue[i];
          const domainRunning = this.runningByDomain.get(item.domain) ?? 0;
          const nextAllowedAt = this.nextAllowedAtByDomain.get(item.domain) ?? 0;
          if (domainRunning === 0 && now >= nextAllowedAt) {
            pickedIndex = i;
            break;
          }
        }

        if (pickedIndex === -1) {
          const waitFor = Math.max(
            40,
            Math.min(
              ...this.queue.map((q) =>
                Math.max(0, (this.nextAllowedAtByDomain.get(q.domain) ?? now) - now),
              ),
            ),
          );
          await new Promise((r) => setTimeout(r, waitFor));
          continue;
        }

        const [item] = this.queue.splice(pickedIndex, 1);
        if (!item) continue;
        this.runningTotal += 1;
        this.runningByDomain.set(item.domain, (this.runningByDomain.get(item.domain) ?? 0) + 1);
        this.nextAllowedAtByDomain.set(item.domain, now + this.requestDelayMs);

        void item
          .run()
          .then((value) => item.resolve(value))
          .catch((error) => item.reject(error))
          .finally(() => {
            this.runningTotal -= 1;
            const next = (this.runningByDomain.get(item.domain) ?? 1) - 1;
            if (next <= 0) this.runningByDomain.delete(item.domain);
            else this.runningByDomain.set(item.domain, next);
            void this.drain();
          });
      }
    } finally {
      this.draining = false;
    }
  }
}
