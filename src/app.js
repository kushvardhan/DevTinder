require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');
const { authRouter } = require('./routes/AuthRoute');
const { profileRouter } = require('./routes/ProfileRoute');
const { requestRouter } = require('./routes/RequestRouter');
const { userRouter } = require('./routes/UserRoute');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', authRouter);
app.use('/profile', profileRouter);
app.use('/request', requestRouter);
app.use('/user', userRouter);

app.options('*', cors(corsOptions)); 


connectDB()
  .then(() => {
    console.log('Connected to Database');
    app.listen(4000, () => console.log('Server started on port 4000'));
  })
  .catch((error) => {
    console.error('Error connecting to Database:', error);
  });
