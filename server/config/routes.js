// const userRouter = require('./routers/userRouter');
const projectRouter = require('./routers/projectRouter');

module.exports = (app) => {
  // app.use('/api/user', userRouter);
  app.use('/api/project', projectRouter);
};