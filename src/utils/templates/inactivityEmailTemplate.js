module.exports = (email) => {
    return `
        <div>
            <h1>Account Deleted Due to Inactivity</h1>
            <p>Dear User,</p>
            <p>Your account with email ${email} has been deleted due to inactivity.</p>
            <p>If you have any questions, please contact support.</p>
            <p>Best regards,</p>
            <p>Your Company</p>
        </div>
    `;
};
