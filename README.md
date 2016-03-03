# angular-xpnk
Angularjs web prototype, works with go-xpnk backend. See it in action here http://45.55.208.97:8000/XAPNIK/#/group/usv

The app tracks groups of people on Twitter. It displays their tweets from only the last 24 hours. Rather than just being a reverse chronological timeline with all the members of the group thrown in together, it organizes tweets by the "tweeter" (the person) and the group to which I've assigned them.

The blue Twitter button next to each person's avatar displays how many times that person has tweeted in the last 24 hours. Clicking the blue button reveals the tweets, themselves.

This app is powered by go-xpnk on a Digital Ocean server. The Go code does the work of keeping track of the groups, members of groups. The Go code queries Twitter every 60 seconds for new tweets, stores the new ones in a MySQL db and deletes any that are older than 24 hours from the db. It creates a JSON file for each group of the current 24 hour tweets, and the Angular app runs on that JSON file.

Very much a work in progress and not an alpha, beta or release candidate :) Expect a LOT of console.log output, comments and commented out chunks to facilitate ongoing development.
