import http from 'k6/http';
import { check } from 'k6';

// To install k6 run: brew install k6

export const options = {
  scenarios: {
    my_scenario1: {
      executor: 'constant-arrival-rate',
      duration: '90s', // total duration
      preAllocatedVUs: 50, // to allocate runtime resources

      rate: 50, // number of constant iterations given `timeUnit`
      timeUnit: '1s',
    },
  },
};

export default function () {
  const payload = JSON.stringify({
    name: 'lorem',
    surname: 'ipsum',
  });
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJpZCI6IjkxYWM0ZDJhLWEwNmEtNGRmMi1hMzkzLTU3NzcyNWU0Yzg5YSIsInVzZXJOYW1lIjoiUHJpbWVyYSBFbXByZXNhMiIsImVtYWlsIjoicHJpMm1lcmFAZW1wcmVzYS5jb20iLCJjb21wYW55SWQiOiI5NjA4YzU1MC01ZDljLTQxZjQtYjA4MS1lZDVkZTZjMTZmMGEiLCJyb2xlIjoiQURNSU4iLCJjcmVhdGVkQXQiOiIyMDIzLTA0LTE1VDE3OjEyOjA0LjAwMFoiLCJ1cGRhdGVkQXQiOiIyMDIzLTA0LTE1VDE3OjEyOjA0LjAwMFoifQ.kPT_AWduixam-n19w2KgBIhjdsNzHhcYbE2OrsuWG4IF5HkgT4MQ9GOhwKpbPVLTgKpQv8AeOg0ia6tRayrBRKWaAqtiUkeIljUyWXHCOuDzwXCHbm8FAejs8r1riV1TslUiVb83DRQY2niZV4ipMQAwD_O-W8Ulx-TDt8pU3VveT7I7NC8eI02JBlAu9vSLAkJGpV-xe7_C_4YVlyoZRc7Dqv9bsyn5tJFSbL6PMmtp8YjUkFTf9MyDyUHdrj_y5282OXMohWFrMiz7ChlthKO1sBrzjVAzC-veD1j6MRsWP4t9OVerqgjiWUt33zR575lqZg1LtoYZtQ8640gyGA' };
  const res = http.get('http://localhost:3000/products', { headers });
//   const res = http.post('https://httpbin.test.k6.io/post', payload, { headers });

  check(res, {
    'Get status is 200': (r) => res.status === 200,
    // 'Get Content-Type header': (r) => res.headers['Content-Type'] === 'application/json; charset=utf-8',
    // 'Get response name': (r) => res.status === 200 && res.json().json.name === 'lorem',
  });
}
