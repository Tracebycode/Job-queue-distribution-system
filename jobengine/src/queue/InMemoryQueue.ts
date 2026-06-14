import  type {JobType} from "../types/jobtype";
import { jobstatus } from "../types/jobtype";


export class InMemoryQueue{
    private pendingJobs: JobType[] = [];
    private processingJobs: JobType[] = [];
    private completedJobs: JobType[] = [];
    private failedJobs: JobType[] = [];



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


    completeJob(jobId: string): void{
        this.completedJobs.push(...this.processingJobs.filter(job=>job.id==jobId).map(job=>{ job.status = jobstatus.completed; return job; }));
    
        this.processingJobs = this.processingJobs.filter(job=>job.id!=jobId);

    
    }


    // storing the failed jobs

    failjobs(jobId: string): void{
        this.failedJobs.push(...this.processingJobs.filter(job=>job.id==jobId).map(job=>{ job.status = jobstatus.failed; return job; }));
        this.processingJobs = this.processingJobs.filter(job=>job.id!=jobId);
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

        recoverStaleJobs(retryInterval: number,staleJobs: JobType[])  : void{
            staleJobs.forEach((job: JobType) => {
                console.log(`Retrying stuck job with id: ${job.id}`);
                this.processingJobs = this.processingJobs.filter(j => j.id !== job.id);
                job.status = jobstatus.pending;
                delete job.claimedate;
                this.enqueue(job);
             });


            }



        }
            



