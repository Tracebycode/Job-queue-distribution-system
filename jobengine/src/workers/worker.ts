import { InMemoryQueue } from "../queue/InMemoryQueue";


export class worker{
    private shouldfail: boolean= false;
    constructor(private queue :InMemoryQueue,shouldfail: boolean){};
    

    
    // claim job and processing
    claimJob(): void{
        const job = this.queue.claimjob();
        if(job){
            setTimeout(() => {
                if(this.shouldfail){
                    this.queue.failjob(job.id);
                }else{
                    this.queue.completeJob(job.id);
                }
            }, 1000);       
        }




    }



    // retry failed job with backoff strategy
    failJob(jobId: string): void{
        this.queue.failjob(jobId);
    }
}