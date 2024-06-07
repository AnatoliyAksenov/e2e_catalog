from server.templates import templates

def what_we_do(connection, model, question, theme):
    """
    We are a team of people who are passionate about technology and technology is the future of the world.
    """
    
    prompt = templates.get('what_we_do').get('prompt').format(question=question, theme=theme)
    
    return model.call(prompt)