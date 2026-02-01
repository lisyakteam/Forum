import DOMPurify from 'dompurify';

export const parseBBCode = (text) => {
    if (!text) return null;
    let formatted = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\[quote=(.*?)\](.*?)\[\/quote\]/gs, '<div class="quote-block"><strong>$1 сказал:</strong><br/>$2</div>')
    .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
    .replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>')
    .replace(/\[size=(\d+)\](.*?)\[\/size\]/g, '<span style="font-size: $1px;">$2</span>')
    .replace(/\[font=(.*?)\](.*?)\[\/font\]/g, '<span style="font-family: $1;">$2</span>')
    .replace(/\[table\](.*?)\[\/table\]/gs, '<table class="bb-table">$1</table>')
    .replace(/\[tr\](.*?)\[\/tr\]/gs, '<tr>$1</tr>')
    .replace(/\[td\](.*?)\[\/td\]/gs, '<td>$1</td>')
    .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" class="post-img" alt="User content" />')
    .replace(/\n/g, '<br />');

    const cleanHtml = DOMPurify.sanitize(formatted, {
        ALLOWED_TAGS: ['b', 'i', 'u', 's', 'strong', 'em', 'a', 'img', 'div', 'span', 'br', 'table', 'tr', 'td'],
        ALLOWED_ATTR: ['href', 'src', 'style', 'target', 'class', 'rel']
    });

    return <div dangerouslySetInnerHTML={{__html: cleanHtml}} />;
};
