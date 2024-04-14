import os
import json
import requests

# users can select the model and promots they want to use
def ask_Q():
    try:
        url = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=" + os.environ['ACCESS_TOKEN']

        payload = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": "你好，我在测试我的功能。"
            }
        ]
        })
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
    except Exception as e:
        print(f"Error occurred while processing request: {e}")
        return {"error": e}
    return response.text