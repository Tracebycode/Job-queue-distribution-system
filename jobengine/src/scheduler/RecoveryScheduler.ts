import { InMemoryQueue } from "../queue/InMemoryQueue";
import type { JobType } from "../types/jobtype";


class recoveryScheduler{


    recoverstruckjobs(queue: InMemoryQueue, retryInterval: number): void{
        setInterval(() => {
            const stuckJobs = queue.getstalejobs(retryInterval);
            queue.recoverStaleJobs( stuckJobs);
        }, retryInterval);  
    }


}
        