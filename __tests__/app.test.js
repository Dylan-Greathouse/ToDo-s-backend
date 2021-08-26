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

    test('POST /api/todos creates a new todo', async() => {
      const newTodo = {
        to_do: 'Feed Latte',
        completed: true,
        user_id: 2
      };

      const todoData = await fakeRequest(app)
        .post('/api/todos')
        .set('Authorization', token)
        .send(newTodo)
        .expect(200)
        .expect('Content-type', /json/);
      expect(todoData.body.to_do).toEqual(newTodo.to_do);
      expect(todoData.body.id).toBeGreaterThan(0);
    });

    test('returns todos', async() => {

      const expectation = 
       [{
         id: 6,
         to_do: 'Feed Latte',
         completed: true,
         user_id: 2
       }];
      

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  

    test('PUT /api/todos/:id updates a todos', async() => {
      const updateTodo = {
        id: 1,
        to_do: 'Call apartment office',
        completed: false,
        user_id: 2
      };
      const todoData = await fakeRequest(app)
        .put('/api/todos/1')
        .set('Authorization', token)
        .send(updateTodo)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(todoData.body.completed).toEqual(updateTodo.completed);
      
    });
  });
});
