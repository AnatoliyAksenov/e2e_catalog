llama3 = {
    "system": '<|start_header_id|>system<|end_header_id|>',
    "user": '<|start_header_id|>user<|end_header_id|>',
    "assistant": '<|start_header_id|>assistant<|end_header_id|>',
    "end": '<|eot_id|>'
}

openchat36 = {
    "system": '<|start_header_id|>GPT4 Correct User<|end_header_id|>',
    "user": '<|start_header_id|>GPT4 Correct User<|end_header_id|>',
    "assistant": '<|start_header_id|>GPT4 Correct Assistant<|end_header_id|>',
    "end": '<|eot_id|>'

}


main = {
    "speed_test": """%(system)sYou are a speed test bot.%(end)s %(user)s What is your name?%(end)s %(assistant)s""",
    "google_search_engine": """%(system)s You are a google search engine.%(end)s
        %(user)s Suggest internet search queries to ask to the "{q}" in order to "{theme}"
        %(end)s 
        %(user)s Return json array of queries. Answer in russian.%(end)s 
        %(user)s Example of output json:
        [
           "Search query one",
           "search query two",
        ]
        %(end)s 
        %(assistant)s 
    """,
    "summarization": """%(system)sYou are an analyst%(end)s
        %(user)sYou have to extract the most useful information from the text below to anser the question "{q}".%(end)s
        %(user)s
        The text: 
        {text}%(end)s
        %(user)s
        Give me the answer only in russian language.%(end)s
        %(user)s
        Give me the answer in 3 sentences.%(end)s
        %(assistant)s
        """,
    "yes_or_no":"""%(system)s You are an Doctor Ph.D. Degree Economic Science.%(end)s
        %(user)s The given text: 
        {text}%(end)s
        %(user)s Is the given text satisfies the questin "{q}"? Give me one word if it true YES otherwise NO %(end)s
        %(assistant)s 
    """,
    "dates": """%(system)sYou are an Doctor Ph.D. Degree Economic Science.%(end)s
        %(user)s The given text: 
        {text}%(user)s
        %(user)s Extract key dates from suggested text %(end)s
        %(user)s Present results in json format. %(end)s
        %(user)s Example:
        [
         {{
           "Date 1": "Event 1",
           "Another date": "another event"
         }}
        ]
        %(end)s
        %(assistant)s 
    """,
    "table": """%(system)s You are an Doctor Ph.D. Degree Economic Science.%(end)s
        %(user)s The given text: 
        {text}%(end)s
        %(user)s Extract key numeric data from suggested text %(end)s
        %(user)s Present results in json format. %(end)s
        %(user)s Example:
        [
         {{
           "Parameter 1": "10%%",
           "Another parameter": "$1.000,00"
         }}
        ]
        %(end)s
        %(user)s If numeric data does not exists return nothing.%(end)s
        %(assistant)s
        """
}


openchat = {
    "speed_test":{
        "prompt": main.get("speed_test")% openchat36,
        "temperature":  0.15,
    },
    "google_search_engine":{
        "prompt": main.get("google_search_engine") % openchat36,
        "temperature": 0.15,
    },
    "yes_or_no":{
        "prompt": main.get("yes_or_no")  % openchat36,
        "temperature": 0.15,
    },
    "summarization":{
        "prompt": main.get("summarization")% openchat36,
        "temperature": 0.15,
    },
    "dates":{
        "prompt": main.get("dates")   % openchat36,
        "temperature": 0.15,
    },
    "table":{
        "prompt": main.get("table")   % openchat36,
        "temperature": 0.15,
    }
}

llama =  {
    "speed_test":{
        "prompt": main.get("speed_test")% llama3,
        "temperature":  0.15,
    },
    "google_search_engine":{
        "prompt": main.get("google_search_engine")  % llama3,
        "temperature":  0.5,
    },
    "yes_or_no":{
        "prompt": main.get("yes_or_no")  % llama3,
        "temperature":  0.5,
    },
    "summarization":{
        "prompt": main.get("summarization")% llama3,
        "temperature":  0.5,
    },
    "dates":{
        "prompt": main.get("dates")   % llama3,
        "temperature":  0.5,
    },
    "table":{
        "prompt": main.get("table")   % llama3,
        "temperature":  0.5,
    }
}

templates = openchat

all_templates = {
    "openchat": openchat,
    "llama": llama
}