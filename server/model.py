from llama_cpp import Llama


model_path="/home/anatoliy/"

class ModelStorage(object):

    def __init__(self):
        self._model = None

    
    def add(self,  load=False, device='gpu'):
        
        if load:
            self._model = Llama(model_path=model_path + "openchat_3.5.Q4_0.gguf",
                                         n_gpu_layers=-1 if device == 'gpu' else 0,
                                         seed=17,
                                         n_ctx=2048, 
                                         verbose=False
                                        )

    def call(self, prompt, max_tokens=256, temp=.75):
        if not  self._model:
            self.add( load=True )
        
        output = self._model(
            prompt, 
            max_tokens=max_tokens,
            stop=["Q:"], 
            echo=False, 
            temperature=temp
        )

        return output.get('choices')[0].get('text')
        



model = ModelStorage()


def model_api():
    return model