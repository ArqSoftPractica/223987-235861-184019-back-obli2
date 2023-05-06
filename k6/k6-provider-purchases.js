import http from 'k6/http';
import { check } from 'k6';

// To install k6 run: brew install k6
// To run k6 script: k6 run k6-provider-purchases.js

export const options = {
  scenarios: {
    my_scenario1: {
      executor: 'constant-arrival-rate',
      duration: '60s', // total duration
      preAllocatedVUs: 10, // to allocate runtime resources

      rate: 1200, // number of constant iterations given `timeUnit`
      timeUnit: '60s',
    },
  },
};

export default function () {
  const companyApiKey = 'd854e96cac9815750d4012196d88e799c2b097b39f12040e326d609f227bb9f2'
  const headers = { 'Content-Type': 'application/json', 'x-api-key': companyApiKey };
  const providerId = "b5841c0f-ac01-4281-8a95-29d6031d85df"
  const from = "2023-03-23"
  const to = "2023-06-25"
  const res = http.get(`http://backend-ellis-jodus-reyes.us-east-1.elasticbeanstalk.com/purchases/provider/${providerId}?from="${from}"&to="${to}"`, { headers });

  check(res, {
    'Get status is 200': (r) => res.status === 200
  });
}
