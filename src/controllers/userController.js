const User = require('../dao/models/UserSchema');
const logger = require('../config/logger');
const { sendInactivityEmail } = require('../utils/emailService');

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
    },

    getAllUsers: async (req, res) => {
        try {
            logger.debug('Obteniendo todos los usuarios');
            const users = await User.find({}, 'first_name last_name email role');
            logger.debug('Usuarios obtenidos', { users });
            res.render('adminUsers', { users });
        } catch (error) {
            logger.error('Failed to get users', { error: error.message });
            res.status(500).json({ message: 'Failed to get users' });
        }
    },

    deleteInactiveUsers: async (req, res) => {
        try {
            const twoMinutesAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
            const inactiveUsers = await User.find({ last_connection: { $lt: twoMinutesAgo } });

            for (const user of inactiveUsers) {
                await sendInactivityEmail(user.email);
                await User.deleteOne({ _id: user._id });  
            }

            res.json({ message: 'Inactive users deleted' });
        } catch (error) {
            logger.error('Failed to delete inactive users', { error: error.message });
            res.status(500).json({ message: 'Failed to delete inactive users' });
        }
    },

    changeUserRole: async (req, res) => {
        const { uid } = req.params;
        const { role } = req.body;

        try {
            const validRoles = ['user', 'admin', 'premium'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified' });
            }

            const user = await User.findById(uid);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.role = role;
            await user.save();

            res.json({ message: 'User role updated successfully' });
        } catch (error) {
            logger.error('Failed to change user role', { error: error.message });
            res.status(500).json({ message: 'Failed to change user role' });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { uid } = req.params;
            await User.findByIdAndDelete(uid);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            logger.error('Failed to delete user', { error: error.message });
            res.status(500).json({ message: 'Failed to delete user' });
        }
    }
};

module.exports = userController;