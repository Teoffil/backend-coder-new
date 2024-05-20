const express = require('express');
const multer = require('multer');
const { authorize } = require('../../middleware/authorization');
const userController = require('../../controllers/userController');

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'src/public/images/documents';
        if (file.fieldname === 'profile') folder = 'src/public/images/profiles';
        if (file.fieldname === 'product') folder = 'src/public/images/products';
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Rutas de usuario
router.put('/premium/:uid', authorize(['user']), userController.updateToPremium);
router.post('/:uid/documents', authorize(['user']), upload.fields([
    { name: 'identificacion' },
    { name: 'comprobante_domicilio' },
    { name: 'comprobante_estado_cuenta' }
]), userController.uploadDocuments);

module.exports = router;


