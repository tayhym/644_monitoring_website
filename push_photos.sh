#!/bin/bash
# constantly pushes photos to remote repo 

while true; 
do 
    echo 'searching for new photos to push'
    git add . 
    git commit -m 'photo_upload'
    git push
    git push heroku master
    sleep 10

done
