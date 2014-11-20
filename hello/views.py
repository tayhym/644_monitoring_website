import os
from django.shortcuts import render
from django.http import HttpResponse

import cloudinary
import cloudinary.uploader
import cloudinary.api
from .models import Greeting
import requests

# Create your views here.
def index(request):
    r = requests.get('http://httpbin.org/status/418')
    print r.text
    return HttpResponse('<pre>' + r.text + '</pre>')
    #times = int(os.environ.get('TIMES',3))
    #return HttpResponse('Hello! ' * times)	

def db(request):

    greeting = Greeting()
    greeting.save()

    greetings = Greeting.objects.all()

    return render(request, 'db.html', {'greetings': greetings})

def home(request):
    img = 'img'
    # upload to cloudinary the image 
    # img = cloudinary.uploader.upload("/Users/matthew/Documents/18-644/Team_Webpage/python-getting-started/hello/static/hello/images/server_10.jpg", public_id = 'server_img')
    img_path = os.getcwd() + "/hello/static/hello/images/server_10.jpg"
    # img_path = "/app/hello/static/hello/images/server_10.jpg"

    print('testing new image path /app');
    img = cloudinary.uploader.upload(img_path, public_id = 'server_img')
    print(img['url'])  # returns dictionary
    analytics = cloudinary.api.resource("server_img",faces=True)
    print(analytics['faces'])
    num_people = len(analytics['faces']);

    img2 = cloudinary.uploader.upload(
    img_path,      
    public_id = 'server_blurred', 
    crop = 'limit',
    width = 2000,
    height = 2000,
    eager = [
    { 'width': 200, 'height': 200, 
      'crop': 'thumb', 'gravity': 'face',
      'radius': 20, 'effect': 'pixelate_faces'},
    ],                                     
    tags = ['special', 'for_homepage']
    )

    print(img2['url'])
    img_string = img2['url'].encode('ascii')
    print(img_string)
   
    idx = str.find(img_string,'upload/')
    print(idx)
    print(img_string[0:idx])
    img_blurred = img_string[0:idx] + 'upload/e_pixelate_faces/' + img_string[idx+7:len(img_string)]
    print(img_blurred)
    context = {'img':img_blurred, 'num_people':num_people}
    context['num_people'] = num_people
    if (num_people==0):
        context['empty'] = 1;

    print(context)
    print(context['num_people'])
    return render(request, 'home.html', context)
	

