

 export enum jobstatus{
    pending,
    inprogress,
    completed,
    failed
}

export  interface JobType{
    id: string;
    jobtype: string;
    payload: any;
    status: jobstatus;
    claimedate?: number;

}