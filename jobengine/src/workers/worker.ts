import { InMemoryQueue } from "../queue/InMemoryQueue";

export class worker{
    constructor(private queue :InMemoryQueue){};

    
    // claim job and processing
    claimJob(): void{
        const job = this.queue.claimjob();
        if(job){
            console.log(`Processing job with id: ${job.id} and type: ${job.jobtype}`);  
            // Simulate job processing
            setTimeout(() => {
                this.queue.completeJob(job.id);
                console.log(`Completed job with id: ${job.id}`);
            }, 1000);       
        }



    }
}