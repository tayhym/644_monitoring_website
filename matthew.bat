:loop
	echo 'searching for new photos to push'
	git add .
	git commit -m 'photo_upload' 
	git push 
	git push heroku master
	sleep 1000

goto loop