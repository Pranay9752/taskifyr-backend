

const express = require('express');
const router = express.Router();
const { register, login, profile, getUser, updateUser } = require('../controllers/auth');
const auth = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + path.extname(file.originalname)
        cb(null, uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.get('/profile/:username', auth, profile);
router.get('/:_id', auth, getUser);
router.patch('/profile/update', auth, upload.single('image'), updateUser);



module.exports = router;