import os
import json
import requests

from process.promots import *
from process.models import *

# we should consider the article_data is too long, or the language is not suitable for the model[!mark]
def get_post_message(article_data:json):
    return eval(article_data['style'])+"摘要的长度大约为："+article_data['length']+"。文章题目为："+article_data['title']+"。文章内容为："+article_data['content']

# users can select the model and promots they want to use
def ask_Q(article_data: str):
    try:
        url = eval(article_data['LLMModel'])+"?access_token=" + os.environ['ACCESS_TOKEN']

        payload = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": get_post_message(article_data)
            }
        ],
        # "stream":article_data['isStreamOpen']
        # need StreamingHttpResponse
        })
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
    except Exception as e:
        print(f"Error occurred while processing request: {e}")
        return {"error": e}
    return response.text