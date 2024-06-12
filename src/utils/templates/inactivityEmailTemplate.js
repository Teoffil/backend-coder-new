module.exports = (email) => {
    return `
        <div>
            <h1>Cuenta Eliminada por Inactividad</h1>
            <p>Estimado Usuario,</p>
            <p>Tu cuenta con el correo electrónico ${email} ha sido eliminada debido a inactividad.</p>
            <p>Si tienes alguna pregunta, por favor contacta al soporte.</p>
            <p>Saludos cordiales,</p>
            <p>BigTecnology</p>
        </div>
    `;
};
