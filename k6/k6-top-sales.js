import http from 'k6/http';
import { check } from 'k6';

// To install k6 run: brew install k6
// To run k6 script: k6 run k6-top-sales.js

export const options = {
  scenarios: {
    my_scenario1: {
      executor: 'constant-arrival-rate',
      duration: '60s', // total duration
      preAllocatedVUs: 50, // to allocate runtime resources

      rate: 1200, // number of constant iterations given `timeUnit`
      timeUnit: '60s',
    },
  },
};

export default function () {
  const companyApiKey = 'd854e96cac9815750d4012196d88e799c2b097b39f12040e326d609f227bb9f2';
  const companyId = '0443e7ab-242b-4cfe-a763-b8d39277979c';
  const headers = { 'Content-Type': 'application/json', 'x-api-key': companyApiKey };
  const res = http.get(`http://backend-ellis-jodus-reyes.us-east-1.elasticbeanstalk.com/saleReport/${companyId}`, { headers });

  check(res, {
    'Get status is 200': (r) => res.status === 200
  });
}
