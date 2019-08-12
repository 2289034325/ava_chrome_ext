// $() equals to $( document ).ready()
$(function(){
    // 检查token
    let token = localStorage.getItem('token')||'';
    if(token) {
        // console.log(jwt_decode);
        const user = parseJwt(token);
        $('#sp_user_name').text('Hi '+user.username);
        $('#div_settings').css('display','');
        $('#div_login').css('display','none');
    }
    else{
        $('#sp_user_name').text('未登录');
        $('#div_settings').css('display','none');
        $('#div_login').css('display','');

        refreshVCode();
    }

    $('#img_vcode').click(function(){
        refreshVCode();
    });

    $('#btn_login').click(function(){
        $('#div_settings').css('display','none');
        $('#div_login').css('display','');
    });

    $('#btn_login').click(function(){
        let username = $('#txb_username').val();
        let password = $.md5($('#txb_password').val());
        let ticket = localStorage.getItem('ticket');
        let vcode = $('#txb_vcode').val();
        let param = JSON.stringify({username:username,password:password});

        $.ajax({
            type: 'post',
            url: `http://localhost:9100/auth/login/${ticket}/${vcode}`,
            data: param,
            contentType : 'application/json',
            // dataType没有用!!!
            // dataType: 'json',
            complete: function(xhr, textStatus) {
                console.log(xhr);
                if(xhr.status != 200)
                {
                    let msg = decodeURI(xhr.getResponseHeader('msg-content'));
                    $('#login_msg').text(msg);
                }
                else{
                    let res = JSON.parse(xhr.responseText);
                    localStorage.setItem('token',res.token);

                    $('#sp_user_name').text('Hi '+username);
                    $('#login_msg').text('');
                    $('#txb_username').val('');
                    $('#txb_password').val('');
                    $('#div_settings').css('display','');
                    $('#div_login').css('display','none');
                }
            }
        });
    });

    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if(msg.opt == 'search'){
            let token = localStorage.getItem('token');
            let lang = localStorage.getItem('lang');
            let form = msg.content;

            $.ajax({
                headers: {
                    Authorization: `Bearer ${token}`
                },
                type: 'get',
                url: `http://localhost:9100/dictionary/word/search/?lang=${lang}&&form=${form}`,
                success: function (data,textStatus) {
                    sendResponse(data);
                },
            });
            return true;
        }});
});

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

function refreshVCode(){
    $.get("http://localhost:9100/kaptcha/",{},function(res){
        let ticket = res.ticket;
        let img = res.img;

        localStorage.setItem('ticket',ticket);
        $('#img_vcode').attr('src','data:image/jpg;base64,'+img);
        // sendResponse(img);
    });
}