import { InMemoryQueue } from "../queue/InMemoryQueue";


export class worker{
    static nextWorkerId = 0
    private workerid: number;
    constructor(private queue :InMemoryQueue){
        this.workerid = worker.nextWorkerId++;
    };
    

    
    // claim job and processing
    claimJob(): void{
        const job = this.queue.claimjob();
        if(job){
            console.log(`Processing job with id: ${job.id} and type: ${job.jobtype} with worker ${this.workerid}`);  
            // Simulate job processing
            setTimeout(() => {
                this.queue.completeJob(job.id);
                console.log(`Completed job with id: ${job.id}`);
            }, 1000);       
        }



    }
}