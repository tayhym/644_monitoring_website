:loop
    matlab -r compile -nosplash -nodesktop -nodisplay
    timeout /t 20 > null
    taskkill /f /im MATLAB.exe
    
	echo 'searching for new photos to push'
	git add .
	git commit -m 'photo_upload' 
	git push 
	git push heroku master
	sleep 60000
goto loop