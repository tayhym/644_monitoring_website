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
    print(os.getcwd())
    img = cloudinary.uploader.upload(img_path, public_id = 'server_img')
    print(os.getcwd())
    print(img['url'])  # returns dictionary
    analytics = cloudinary.api.resource("server_img",faces=True)
    print(analytics['faces'])

    img2 = cloudinary.uploader.upload(
    "/Users/matthew/Documents/18-644/Team_Webpage/python-getting-started/hello/static/hello/images/server_10.jpg",      
    public_id = 'server_blurred', 
    crop = 'limit',
    width = 2000,
    height = 2000,
    eager = [
    { 'width': 200, 'height': 200, 
      'crop': 'thumb', 'gravity': 'face',
      'radius': 20, 'effect': 'pixelate_faces' },
    { 'width': 100, 'height': 150, 
      'crop': 'fit', 'format': 'png' }
    ],                                     
    tags = ['special', 'for_homepage']
    )
    print(img2['url'])
    return render(request, 'home.html', {'img':img})
	

