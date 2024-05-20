const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'documents';
        if (file.fieldname === 'profile') folder = 'profiles';
        if (file.fieldname === 'product') folder = 'products';
        cb(null, path.join(__dirname, `../../public/${folder}`));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;