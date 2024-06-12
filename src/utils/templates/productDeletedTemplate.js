module.exports = (email) => {
    return `
        <div>
            <h1>Producto Eliminado</h1>
            <p>Estimado Usuario,</p>
            <p>Tu producto asociado con el correo electrónico ${email} ha sido eliminado.</p>
            <p>Si tienes alguna pregunta, por favor contacta al soporte.</p>
            <p>Saludos cordiales,</p>
            <p>BigTecnology</p>
        </div>
    `;
};

