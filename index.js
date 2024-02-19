const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const multer = require('multer')
const router = express.Router();

//import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/project');


//app
const app = express();
app.use(cors())
// app.use(cors({
//   origin: "https://taskifyre.vercel.app/"
// }));


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// db
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log(err));

//middlewares
// multer



router.get('/', async (req, res) => {
  try {
    res.json({
      status: 200,
      message: "Hello World!"
    })
  } catch (error) {
    return res.status(505).send("Server error")
  }
});

//routes middleware
app.use('/uploads', express.static('uploads'));
app.use('/api/user', authRoutes);
app.use('/api/product', projectRoutes);
app.use('/', router);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on ${port}`)
});