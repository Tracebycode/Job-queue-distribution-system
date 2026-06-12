import { InMemoryQueue } from "../queue/InMemoryQueue";

export class worker{
    constructor(private queue :InMemoryQueue){};

    processJobs():void{
        const job = this.queue.dequeue();

        if(!job){
            console.log("No jobs to process");
            return
        }


        job.status=2;;// inprogress

        console.log(`Processing job ${job.id} of type ${job.jobtype}`);



        // job completed


        job.status=3;// completed
        console.log(`Completed job ${job.id}`);
    }
}