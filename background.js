function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if(msg.opt == 'search'){
            let token = localStorage.getItem('token');
            var lang = localStorage.getItem('lang');
            if(!lang){lang = 1;}
            let form = msg.body.form;

            $.ajax({
                headers: {
                    Authorization: `Bearer ${token}`
                },
                type: 'get',
                url: `http://localhost:9100/dictionary/word/search/?lang=${lang}&&form=${form}`,
                complete: function(xhr) {
                    var response = {};
                    response.status = xhr.status;
                    response.responseText = xhr.responseText;
                    if(xhr.status != 200){
                        //xhr 无法直接传出去，传出去后，结构就会被简化，ResponseHeader会被丢掉!!!
                        //这里把想要传出去的信息重新构造
                        var err = xhr.getResponseHeader('msg-content')
                        if (err) {
                            err = decodeURI(err);
                        } else {
                            err = '发生错误，请重新尝试';
                        }
                        response.err = err;
                    }

                    let token = localStorage.getItem('token')||'';
                    var user = {};
                    if(token) {
                        user = parseJwt(token);
                    }
                    sendResponse({user:user,response:response});
                }
            });
            return true;
        }
});