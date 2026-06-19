import { InMemoryQueue } from "../queue/InMemoryQueue";


class DelayedJobSceduler {
    constructor(private queue: InMemoryQueue) {}

    start() {  
        setInterval(() => {
            this.queue.promoteDelayedJobs();

        }, 1000); // Check every second

    }


}
