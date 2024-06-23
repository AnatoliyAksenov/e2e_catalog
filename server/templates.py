
class cutstr():
    """The cutstr class is a utility class that allows for the formatting of strings 
       with the ability to truncate values passed as keyword arguments or as positional arguments like modern string formatting behavior (`.format`). 
       The truncation length is determined by the `cutlen` keyword argument, which defaults to infinity if not provided.

       The format method takes in positional and keyword, and for each value, it checks if its length exceeds the cutlen. 
       If it does, it truncates the value to the specified length. The truncated values are then used in the string formatting.

       The __str__ and __repr__ methods return the formatted string.
       The __add method allows for the concatenation of cutstr objects, creating a new cutstr object with the concatenated string.

       Here is an example of how to use the cutstr class:
       ```
       c = cutstr('Hello, {name}!', cutlen=5)
       print(.format(name='John Doe'))  # Output: 'Hello, John D...'
       ```
    """

    def __init__(self, *args, **kwargs):
       self._t = args[0]
       self._cutlen = kwargs.get('cutlen', float('inf')) or float('inf')

    def format(self, *args, **kwargs):
        nkv = {}
        a = []
        for k,v in kwargs.items():
            if len(v) > self._cutlen:
                nkv[k] = v[: self._cutlen]
            else:
                nkv[k] = v
      
        a = [x[: self._cutlen] if len(x) > self._cutlen else x for x in args]
        return self._t.format(*a, **nkv)

    def __str__(self):
        return self._t

    def __repr__(self):
        return self._t

    def __add__(self, val):
        return self.__class__(self._t + val)

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
    "speed_test": """%(system)sYou are a speed test bot.%(end)s %(user)s What is your name? Give me only your name.%(end)s %(assistant)s""",
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
        """,
    "simple_question": """%(system)s You are a smart competitior. %(end)s
    %(user)s Get me an asnwer to the question "{q}" based on the text below.%(end)s
    %(user)s The given text:
    {text}%(end)s
    %(user)s If an answer cannot be obtained, return a space.%(end)s
    %(user)s верни ответ на русском языке, только ответ, без рассуждений.%(end)s
    %(assistant)s
    """,
    "validation": """%(system)s You are a smart analyst. %(end)s
    %(user)s Provide a non-empty and most popular answer to the question "{q}" in the list of queustions below.%(end)s
    %(user)s Questions: {text}%(end)s
    %(user)s return the answer %(end)s
    %(assistant)s
    """
}


openchat = {
    "speed_test":{
        "prompt": cutstr(main.get("speed_test")% openchat36, cutlen=10016),
        "temperature":  0.15,
    },
    "google_search_engine":{
        "prompt": cutstr(main.get("google_search_engine") % openchat36, cutlen=10016),
        "temperature": 0.15,
    },
    "yes_or_no":{
        "prompt": cutstr(main.get("yes_or_no")  % openchat36, cutlen=10016),
        "temperature": 0.15,
    },
    "summarization":{
        "prompt": cutstr(main.get("summarization")% openchat36, cutlen=10016),
        "temperature": 0.15,
    },
    "dates":{
        "prompt": cutstr(main.get("dates")   % openchat36, cutlen=10016),
        "temperature": 0.15,
    },
    "table":{
        "prompt": cutstr(main.get("table")   % openchat36, cutlen=10016),
        "temperature": 0.15,
    },
    "simple_question":{
        "prompt": cutstr(main.get("simple_question")% openchat36, cutlen=10016),
         "temperature":  0.15,
    },
    "validation":{
        "prompt": cutstr(main.get("validation")% openchat36, cutlen=10016),
        "temperature":  0.15,
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
    },
    "simple_question":{
        "prompt": main.get("simple_question")% llama3,
        "temperature":  0.5,
    },
    "validation":{
        "prompt": main.get("validation")% llama3,
        "temperature":  0.5,
    }
}

templates = openchat

all_templates = {
    "openchat": openchat,
    "llama": llama
}