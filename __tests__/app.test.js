require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 20000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns todos', async() => {

      const expectation = [
        {
          id: 1,
          to_do: 'Call apartment office',
          completed: true,
          user_id: 1
        },
      
        {
          id: 2,
          to_do: 'Call Portland Gas and Electric company',
          completed: false,
          user_id: 1
        },
      
        {
          id: 3,
          to_do: 'Call Comcast',
          completed: false,
          user_id: 1
        },
      
        {
          id: 4,
          to_do: 'Car Wash',
          completed: true,
          user_id: 1
        },
      
        {
          id: 5,
          to_do: 'Finish packing',
          completed: false,
          user_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
