class retry{
    recoverstruckjobs(queue: any, retryInterval: number): void{
        setInterval(() => {
            const now = Date.now();
            const stuckJobs = queue.processingJobs.filter((job: any) => job.claimedate && (now - job.claimedate) > retryInterval);
            stuckJobs.forEach((job: any) => {
                console.log(`Retrying stuck job with id: ${job.id}`);
                queue.failjobs(job.id);
                queue.enqueue(job);
            });
        }, retryInterval);  
    }
}