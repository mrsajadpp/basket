module.exports = {
    otpTemp: (data) => {
        return `<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
    
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;"> 
                                        <a href="https://basket.traceinc.in" title="logo" target="_blank">
                                            <img width="150" src="https://i.postimg.cc/BZxk6HqH/ybanner.png"
                                                title="logo" alt="logo">
                                        </a>
                                        <br>
                                        <h1
                                            style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif; margin-top: 30px;">
                                            Your OTP Is Ready</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            Thank you for choosing Basket, Your OTP is valid for 7 minutes, Don't share with anyone.
                                        </p>
                                        <a href="javascript:void(0);"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">OTP : ${data.otp}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p
                                style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                <strong>https://basket.traceinc.in</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`;
    },
    suOrdTemp: (data) => {
        return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #ec3531;text-decoration:none;font-weight:600">Basket</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Thank you for choosing Basket Store. Your order was succesfully placed.</p>
          <p style="color: green;">Order id: ${data.order.orderId}.</p>
          <p style="font-size:0.9em;">Regards,<br />Basket Store</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Basket Store</p>
            <p>Kolathur po 679338, Kerala</p>
            <p>India</p>
          </div>
        </div>
      </div>`;
    },
    neOrdTemp: (data) => {
        return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #ec3531;text-decoration:none;font-weight:600">Basket</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Hey new order from ${data.user.user.username}.</p>
          <p style="color: green;">Order id: ${data.order.orderId}.</p>
          <p style="font-size:0.9em;">Regards,<br />Basket Store</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Basket Store</p>
            <p>Kolathur po 679338, Kerala</p>
            <p>India</p>
          </div>
        </div>
      </div>`;
    },
    caOrdTemp: (data) => {
        return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #ec3531;text-decoration:none;font-weight:600">Basket</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Order cancellation request from ${data.user.user.username}.</p>
          <p style="color: green;">Order id: ${data.order.orderId}.</p>
          <p style="font-size:0.9em;">Regards,<br />Basket Store</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Basket Store</p>
            <p>Kolathur po 679338, Kerala</p>
            <p>India</p>
          </div>
        </div>
      </div>`;
    }
}