# gpt_api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response

import logging


from process.getAbstract import ask_Q
logger = logging.getLogger(__name__)

class BotView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            res=ask_Q()
            # return Response
            # print(res)
            return Response(res)
        except Exception as e:
            logger.error(f"Error occurred while processing request: {e}", exc_info=True)
            return Response({"error": e}, status=400)
            