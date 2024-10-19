from flask import Flask, request, jsonify, render_template
import random
import json
import logging
# from nltk.chat.util import Chat, reflections
app = Flask(__name__)

# Load intents
with open('intents.json', encoding='utf-8') as file:
    intents = json.load(file)

# Initialize logging
#logging.basicConfig(level=logging.DEBUG)

def get_response(intents_list, user_input):
    logging.debug(f"User input: {user_input}")
    for intent in intents_list['intents']:
        for pattern in intent['patterns']:
            if pattern in user_input:
                response = random.choice(intent['responses'])
                logging.debug(f"Matched pattern: {pattern}, Response: {response}")
                return response
    return "माफ करीं, हम ना बुझनी."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    user_query = request.json.get("query")
    #logging.debug(f"Received query: {user_query}")
    response_text = get_response(intents, user_query)
    #logging.debug(f"Generated response: {response_text}")
    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=False)
