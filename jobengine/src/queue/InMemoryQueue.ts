import  type {JobType} from "../types/jobtype";
import { jobstatus } from "../types/jobtype";


export class InMemoryQueue{

   


    //Required properties for the queue
    private pendingJobs: JobType[] = [];
    private processingJobs: JobType[] = [];
    private completedJobs: JobType[] = [];
    private DLQ: JobType[] = [];



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
                        

        if(failedJob){
            failedJob.attempt += 1;

            if( failedJob.attempt < failedJob.maxattempt){
                failedJob.status = jobstatus.pending;
                delete failedJob.claimedate;
                this.enqueue(failedJob);
                this.processingJobs = this.processingJobs.filter(job => job.id !== jobId);
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
                job.status = jobstatus.pending;
                delete job.claimedate;
                this.enqueue(job);
             });


            }




            //fallback for failed jobs

          


        
        





        }
            



