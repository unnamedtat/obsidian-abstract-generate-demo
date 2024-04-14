import requests
from process.urlVariable import Bot_url


def get_access_token(
    api_key: str,
    secret_key: str
) -> str:
    '''
    Get Access Token by API Key and Secret Key 
    '''

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

    response = requests.request("POST", Bot_url, headers=headers)
    return response.json().get("access_token")

