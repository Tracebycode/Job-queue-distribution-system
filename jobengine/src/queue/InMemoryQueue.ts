import  type {JobType} from "../types/jobtype.ts";


export class InMemoryQueue{
    private pendingJobs: JobType[] = [];
    private processingJobs: JobType[] = [];


    enqueue(job : JobType): void{
        this.pendingJobs.push(job);
    }


    //caim job and processing
    claimjob():JobType | null{

        const job = this.pendingJobs.shift();


        if(!job){
            console.log("No more jobs to process")
            return null;
        }
        job.status = 1;
        this.processingJobs.push(job);
        return job;

    }


    completeJob(jobId: string): void{
    
        this.processingJobs = this.processingJobs.filter(job=>job.id!=jobId);
    
    }

    //temporary to check queue working

    printQueue(): void{
        console.log("Pending Jobs:", this.pendingJobs);
        console.log("Processing Jobs:", this.processingJobs);
    }




}