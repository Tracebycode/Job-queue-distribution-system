import {InMemoryQueue} from "./queue/InMemoryQueue";
import type {JobType} from "./types/jobtype";
import {worker} from "./workers/worker";



const queue = new InMemoryQueue();

const job1: JobType = {
    id: "1",
    jobtype: "email",
    payload: { to: "user@example.com" },
    status: 0
};

const job2: JobType = {
    id: "2",
    jobtype: "sms",
    payload: { to: "+1234567890" },
    status: 0
};  

queue.enqueue(job1);
queue.printQueue()
queue.enqueue(job2);
queue.printQueue()

const worker1 = new worker(queue);
worker1.claimJob();
queue.printQueue()
worker1.claimJob();
queue.printQueue()

worker1.claimJob(); // This will show "No more jobs to process"
queue.printQueue()

setTimeout(() => {
    queue.printQueue()
    
}, 2000);




