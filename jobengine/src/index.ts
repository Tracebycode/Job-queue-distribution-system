import {InMemoryQueue} from "./queue/InMemoryQueue";
import {jobstatus, type JobType} from "./types/jobtype";
import {worker} from "./workers/worker";


//testing the retry mechanism with backoff strategy
const queue = new InMemoryQueue();


const job1: JobType = {
    id: "job1",
    payload: {task: "Task 1"},
    status: jobstatus.pending,
    jobtype: "email notification",
    attempt: 0,
    maxattempt: 3,
};
const job2: JobType = {
    id: "job2",
    payload: {task: "Task 2"},
    jobtype: "data processing",
    status: jobstatus.pending,
    attempt: 0,
    maxattempt: 3,
};


queue.enqueue(job1);
queue.enqueue(job2);


const worker1 = new worker(queue,true);
worker1.claimJob();


setTimeout(() => {
    queue.printQueue();
}, 10000);