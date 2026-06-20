# Job Queue Distribution System

This repository contains a small TypeScript job queue engine that demonstrates how to accept jobs, claim them for execution, retry failures with backoff, promote delayed jobs, and recover stale in-progress jobs using an in-memory queue.

The current implementation is intentionally lightweight and self-contained. It is useful as a learning project, a prototype for queue orchestration, or a base for exploring distributed worker patterns.

## What The Project Does

- Stores jobs in memory instead of using an external broker or database.
- Moves jobs through a basic lifecycle: pending, in progress, completed, failed.
- Supports delayed execution by holding jobs until their scheduled time.
- Retries failed jobs with exponential backoff until the maximum attempt count is reached.
- Sends exhausted jobs to a dead-letter queue.
- Detects stale in-progress jobs and returns them to the pending queue for another attempt.

## Core Flow

1. A job is created with an `id`, `jobtype`, `payload`, `status`, `attempt`, and `maxattempt`.
2. `InMemoryQueue.enqueue()` places the job in the pending queue, or in the delayed queue if `scheduledAt` is in the future.
3. A worker claims a pending job through `InMemoryQueue.claimjob()`.
4. The worker either completes the job or marks it as failed.
5. Failures are retried with exponential backoff until `maxattempt` is reached.
6. Jobs that exceed their retry limit are moved to the dead-letter queue.
7. The delayed-job scheduler promotes ready delayed jobs back into the pending queue.
8. The recovery scheduler re-queues stale jobs that have been stuck in progress too long.

## Job Model

The job shape is defined in [jobengine/src/types/jobtype.ts](jobengine/src/types/jobtype.ts).

Required fields:

- `id`: unique job identifier used for tracking and retries.
- `jobtype`: identifies the kind of work to execute.
- `payload`: job data passed to the worker.
- `status`: current lifecycle state.
- `attempt`: how many times the job has been tried.
- `maxattempt`: maximum retry count allowed.

Optional fields:

- `claimedate`: timestamp recorded when a worker claims the job.
- `scheduledAt`: timestamp for delayed execution.

Status values:

- `pending`
- `inprogress`
- `completed`
- `failed`

## Queue Responsibilities

The queue owns storage and state transitions. Its implementation lives in [jobengine/src/queue/InMemoryQueue.ts](jobengine/src/queue/InMemoryQueue.ts).

Responsibilities handled by the queue:

- Accept jobs through `enqueue()`.
- Deliver jobs to workers through `claimjob()`.
- Move jobs into the completed list through `completeJob()`.
- Retry failed jobs through `failjob()`.
- Track delayed jobs and promote them when ready.
- Detect stale jobs and move them back to pending.

Internal queue buckets:

- `pendingJobs`: jobs waiting for execution.
- `processingJobs`: jobs currently claimed by a worker.
- `completedJobs`: jobs that finished successfully.
- `DLQ`: jobs that have failed too many times.
- `DelayedQueue`: jobs waiting for their scheduled execution time.

## Worker Behavior

The worker implementation is in [jobengine/src/workers/worker.ts](jobengine/src/workers/worker.ts).

Workers are responsible for execution only. In the current demo setup, a worker claims one job and then, after a short timeout, either completes it or fails it depending on the `shouldfail` flag passed to the constructor.

This makes the worker easy to swap out later for real business logic such as email delivery, data processing, or API calls.

## Retry And Backoff

Retry logic is currently implemented inside `InMemoryQueue.failjob()`.

When a job fails:

- The attempt count is incremented.
- If the job still has retries left, it is rescheduled using exponential backoff.
- If the job has exhausted retries, it is moved to the dead-letter queue.

The backoff formula used by the queue is:

`baseDelay * 2^attempt`

with a base delay of 1000 ms.

## Delayed Jobs

Jobs with a future `scheduledAt` timestamp are placed into the delayed queue instead of the pending queue.

The delayed job scheduler in [jobengine/src/scheduler/DelayedJobScheduler.ts](jobengine/src/scheduler/DelayedJobScheduler.ts) periodically calls `promoteDelayedJobs()` so jobs become available once their scheduled time arrives.

## Stale Job Recovery

If a job remains in progress for too long, the recovery flow can move it back into the pending queue.

The recovery scheduler in [jobengine/src/scheduler/RecoveryScheduler.ts](jobengine/src/scheduler/RecoveryScheduler.ts) periodically calls:

- `getstalejobs(retryInterval)` to identify stale jobs.
- `recoverStaleJobs(staleJobs)` to requeue them.

This helps the engine recover from worker crashes or jobs that never reported completion.

## Project Structure

```text
Readme.md
jobengine/
  package.json
  tsconfig.json
  src/
    index.ts
    types/
      jobtype.ts
    queue/
      InMemoryQueue.ts
      Iqueue.ts
    workers/
      worker.ts
    scheduler/
      DelayedJobScheduler.ts
      RecoveryScheduler.ts
    utils/
      CalculateBackoff.ts
```

## Demo Entry Point

The demo setup in [jobengine/src/index.ts](jobengine/src/index.ts) does the following:

- Creates an `InMemoryQueue` instance.
- Enqueues two sample jobs.
- Creates one worker.
- Claims a job and processes it.
- Prints the queue state after 10 seconds.

This is a simple smoke test for the queue flow rather than a production service entrypoint.

## How To Run

The project is configured as a TypeScript CommonJS workspace in [jobengine/tsconfig.json](jobengine/tsconfig.json) and uses the dependencies listed in [jobengine/package.json](jobengine/package.json).

If you want to run the demo locally, install dependencies in the `jobengine` folder and execute the entrypoint with `ts-node`.

Example:

```bash
cd jobengine
npx ts-node src/index.ts
```

If you prefer compiling first, use the TypeScript compiler and run the generated output from your build directory once you configure one.

## Current Notes

- This is an in-memory implementation, so queue state is lost when the process stops.
- The repository currently focuses on the core queue lifecycle rather than persistence, networking, or observability.
- `Iqueue.ts` is currently commented out.
- `CalculateBackoff.ts` is currently empty because the active backoff logic lives inside `InMemoryQueue`.
- The scheduler classes are present, but the README should be treated as a description of the current codebase rather than a full production-ready API contract.

## Suggested Next Steps

1. Add npm scripts for build and run.
2. Export and wire the schedulers into the demo entrypoint.
3. Add tests for enqueue, retry, delayed promotion, and stale recovery.
4. Move retry and backoff helpers into shared utilities.
