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
              <title>TerrorHub email</title>
              <style>
            
                h2 {
                  font-size: 35px;
                  font-weight: bold;
                  color: #8c0000;
                }
            
                p {
                  font-size: 18px;
                  margin-bottom: 20px;
                  color:black;                  
                }
            
                a {
                  background: none;
                  padding: 10px;
                  text-align: center;
                  color: #8c0000;
                  border: 2px solid #8c0000;
                  font-family: 'Griffy', cursive;
                  font-weight: 300;
                  font-size: 1.1rem;
                  min-width: 150px;
                  cursor: pointer;
                  margin-top: 20px;
                  text-decoration: none;
                }
                  a:hover {
                     color: #8c0000;
                  }
                  a:active {
                    color: #8c0000;
                  }
                  .ii a[href] {
                    color: #8c0000 !important;
                  }
              </style>
            </head>

                <body style="background: white; color: black; font-family: sans-serif; font-size: 16px; color: #fff; max-width:800px; margin:0 auto;">

                <header style="display: flex; justify-content: center; align-items: center; padding: 40px 0; background-color: black; -webkit-box-shadow: 0px 10px 29px -7px rgba(0,0,0,0.75); -moz-box-shadow: 0px 10px 29px -7px rgba(0,0,0,0.75); box-shadow: 0px 10px 29px -7px rgba(0,0,0,0.75);">
                    <img src="https://terrorhub-fef1e79d918b.herokuapp.com/IMAGES/backgrounds/bg_other1.webp" alt="terrorhub-logo"
                        style="width: 100%; max-width: 300px; margin: 0 auto;">
                </header>
            
                
                    <div style="padding: 20px;  min-height: 300px;">
                
                        ${bodyContentet}
                
                    </div>
            
                </body>

            </html>
            `;

};
            


module.exports = {
    sendEmail,htmlTemplate
};