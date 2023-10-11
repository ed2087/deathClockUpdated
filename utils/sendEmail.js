const _nodemailer = require("nodemailer");
const _sendgridtransport = require("nodemailer-sendgrid-transport");



const transporter = _nodemailer.createTransport(_sendgridtransport({

   auth : {
      api_key : `${process.env.SENDGRID_KEY}`
   }

}));



const sendEmail = async (email, subject, html) => {

    try {
    
       const emailSent = await transporter.sendMail({
            from : `${process.env.EMAIL}`,
            to : `${email}`,
            subject : `${subject}`,
            html : `${html}`
        });

        //if email sent return true
        if(emailSent) return true;

        //if email not sent return false
        return false;


    }
    catch(err){
        console.log(err);
    }

};


const htmlTemplate = (bodyContentet) => {

    return `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Verify your TerrorHub email</title>
              <style>
                body {
                  background-color: black;
                  color: white;
                  font-family: sans-serif;
                }
            
                h2 {
                  font-size: 30px;
                  font-weight: bold;
                }
            
                p {
                  font-size: 16px;
                  line-height: 24px;
                }
            
                a {
                  color: red;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              ${bodyContentet}
            </body>
            </html>
            `;

};
            


module.exports = {
    sendEmail,htmlTemplate
};