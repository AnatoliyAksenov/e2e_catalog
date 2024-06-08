import asyncio
import urllib
import requests
import html5lib

import unicodedata

from tika import parser

headers = {
"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
"accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
"cache-control": "no-cache",
"pragma": "no-cache",
"priority": "u=0, i",
'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
"sec-ch-ua-mobile": "?0",
'sec-ch-ua-platform': '"Linux"',
"sec-fetch-dest": "document",
"sec-fetch-mode": "navigate",
"sec-fetch-site": "none",
"sec-fetch-user": "?1",
"upgrade-insecure-requests": "1",
"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
}

stoplist = ['google.com', 'microsoft.com', ]

def extract_link(link):
    url = urllib.parse.urlparse(link)
    return urllib.parse.parse_qs(url.query).get('uddg')[0]


sources = {
    "ddg": {
        'url':'https://html.duckduckgo.com/html/?q={q}',
        'links': './/html:a[@class="result__snippet"]',
        'extract_link': True,
        
    },
    "bing":{
        'url': 'https://www.bing.com/search?q={q}',
        'links': './/html:a[@target = "_blank"]',
    }
    
}

def get_links(source, query_params, request_params):
    url = source.get('url').format(**query_params)
    res = requests.get(url, **request_params)
    if res.ok:
        parsed =  html5lib.parse(res.text, treebuilder="lxml")
        blinks = parsed.findall(source.get('links'), namespaces=parsed.getroot().nsmap)
        links = [x.attrib.get('href') for x in blinks]
    
        if source.get('extract_link'):
            res = [extract_link(x) for x in links]
            return res

        return links
    return []

async def get_text(link, request_params):
    try:
        res = requests.get(link, **request_params)

        if res.ok:
            content_type = res.headers.get('content-type')
            
            if content_type.lower() in ('application/pdf', 'application/docx', 'application/xlsx'):
                content = res.content
                raw = parser.from_buffer(content)
                return (link, content_type, raw['content'])
                
            if content_type.lower() in ('text/html', 'text/html; charset=utf-8'):
                content = res.text
                parsed =  html5lib.parse(content, treebuilder="lxml")
                nodes = parsed.xpath('.//*[not(local-name() = "style") and not(local-name() = "script") and not(local-name() = "li")and not(local-name() = "ul")and not(local-name() = "a")]/text()', namespaces=parsed.getroot().nsmap)
                text = " ".join([x.strip() for x in nodes if x.strip() and len(x.strip()) > 30])
                return (link, content_type, text)
    
            return (link, content_type, res.content)
    except requests.exceptions.Timeout as e:
        return (link, None, None)


async def process_query(query):
    ii = []
    request_params = {'headers': headers, "timeout": 2}

    for key, source in sources.items():
        items = get_links(source, {"q": query}, {'headers': headers})
        ii += items

    lst = [x for x in list(set(ii)) if not any([xx in x for xx in stoplist])]

    tasks = [get_text(x, request_params) for x in lst]
    res = await asyncio.gather(*tasks)

    return [ {"link": x[0], "type": x[1], "text": unicodedata.normalize('NFKC', x[2])} for x in res if x and x[1]]


