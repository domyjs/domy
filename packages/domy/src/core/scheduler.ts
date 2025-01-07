import { error } from '../utils/logs';

type QueueElement = () => void | Promise<void>;

let queued = false;
const queue: QueueElement[] = [];

/**
 * Flush the queue
 *
 * @author yoannchb-pro
 */
function flushJobs() {
  if (queued || queue.length === 0) return;

  queued = true;

  for (const job of queue) {
    // Use Promise.resolve to defer the execution and regroup DOM updates
    Promise.resolve()
      .then(job)
      .catch(err => error(err));
  }

  queue.length = 0;
  queued = false;
}

/**
 * Scheduler function to add a job to the queue
 * @param job
 *
 * @author yoannchb-pro
 */
export function queueJob(job: QueueElement) {
  if (!queue.includes(job)) queue.push(job);

  if (!queued) {
    flushJobs();
  }
}
