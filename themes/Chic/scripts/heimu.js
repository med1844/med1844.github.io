hexo.extend.tag.register("heimu", ([origin, popup = '']) => {
    var heimu_result = ''; 

    origin = origin.trim();
    popup = popup.trim();

    if (popup === '') {
        heimu_result = '<span class="heimu">' + origin + '</span>';
    } else {
        heimu_result = '<span class="heimu" title="' + popup + '">' + origin + '</span>';
    }

    return heimu_result;
});