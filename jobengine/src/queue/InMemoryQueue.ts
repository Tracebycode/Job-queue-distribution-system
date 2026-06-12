import  type {JobType} from "../types/jobtype.ts";


export class InMemoryQueue{
    private jobs: JobType[] = [];


    enqueue(job : JobType): void{
        this.jobs.push(job);
    }

    dequeue(): JobType | null{
        if(this.jobs.length === 0){
            return null;
        }
        return this.jobs.shift()!;
    }



}