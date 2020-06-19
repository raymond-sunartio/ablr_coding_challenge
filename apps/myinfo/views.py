from django.http import HttpResponseBadRequest, HttpResponseServerError, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from .client import MyInfoClient
from .security import get_decoded_access_token, get_decrypted_person_data
from requests.exceptions import HTTPError
from uuid import uuid4

import functools
import json
import logging
import time

logger = logging.getLogger(__name__)


def myinfoclient_required(error_message='Unauthorised'):
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if 'MyInfoClient' not in request.session:
                return HttpResponseServerError()
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator


# Create your views here.
@require_http_methods(['GET'])
def get_authorise_url(request):
    if 'MyInfoClient' not in request.session:
        request.session['MyInfoClient'] = MyInfoClient()
    client = request.session['MyInfoClient']
    return JsonResponse({
        'status': 'OK',
        'data': {
            'authorise_url': client.get_authorise_url(str(uuid4())),
        },
    })


@require_http_methods(['POST'])
@myinfoclient_required()
def get_person(request):
    client = request.session['MyInfoClient']
    
    try:
        payload = json.loads(request.body)
        response = client.get_access_token(payload['code'])
        
        # sleep for 1 second here to avoid the following error:
        # jwt.exceptions.ImmatureSignatureError: The token is not yet valid (nbf)
        # this could be due to time not sync between my PC and server
        time.sleep(1)
        
        decoded_access_token = get_decoded_access_token(response['access_token'])
        response = client.get_person(decoded_access_token['sub'], response['access_token'])
        decrypted_person_data = get_decrypted_person_data(response)
        return JsonResponse({
            'status': 'OK',
            'data': {
                'person': decrypted_person_data,
            },
        })
    except HTTPError as e:  # errors from MyInfo API
        error = json.loads(e.response.text)
        logger.error(error)
        return JsonResponse({
            'status': 'Error',
            'details': {
                'code': error['code'],
                'message': error['message'],
            },
        })
    except: # any other errors
        return HttpResponseServerError()


@require_http_methods(['GET'])
def callback(request):
    # when user decline authorization
    error = request.GET.get('error', '')
    if error:
        error_desc = request.GET.get('error-description', '')
        return render(request, 'myinfo/index.html', {'error': error, 'error_desc': error_desc})
    
    return render(request, 'myinfo/index.html')


@require_http_methods(['GET'])
def index(request):
    return render(request, 'myinfo/index.html')
