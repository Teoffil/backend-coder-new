document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener el token de autorización
    function getToken() {
        return localStorage.getItem('token'); // Suponiendo que el token está almacenado en localStorage
    }

    // Función para editar el rol de un usuario
    function editUser(userId) {
        const newRole = prompt('Enter new role (user/premium/admin):');
        if (newRole) {
            fetch(`/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ role: newRole })
            })
            .then(response => {
                if (response.ok) {
                    alert('User role updated successfully');
                    location.reload();
                } else {
                    alert('Failed to update user role');
                }
            })
            .catch(error => {
                console.error('Error updating user role:', error);
                alert('An error occurred while updating user role');
            });
        }
    }

    // Función para eliminar un usuario
    function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('User deleted successfully');
                    location.reload();
                } else {
                    alert('Failed to delete user');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('An error occurred while deleting user');
            });
        }
    }

    // Asignar funciones a los botones de editar y eliminar
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.dataset.userId;
            editUser(userId);
        });
    });

    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.dataset.userId;
            deleteUser(userId);
        });
    });
});
