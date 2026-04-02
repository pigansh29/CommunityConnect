const sendEmail = async (options) => {
    // Determine the API key from the environment
    const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;
    const senderEmail = process.env.EMAIL_USER;

    if (!apiKey) {
         throw new Error("Brevo API key is missing. Add BREVO_API_KEY or EMAIL_PASS to environment variables.");
    }

    const payload = {
        sender: { name: "Community Connect", email: senderEmail },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Community Connect</h2>
                <p>${options.message.replace(/\n/g, '<br/>')}</p>
                <br/>
                <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply.</p>
            </div>
        `,
        textContent: options.message
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Brevo API Error: ${response.status} - ${errorData}`);
    }
};

module.exports = sendEmail;
