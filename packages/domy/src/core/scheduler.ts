import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import { error } from '../utils/logs';

type QueueElement = () => any;

let queued = false;
let queueIndex = 0;

const queue: QueueElement[] = [];
const resolvedPromise = Promise.resolve();

const queueCallbacks: QueueElement[] = [];

const seen = new Map<QueueElement, number>();
const MAX_RECURSION = 100;

/**
 * Wait for the queue to be fully empty
 * @param job
 *
 * @author yoannchb-pro
 */
export function queueJobOnQueueEmpty(job: QueueElement) {
  queueCallbacks.push(job);
}

/**
 * Flush the queue
 *
 * @author yoannchb-pro
 */
function flushJobs() {
  queued = true;

  for (; queueIndex < queue.length; ++queueIndex) {
    const job = queue[queueIndex];
    callWithErrorHandling(job, err => error(err));
  }

  if (queueIndex < queue.length) {
    flushJobs();
  } else {
    seen.clear();
    queueIndex = 0;
    queue.length = 0;
    queued = false;

    for (const queueCb of queueCallbacks) {
      queueJob(queueCb);
    }

    queueCallbacks.length = 0;
  }
}

/**
 * Scheduler function to add a job to the queue
 * @param job
 *
 * @author yoannchb-pro
 */
export function queueJob(job: QueueElement) {
  const count = seen.get(job) ?? 0;

  if (count > MAX_RECURSION) {
    error(
      `A job as been skipped because it look like he is calling his self a bounch of times and exceed the max recursive amount (${MAX_RECURSION}).`
    );
    return;
  }

  seen.set(job, count + 1);

  queue.push(job);

  if (!queued) {
    // Use Promise.resolve to defer the execution and regroup DOM updates
    resolvedPromise.then(flushJobs);
  }
}
