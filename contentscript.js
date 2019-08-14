// Add bubble to the top of the page.
var bubbleDOM = $('<div class="selection_bubble"><div class="inner_bubble"></div></div>')[0];
document.body.appendChild(bubbleDOM);

var wordPanelDOM = $(`
<div id="div_word" style="visibility: hidden;position:absolute;background-color:white;padding:5px;white;box-shadow: rgba(83,84,86,0.85) 0px 1px 3px;">
    <span id="sp_error" style="font-size:12px;"></span>
    <span id="sp_spell" style="font-size:18px;"></span> <span id="sp_pronounce" style="font-size:12px;"></span>
    <br/>
    <span id="sp_meaning" style="white-space: pre-line;font-size:12px;"></span>
</div>`)[0];
document.body.appendChild(wordPanelDOM);

bubbleDOM.onclick = function (e) {
    let text = bubbleDOM.getAttribute('sel_text');
    // console.log(bubbleDOM.getAttribute('sel_text'));
    // $.get("http://localhost:9100/dictionary/word/search/?lang=1&&form="+bubbleDOM.getAttribute('sel_text'),{},function(result){
    //     console.log(result);
    //     bubbleDOM.style.visibility = 'hidden';
    // });
    chrome.runtime.sendMessage({opt: 'search', body: {form: text}}, function (result) {
        bubbleDOM.style.visibility = 'hidden';

        let response = result.response;
        let user = result.user;

        $('#div_word').css('visibility', 'visible');
        let top = $(bubbleDOM).css('top');
        let left = $(bubbleDOM).css('left');
        $('#div_word').css('top', top);
        $('#div_word').css('left', left);

        if (response.status != 200) {
            $('#sp_error').text(response.err);
            $('#sp_spell').text('');
            $('#sp_pronounce').text('');
            $('#sp_meaning').text('');
        } else {
            // 管理员不显示查询结果
            // if(user.roles && user.roles.indexOf('admin')>=0)
            // {
            //
            // }
            // else{
            $('#sp_error').text('');
            if(response.responseText) {
                let word = JSON.parse(response.responseText);
                //显示单词发音和意思
                $('#sp_spell').text(word.spell);
                $('#sp_pronounce').text('['+word.pronounce+']');
                $('#sp_meaning').text(word.meaning);

                //如果该词没有ID，说明是简易结果，后台正在爬取例句信息
                if(!word.id){
                    $('#sp_spell').css('border-style','dashed');
                    $('#sp_spell').css('border-width','thin');
                    $('#sp_spell').css('border-color','gray');
                    $('#sp_spell').css('color','gray');
                }
                else{

                    $('#sp_spell').css('border-style','');
                    $('#sp_spell').css('border-width','');
                    $('#sp_spell').css('border-color','');
                    $('#sp_spell').css('color','');
                }
            }
            // }

        }
    });
};
bubbleDOM.onmouseup = function (e) {
    e.stopPropagation();
};
bubbleDOM.onmousedown = function (e) {
    e.stopPropagation();
};

wordPanelDOM.onmouseup = function (e) {
    e.stopPropagation();
};
wordPanelDOM.onmousedown = function (e) {
    e.stopPropagation();
};


// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
    // console.log(window.scrollY);
    var selection = window.getSelection();
    var text = selection.toString();
    var oRange = selection.getRangeAt(0);
    var oRect = oRange.getBoundingClientRect();

    var x = e.clientX+15;
    var y = oRect.top+oRect.height+1;

    if (text.length > 0 && text.length < 20) {
        renderBubble(x + window.scrollX, y + window.scrollY, text);
    }
}, false);


// Close the bubble when we click on the screen.
document.addEventListener('mousedown', function (e) {
    bubbleDOM.style.visibility = 'hidden';
    wordPanelDOM.style.visibility = 'hidden';
}, false);


// Move that bubble to the appropriate location.
function renderBubble(mouseX, mouseY, selection) {
    // console.log(mouseX,mouseY);
    bubbleDOM.setAttribute('sel_text', selection);
    bubbleDOM.style.top = mouseY + 'px';
    bubbleDOM.style.left = mouseX + 'px';
    bubbleDOM.style.visibility = 'visible';
}