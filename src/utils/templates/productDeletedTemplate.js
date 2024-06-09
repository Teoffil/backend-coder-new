module.exports = (email) => {
    return `
        <div>
            <h1>Product Deleted</h1>
            <p>Dear User,</p>
            <p>Your product associated with email ${email} has been deleted.</p>
            <p>If you have any questions, please contact support.</p>
            <p>Best regards,</p>
            <p>Your Company</p>
        </div>
    `;
};

