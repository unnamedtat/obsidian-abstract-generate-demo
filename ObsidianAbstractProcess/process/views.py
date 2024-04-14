# gpt_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response

import logging
import json


from process.getAbstract import ask_Q
logger = logging.getLogger(__name__)

class BotView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            
            res=ask_Q(data)
            # return Response
            return Response(res, status=200)
        except Exception as e:
            logger.error(f"Error occurred while processing request: {e}", exc_info=True)
            return Response({"error": e}, status=400)
            