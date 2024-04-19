const UserDAO = require('../dao/mongo/UserDAO');
const UserDTO = require('../dto/UserDTO');

class UserRepository {
    constructor() {
        this.userDao = new UserDAO();
    }

    async createUser(userData) {
        const user = await this.userDao.createUser(userData);
        return new UserDTO(user);
    }

    async getUserById(userId) {
        const user = await this.userDao.getUserById(userId);
        return new UserDTO(user);
    }

    async getUserByEmail(email) {
        const user = await this.userDao.getUserByEmail(email);
        if (!user) return null; // Consider handling the null case more explicitly
        return new UserDTO(user);
    }

    async updateUser(userId, userData) {
        const user = await this.userDao.updateUser(userId, userData);
        return new UserDTO(user);
    }

    async deleteUser(userId) {
        const user = await this.userDao.deleteUser(userId);
        return user ? { message: 'Usuario eliminado correctamente' } : null; // Typically you might not need a DTO for deletion
    }

    async verifyCredentials(email, password) {
        const user = await this.userDao.verifyCredentials(email, password);
        return user ? new UserDTO(user) : null;
    }
}

module.exports = UserRepository;
