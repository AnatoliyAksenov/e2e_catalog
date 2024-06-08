import os
from llama_cpp import Llama


model_file = "Llama-3-8B-Instruct-Gradient-1048k-IQ4_NL.gguf"

model_name =  "Llama-3-8B-Instruct-Gradient-1048k-IQ4_NL"

model_path = os.path.join("/home/anatoliy/", model_file)

class ModelStorage(object):

    def __init__(self):
        self._model = None
        self.ctx = 2048
        self.name = model_name

    
    def add(self,  load=False, device='gpu'):
        
        if load:
            self._model = Llama(model_path=model_path,
                                         n_gpu_layers=-1 if device == 'gpu' else 0,
                                         seed=17,
                                         n_ctx=self.ctx, 
                                         n_batch=512,
                                         verbose=False
                                        )

    def call(self, prompt, max_tokens=1024, temp=.75):
        if not  self._model:
            self.add( load=True )


        p = prompt[:self.ctx] if len(prompt) < self.ctx else prompt
        
        
        output = self._model(
            p, 
            max_tokens=max_tokens,
            stop=["Q:"], 
            echo=False, 
            temperature=temp
        )

        return output.get('choices')[0].get('text')
        



model = ModelStorage()


def model_api():
    return model