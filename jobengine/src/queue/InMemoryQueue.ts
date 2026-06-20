import  type {JobType} from "../types/jobtype";
import { jobstatus } from "../types/jobtype";


export class InMemoryQueue{

   


    //Required properties for the queue
    private pendingJobs: JobType[] = [];
    private processingJobs: JobType[] = [];
    private completedJobs: JobType[] = [];
    private DLQ: JobType[] = [];
    private DelayedQueue: JobType[] = [];

    //private method to move job to pending queue
    private moveJobToPending(job: JobType): void {
        delete job.claimedate;
        job.status = jobstatus.pending; 
        this.pendingJobs.push(job);     
    }   

    private promotedelayedJobs(job: JobType): void {
        delete job.scheduledAt;
        this.moveJobToPending(job);

        
    }

    //calculate backoff time for retrying failed jobs
    private calculateBackoff(attempt: number): number{
        const baseDelay = 1000; // 1 second
        return baseDelay * Math.pow(2, attempt);
    }












    enqueue(job : JobType): void{
        job.status = jobstatus.pending;

        if(job.scheduledAt && job.scheduledAt > Date.now()){
            this.DelayedQueue.push(job);
            console.log(`Job with id ${job.id} is scheduled for future execution at ${new Date(job.scheduledAt).toISOString()}.`);
            return;
        }
        this.pendingJobs.push(job);
    }


    //caim job and processing
    claimjob():JobType | null{

        const job = this.pendingJobs.shift();


        if(!job){
            console.log("No more jobs to process")
            return null;
        }
        job.status = jobstatus.inprogress;
            this.processingJobs.push(job);
        job.claimedate = Date.now();
        return job;

    }



    //complete job and move to completed jobs
    completeJob(jobId: string): void{
        this.completedJobs.push(...this.processingJobs.filter(job=>job.id==jobId).map(job=>{ job.status = jobstatus.completed; return job; }));
    
        this.processingJobs = this.processingJobs.filter(job=>job.id!=jobId);

    
    }


    // storing the failed jobs

    failjob(jobId: string): void{
        
        const failedJob = this.processingJobs.find(job => job.id === jobId);
                        

        if(failedJob ){
            failedJob.attempt += 1;

            if( failedJob.attempt < failedJob.maxattempt){
                const backoffTime = this.calculateBackoff(failedJob.attempt);
                failedJob.scheduledAt = Date.now() + backoffTime;
                this.processingJobs = this.processingJobs.filter(job => job.id !== jobId);
                this.moveJobToPending(failedJob);
                console.log(`Job with id ${jobId} has failed. Retrying in ${backoffTime / 1000} seconds.`);
                
            }else{
                failedJob.status = jobstatus.failed;
                this.DLQ.push(failedJob);
                this.processingJobs = this.processingJobs.filter(job => job.id !== jobId);
                console.log(`Job with id ${jobId} has failed and moved to DLQ.`);
            }

            }
        }
    

    //temporary to check queue working

    printQueue(): void{
        console.log("Pending Jobs:", this.pendingJobs);
        console.log("Processing Jobs:", this.processingJobs);
        console.log("Completed Jobs:", this.completedJobs);
    }

    //get stale jobs
        getstalejobs(retryInterval: number): JobType[]{
            const now = Date.now();

            const staleJobs = this.processingJobs.filter(job => job.claimedate && (now - job.claimedate) > retryInterval);

            return staleJobs;
        }

        //recover stale jobs
        recoverStaleJobs(staleJobs: JobType[])  : void{
            staleJobs.forEach((job: JobType) => {
                console.log(`Retrying stuck job with id: ${job.id}`);
                this.processingJobs = this.processingJobs.filter(j => j.id !== job.id);
               this.moveJobToPending(job);
             });


            }




            //ready jobs from delayed queue and move to pending queue
            promoteDelayedJobs(): void{
                const now = Date.now();
                const readyJobs = this.DelayedQueue.filter(job => job.scheduledAt && job.scheduledAt <= now);
                readyJobs.forEach(job => {
                    console.log(`Promoting delayed job with id ${job.id} to pending queue.`);
                    this.promotedelayedJobs(job);
                });
                this.DelayedQueue = this.DelayedQueue.filter(job => !readyJobs.includes(job));


        }


        

            


    }
