import { CronJob } from 'cron';

let index = 0;
const job = new CronJob(
  '* * * * * *',
  function () {
    index++;
    console.log(index);
    if (index > 9) {
      job.stop();
    }
  }
  // null
  // true,
  // 'America/Los_Angeles'
);

export const defaultJob = job;
