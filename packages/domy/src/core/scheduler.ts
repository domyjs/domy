import { callWithErrorHandling } from '../utils/callWithErrorHandling';
import { error } from '../utils/logs';

type QueueElement = () => any;

let queued = false;
let queueIndex = 0;
let queueId = 0;

const queue: QueueElement[] = [];
const resolvedPromise = Promise.resolve();

const queueCallbacks: { job: QueueElement; id: number }[] = [];

const seen = new Map<number, number>(); // <id, count>
const MAX_RECURSION = 100;

/**
 * Wait for the queue to be fully empty
 * @param job
 *
 * @author yoannchb-pro
 */
export function queueJobOnQueueEmpty(job: QueueElement, id: number) {
  queueCallbacks.push({ job, id });
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
      queueJob(queueCb.job, queueCb.id);
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
export function queueJob(job: QueueElement, id: number) {
  const count = seen.get(id) ?? 1;

  if (count >= MAX_RECURSION) {
    error(
      `A job as been skipped because it look like he is calling it self a bounch of times and exceed the max recursive amount (${MAX_RECURSION}).`
    );
    return;
  }

  seen.set(id, count + 1);

  queue.push(job);

  if (!queued) {
    // Use Promise.resolve to defer the execution and regroup DOM updates
    resolvedPromise.then(flushJobs);
  }
}

/**
 * Return an unique queue id
 * @returns
 *
 * @author yoannchb-pro
 */
export function getUniqueQueueId() {
  return ++queueId;
}
