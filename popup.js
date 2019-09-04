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

    // 初始化语言下拉框（不管是否登录，都初始化）
    initLangSelect();

    $('#sel_lang').change(function(e){
        let lang = $('#sel_lang').val();
        localStorage.setItem('lang',lang);
    });

    $('#img_vcode').click(function(){
        refreshVCode();
    });

    $('#btn_reLogin').click(function(){
        $('#div_settings').css('display','none');
        $('#div_login').css('display','');
        refreshVCode();
    });

    $('#btn_login').click(function(){
        let username = $('#txb_username').val();
        let password = $.md5($('#txb_password').val());
        let ticket = localStorage.getItem('ticket');
        let vcode = $('#txb_vcode').val();
        let param = JSON.stringify({username:username,password:password});

        $.ajax({
            type: 'post',
            url: `${api_host}/auth/login/${ticket}/${vcode}`,
            data: param,
            contentType : 'application/json',
            // dataType没有用!!!
            // dataType: 'json',
            complete: function(xhr, textStatus) {

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

    // listner 不能放在这里，因为popup页面一旦不显示，相关的js就不再运行，就无法监听到message!!!
    // 需要放到background js
    // chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    //     if(msg.opt == 'search'){
    //         let token = localStorage.getItem('token');
    //         var lang = localStorage.getItem('lang');
    //         if(!lang){lang = 1;}
    //         let form = msg.body.form;
    //
    //         $.ajax({
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             },
    //             type: 'get',
    //             url: `http://localhost:9100/dictionary/word/search/?lang=${lang}&&form=${form}`,
    //             complete: function(xhr) {
    //                 console.log(xhr);
    //                 let token = localStorage.getItem('token')||'';
    //                 var user = {};
    //                 if(token) {
    //                     user = parseJwt(token);
    //                 }
    //                 //xhr 无法直接传出去，传出去后，结构就会被简化，丢掉大部分信息!!!
    //                 sendResponse({user:user,response:xhr});
    //             }
    //         });
    //         return true;
    //     }});
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
    $.get(api_host+"/kaptcha/",{},function(res){
        let ticket = res.ticket;
        let img = res.img;

        localStorage.setItem('ticket',ticket);
        $('#img_vcode').attr('src','data:image/jpg;base64,'+img);
        // sendResponse(img);
    });
}
function initLangSelect(){
    var lang = localStorage.getItem('lang');
    if(!lang)
    {
        //默认English
        lang = 1;
    }

    $('#sel_lang').val(lang);
}