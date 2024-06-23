import os
from openai import OpenAI

from llama_cpp import Llama, llama_free_model


model_file_llama = "Llama-3-8B-Instruct-Gradient-1048k-IQ4_NL.gguf"

model_name_llama =  "Llama-3-8B-Instruct-Gradient-1048k-IQ4_NL"

model_file = "openchat-3.6-8b-20240522-IQ4_NL.gguf"

model_name = "openchat-3.6-8b-20240522-IQ4_NL"

model_path = os.path.join("/home/anatoliy/", model_file)

class ModelStorage(object):

    def __init__(self):
        self._model = None
        self.ctx = 2048 * 5
        self.name = model_name

    
    def add(self,  load=False, device='gpu'):
        
        if load:
            self._model = Llama(model_path=model_path,
                                         n_gpu_layers=-1 if device == 'gpu' else 0,
                                         seed=17,
                                         n_ctx=self.ctx, 
                                         n_batch=512,
                                         verbose=True
                                        )

    def call(self, prompt, max_tokens=1024, temp=.75):
        if not  self._model:
            self.add( load=True, device='cpu' )


        p = prompt[:self.ctx] if len(prompt) > self.ctx else prompt
        
        
        output = self._model(
            p, 
            max_tokens=max_tokens,
            stop=["Q:"], 
            echo=False, 
            temperature=temp
        )
        

        return output.get('choices')[0].get('text')
    
    @classmethod
    def unload(cls, obj):
        llama_free_model()
        

class RemoteModelStorage(object):

    def  __init__(self):
        # run locally
        # python -m "llama_cpp.server" --model openchat-3.6-8b-20240522-IQ4_NL.gguf --n_gpu_layers=0 --port 7117
        self._client = OpenAI(base_url='http://localhost:7117/v1')
        self.name = model_name

    def add(self, load=False, device='gpu'):
        pass

    def call(self, prompt, max_tokens=10016, temp=.75):

        response = self._client.chat.completions.create(
            model="model",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": str(prompt)},
                    ],
                }
            ],
            stop=['Q:'],
            temperature=temp,
            )
        return response.choices[0].message.content


model = RemoteModelStorage()


def model_api():
    return model