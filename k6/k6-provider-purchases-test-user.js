import http from 'k6/http';
import { check } from 'k6';

// To install k6 run: brew install k6
// To run k6 script: k6 run k6-provider-purchases.js

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
  // do requests using test User
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer eyJhbGciOiJSUzI1NiJ9.eyJpZCI6IjY4Mjg0ODUwLTAyNDMtNGY1NC05ZjNkLTYxNTExNjE5OTcxMiIsInVzZXJOYW1lIjoiVGVzdCIsImVtYWlsIjoidGVzdFNhbGVzQHRlc3RTYWxlcy5jb20iLCJjb21wYW55SWQiOiIxYTQ0MzcyNi1jZTEwLTQ0ZjAtYmI0My1hZTI0NTEwNGYyNzgiLCJyb2xlIjoiVEVTVCIsImNyZWF0ZWRBdCI6IjIwMjMtMDUtMDJUMDE6MTk6MzkuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjMtMDUtMDJUMDE6MTk6MzkuMDAwWiJ9.Fq-MfJHIHlCWhRL6EpcrhjASmK4J1d4NsZQh2VkXj0U0eDIxu748CtNhVxC3NdHVmcnTVkpl7gmbH5MUXidHzJTGjRIlqAj3mfqhWJQlgYRxVahDgkkZoSAbnWRgycSpWu9YVZmB9-G4g7F41twWntB1tY3D07NySxHIDsZAbQrjZaDsvQNprr1iyMAOxjwXG0cDDSGLFxMGQMcJ8SRyGt3GNpf1egJc8J4P-V7sPYRVkjXTLTQgSyDmcWNd_Afq9QdjaJLcDtu08bqGmm7JADpz08L52hlher8JwyA2uZoTDG8dgRKah-j_BY2qOQumEWwdMNSIggoKV59p3nVnDQ` };
  const providerId = "36d53a2a-1736-462e-8db5-ef783bf3e48f"
  const from = "2023-03-23"
  const to = "2023-12-25"
  const res = http.get(`http://backend-ellis-jodus-reyes.us-east-1.elasticbeanstalk.com/purchasesTest/provider/${providerId}?from="${from}"&to="${to}"`, { headers });

  check(res, {
    'Get status is 200': (r) => res.status === 200
  });
}
