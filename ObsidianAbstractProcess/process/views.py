# gpt_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response

import logging

import os
logger = logging.getLogger(__name__)

class BotView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # gpt_response = openai.Completion.create(
            #     engine="text-davinci-003",
            #     prompt=data["prompt"],
            #     max_tokens=2048
            # )
            
            return Response(os.environ['ACCESS_TOKEN'])
        except Exception as e:
            logger.error(f"Error occurred while processing request: {e}", exc_info=True)
            return Response({"error": str(e)}, status=400)
            