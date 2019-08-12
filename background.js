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
    }
    else if(msg.opt == 'kaptcha'){
        $.get("http://localhost:9100/kaptcha/",{},function(res){
            let ticket = res.ticket;
            let img = res.img;

            localStorage.setItem('ticket',ticket);
            sendResponse(img);
            });
        return true;
    }
    else if(msg.opt == 'login'){
        let ticket = localStorage.getItem('ticket');
        let vcode = msg.body.vcode;
        let username = msg.body.username;
        let password = msg.body.password;
        let param = JSON.stringify({username:username,password:password});

        $.ajax({
            type: 'post',
            url: `http://localhost:9100/auth/login/${ticket}/${vcode}`,
            data: param,
            contentType : 'application/json',
            // dataType: 'json',
            // success: function (data,textStatus,xhr) {
            //     console.log(data,textStatus,xhr);
            //     sendResponse(data);
            // },
            complete: function(xhr, textStatus) {
                console.log(xhr.getResponseHeader('msg-content'));
                var res = {};
                if(xhr.status != 200)
                {
                    let msg = decodeURI(xhr.getResponseHeader('msg-content'));
                    res = {success:false,msg:msg};
                }
                else{
                    res = {success:true}
                }
                sendResponse(res);
            }
        });
        return true;
    }
    else if(msg.opt == 'set_lang'){
        localStorage.setItem('lang',msg.content);
        sendResponse({});
    }
});