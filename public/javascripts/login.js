const { ServerHeartbeatFailedEvent } = require("mongodb");

function checkusername(id) {
    let username = document.getElementById(id);
    $.ajax({
        url: '/checkname',
        method: 'post',
        data: {
            username: username.value
        },
        success: (res) => {
            if (res.response.status) {
                username.classList.add('succes')
                username.classList.remove('error')
            } else {
                username.classList.add('error')
                username.classList.remove('succes')
            }
        }
    })
}

function checkUsername(id) {
    let username = document.getElementById(id);
    $.ajax({
        url: '/checkname',
        method: 'post',
        data: {
            username: username.value
        },
        success: (res) => {
            if (res.response.status) {
                username.classList.add('error')
                username.classList.remove('succes')
            } else {
                username.classList.add('succes')
                username.classList.remove('error')
            }
        }
    })
}
function checkotp(id) {
    let otp = document.getElementById(id);
    let uid = document.getElementById('uid')
    let btn = document.getElementById('verify')
    if (otp.value > 6) {
        $.ajax({
            url: '/checkotp',
            method: 'post',
            data: {
                otp: otp.value,
                uid: uid.value
            },
            success: (res) => {
                if (res.status) {
                    otp.classList.add('succes')
                    otp.classList.remove('error')
                    btn.click()
                } else {
                    otp.classList.add('error')
                    otp.classList.remove('succes')
                }
            }
        })
    } else {
        otp.classList.add('error')
        otp.classList.remove('succes')
    }
}