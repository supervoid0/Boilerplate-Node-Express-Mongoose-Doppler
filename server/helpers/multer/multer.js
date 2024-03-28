const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const {
      body: { newFileName = 'name-not-specified' }
    } = req;

    const { originalname } = file;
    const ext = originalname.split('.').pop();
    cb(null, `${newFileName}.${ext}`);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
