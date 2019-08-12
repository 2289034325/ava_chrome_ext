// Add bubble to the top of the page.
var bubbleDOM = $('<div class="selection_bubble"><div class="inner_bubble"></div></div>')[0];
document.body.appendChild(bubbleDOM);

console.log("loaded");

bubbleDOM.onclick = function(e){
    let text = bubbleDOM.getAttribute('sel_text');
    // console.log(bubbleDOM.getAttribute('sel_text'));
    // $.get("http://localhost:9100/dictionary/word/search/?lang=1&&form="+bubbleDOM.getAttribute('sel_text'),{},function(result){
    //     console.log(result);
    //     bubbleDOM.style.visibility = 'hidden';
    // });
    chrome.runtime.sendMessage({opt:'search',params:{text:text}}, function(response) {
        if(response == 'ok'){
            bubbleDOM.style.visibility = 'hidden';
        }
    });
};
bubbleDOM.onmouseup = function(e){
    e.stopPropagation();
};
bubbleDOM.onmousedown = function(e){
    e.stopPropagation();
};


// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
    // console.log(window.scrollY);
    var selection = window.getSelection().toString();
    if (selection.length > 0) {
        renderBubble(e.clientX+window.scrollX, e.clientY+window.scrollY+20, selection);
    }
}, false);


// Close the bubble when we click on the screen.
document.addEventListener('mousedown', function (e) {
    bubbleDOM.style.visibility = 'hidden';
}, false);


// Move that bubble to the appropriate location.
function renderBubble(mouseX, mouseY, selection) {
    // console.log(mouseX,mouseY);
    bubbleDOM.setAttribute('sel_text',selection);
    bubbleDOM.style.top = mouseY + 'px';
    bubbleDOM.style.left = mouseX + 'px';
    bubbleDOM.style.visibility = 'visible';
}