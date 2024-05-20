const User = require('../dao/models/UserSchema');
const logger = require('../config/logger');

const userController = {
    updateToPremium: async (req, res) => {
        const { uid } = req.params;
        try {
            const user = await User.findById(uid);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const requiredDocuments = ['identificacion', 'comprobante_domicilio', 'comprobante_estado_cuenta'];
            const uploadedDocuments = user.documents.map(doc => doc.name);
            const hasAllDocuments = requiredDocuments.every(doc => uploadedDocuments.includes(doc));

            if (!hasAllDocuments) {
                return res.status(400).json({ message: 'User has not uploaded all required documents' });
            }

            user.role = 'premium';
            await user.save();
            res.json({ message: 'User upgraded to premium' });
        } catch (error) {
            logger.error('Failed to update user to premium', { error: error.message });
            res.status(500).json({ message: 'Failed to update user to premium' });
        }
    },

    uploadDocuments: async (req, res) => {
        const { uid } = req.params;
        try {
            const user = await User.findById(uid);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const files = req.files;
            for (const key in files) {
                files[key].forEach(file => {
                    user.documents.push({
                        name: file.fieldname,
                        reference: file.path
                    });
                });
            }

            await user.save();
            res.json({ message: 'Documents uploaded successfully', documents: user.documents });
        } catch (error) {
            logger.error('Failed to upload documents', { error: error.message });
            res.status(500).json({ message: 'Failed to upload documents' });
        }
    }
};

module.exports = userController;
