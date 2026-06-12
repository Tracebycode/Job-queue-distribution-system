import {InMemoryQueue} from "./queue/InMemoryQueue";
import type {JobType} from "./types/jobtype";
import {worker} from "./workers/woker";



const queue = new InMemoryQueue();

const job1: JobType = {
    id: "1",
    jobtype: "email",
    payload: { to: "user@example.com" },
    status: 1
};

const job2: JobType = {
    id: "2",
    jobtype: "sms",
    payload: { to: "+1234567890" },
    status: 1
};  

queue.enqueue(job1);
queue.enqueue(job2);


const worker1 = new worker(queue);
worker1.processJobs();
worker1.processJobs();
worker1.processJobs();




