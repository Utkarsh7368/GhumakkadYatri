const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRouter = require('./routes/authRoute');
const adminRouter = require('./routes/adminRoute');
const commonRouter = require('./routes/commonRoute');
const bookingRouter = require('./routes/bookingRoute');
const passwordResetRouter = require('./routes/resetPassRoute');
const contactRouter = require('./routes/contactRoute');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/common', commonRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/auth', passwordResetRouter);
app.use('/api/common', contactRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});